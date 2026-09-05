CHANGES
=======
Version 1.3.8 - 2026-09-05
------------------
- The admin panel's enemy ship speed field is now in the game's own speed
  units (1-50, where 50 is a player's top speed) instead of a 0-1 fraction,
  which is a far more meaningful number to tune against.

Version 1.3.7 - 2026-09-05
------------------
- The admin panel can now tune the NPCs while the game is running: number
  of enemy ships (0 disables them), their life, their speed as a fraction
  of a player's top speed, their fire rate, and the black hole cap and
  spawn period. They're saved through the existing admin endpoints;
  ships-go relays them to ships-npc, which applies them on its next tick.
  The saved values are re-read from the response, so a value that was
  clamped server-side is corrected on screen instead of silently differing
  from what's actually running.

Version 1.3.6 - 2026-09-05
------------------
- Bugfix (memory): three leaks that made the tab's memory grow without
  bound during play.
  - Bullets fired by *other* players were never expired locally. They were
    only ever dropped on an explicit `removeBullet` broadcast, which is
    sent by the player that gets *hit*, so every shot that missed stayed in
    `this.bullets` for the rest of the session, being moved and drawn every
    frame. Bullets are now expired locally for everyone. This needs no
    extra traffic and cannot desync: `isExpired()` is pure geometry derived
    from the `newBullet` payload, so every client reaches the same
    conclusion at the same time.
  - `wsQueue` is only drained while the socket is open, but `sendData` keeps
    pushing ~30 times a second regardless, so a disconnection grew the queue
    without limit (and then flushed thousands of stale snapshots on
    reconnect). Past `WS_QUEUE_PRUNE_AT` queued messages, superseded
    `playerData` snapshots are dropped on push - only the newest one is
    meaningful.
  - Leaving the game view did not stop the game. `GameView.vue` only removed
    the injected `<script>` element, which does nothing to code that is
    already running: the `requestAnimationFrame` loop rescheduled itself
    unconditionally, the websocket flush interval was never cleared, the
    socket stayed open and the document/window listeners stayed bound. Each
    visit to the view therefore left an entire live `Game` behind - still
    rendering, still holding its canvases, players and bullets, and still
    holding a connection that ships-go counted as a player. `Game` now has a
    `destroy()` that cancels the loop and interval, closes the socket
    without triggering the reconnect logic, detaches every listener
    registered in `loadEvents()` and releases the collections; `GameView.vue`
    calls it on unmount.

Version 1.3.5 - 2026-09-05
------------------
- Bugfix (long-standing): a player joining an in-progress game saw every
  other ship at its default size and with a zeroed scoreboard, because
  kills/deaths were only ever tracked from the `playerDied` events that
  client personally witnessed - everything that happened before it
  connected was invisible to it. `updatePlayers` now also reads the
  `kills`/`deaths` already present in the `gameBroadcast` player data
  (ships-go has always relayed them; nothing needed to change there) and
  recalculates the ship's scale when they move. The two sources are merged
  by keeping the highest value, since both only ever grow: this avoids the
  scale flickering back a step when a kill is witnessed before its owner's
  next state update reflects it.

Version 1.3.4 - 2026-09-05
------------------
- Bugfix: on entering the game the player was flung downwards at high speed
  and destroyed, with no input. `this.players` also holds an entry for the
  local player itself (as the pre-existing `checkCollisionsWithPlayers`
  guard shows), and the new ship-ramming check didn't skip it - so the
  player permanently overlapped a copy of itself, getting pushed a full
  ship-height every frame plus self-inflicted ram damage. It now skips its
  own entry.

Version 1.3.3 - 2026-09-05
------------------
- Ramming now works between real players too, not just against enemy Ship
  NPCs - any two overlapping ships push each other apart and take small,
  rate-limited damage (`checkShipBodyCollision`, generalized from the
  NPC-only version). Kill-credit/animation still tell a player-caused death
  apart from an NPC-caused one via the existing `fromNpc` field.

Version 1.3.2 - 2026-09-05
------------------
- New: ramming an enemy Ship NPC now actually does something. On overlap,
  the player is pushed back out along the axis of least penetration (so it
  can't sit inside the ship) and takes small, rate-limited damage (reuses
  the existing `playerHit` handling/black-hole-hit convention - no bullet,
  `bulletId: null`, `fromNpc: 'Ship'`). Purely client-side detection, no
  ships-go/ships-npc changes needed.

Version 1.3.1 - 2026-09-05
------------------
- Bugfix: enemy Ship NPCs didn't show up on the radar (radar only looked at
  `this.players`, not `this.NPCs`).
- Bugfix: killing an enemy Ship NPC threw `TypeError: can't access property
  "deaths", playerDied is undefined` - `onPlayerDied` only looked up real
  players; it now also resolves NPC ids and skips death-stat bookkeeping for
  non-player targets.

Version 1.3.0 - 2026-09-05
------------------
- Renders the new enemy Ship NPC (from `ships-npc`) using the existing
  `Player` class/rendering path - appears as a hostile ship that chases and
  shoots at players, and can be destroyed.
- Self-detects being hit by an enemy ship's bullets, reusing the existing
  `playerHit` handling untouched (damage/death/respawn/kill-feed).
- Detects the player's own bullets hitting an enemy ship and reports it via
  the new `npcHit` websocket event.

Version 1.2.0 - 2026-09-XX
------------------
- Adapted to backend `gameBroadcast` payload change: NPCs are now sent
  under `npcs` instead of `blackHoles` (backend NPC logic moved to the new
  `ships-npc` service, no visible gameplay change).

Version 1.1.0 - 2026-09-04
------------------
- Black hole
    [X] Appears when an event is received
    [X] Disappears after a time elapsed
    [X] Moves through the map
    [X] Affects other players
    [X] Kills players on contact

Version 1.0.2 - 2026-08-09
------------------
* Parsing values editing shapes bugfix 

Version 1.0.1 - 2026-08-04
------------------
* Black hole animation only
* Fixing ghost

2026-08-02 -> 1.0.0
--------------------------------
* Adapted to back refactoring for first version

2026-03-19 -> 0.1.0
--------------------------------
* Project creation migrated from Express