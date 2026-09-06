CHANGES
=======
Version 1.2.0 - 2026-09-XX
------------------
Client support for the NPC simulation extracted into the new `ships-npc`
service: hostile enemy ships, ramming, an admin panel to tune them live, and
the memory and correctness fixes that playing against a fleet exposed.

NPCs
- NPCs now arrive under `npcs` in the `gameBroadcast` payload instead of
  `blackHoles`, since the backend's NPC logic moved to `ships-npc`.
- Enemy Ship NPCs are drawn through the existing `Player` class and rendering
  path: hostile ships that chase and shoot, appear on the radar, and can be
  destroyed. The client self-detects being hit by their bullets - reusing the
  existing `playerHit` damage/death/respawn/kill-feed handling untouched - and
  reports its own hits via the new `npcHit` event. An NPC killer is named in
  the kill feed like a player, but kill credit and ship scale still apply only
  to real players, since an NPC's size is owned by `ships-npc`.
- Ramming: any two overlapping ships, players or NPCs, push each other apart
  along the axis of least penetration and take small, rate-limited damage.
  Detection is purely client-side and needs no backend change; kill credit
  still tells a player-caused death from an NPC-caused one via `fromNpc`.
  Both ships are damaged, not just the one doing the looking: between two
  players that already happened, since each client damages itself and every
  client runs the same check, but an NPC has no client, so ramming one is
  also reported with an `npcHit` carrying no bullet. Without it a collision
  hurt only the player - a free advantage for the NPC.
- Ships growing with their score is now an admin setting, and off by
  default. A ship's size still normalises every hull to a common base; only
  the kills-minus-deaths term is dropped, since removing the base too would
  render each ship at whatever its artwork happens to measure - a different
  change entirely. Switching it re-measures everyone already on screen,
  because a ship only sizes itself when something changes, and the size is
  also its collision box. NPC ships are unaffected: their scale is owned by
  ships-npc.
- The size every ship is drawn at is an admin setting, defaulting to the 100
  the client used to hardcode. It normalises every hull to one size whatever
  its artwork measures, so a 400px ship and a 100px one meet as equals, and
  it is the collision box as well as the picture. Changing it re-measures
  everyone already on screen - players and NPC ships alike, since NPC ships
  are drawn through the same class and normalised the same way.
- Black holes are on the radar, as a yellow circle drawn to scale and drawn
  over every ship blip. They were missing from it entirely, which made the
  one thing on the map that kills without shooting the one thing the radar
  did not warn about. Blips are now placed by ship centres rather than
  top-left corners, which matters for something hundreds of units across.
- A ship's name is drawn centred over it. It was aligned from the ship's
  left edge, so the label sat further off centre the longer the name.
- Contact damage can be switched off for everyone from the admin panel. The
  value arrives as a new `gameSettings` event (on connect, and again the
  moment an admin saves) rather than being read at page load, so it applies
  to players already in the game. Ships still push each other apart when it
  is off; only the damage stops.
- The scoreboard (Tab, or automatically on death) lists the enemy NPC ships
  after the players with the same Name/Kills/Deaths columns. Their score is
  meaningful because `ships-npc` revives a killed ship under its original
  identity. With a large fleet it keeps as many rows as fit on screen and
  ends with a "+N more" row instead of running off the bottom.
- Shots are only audible in or just outside the visible area. An NPC fleet
  fires across the whole map, so playing every shot was a constant roar as
  well as pointless work.
- The player payload now carries the ship's raw width and height. A shipId
  alone cannot describe a ship to anyone else, because the public ship list
  cannot contain a player's own painting project, and NPCs need the real
  numbers to aim at the middle of one. See ships-npc/CHANGES.md 1.0.0.

Admin panel
- The NPCs are tuned while the game runs: which of the two NPC fleets are
  flying (the rule-based `[NPC]` ships, the neural-network `[AI]` ships,
  both, or neither), how many of each - up to 100 per fleet - plus life,
  speed, fire rate and the black hole cap and spawn period. Values are saved
  through the existing admin endpoints and relayed by ships-go to ships-npc,
  which applies them on its next tick. The controller owns the decision and
  an inactive fleet's count is disabled rather than merely ignored: the two
  otherwise say the same thing in two places, and typing "1 AI ship" while
  the controller reads "Rules only" saved happily and spawned nothing. The
  number itself is kept, so switching a fleet off and back on restores it.
- Who attacks whom is a grid, not a checkbox: a row per attacking fleet, a
  column per target (players, `[NPC]`, `[AI]`), so any combination can be set
  up - AI against NPC only, both fleets ignoring players, everyone against
  everyone. Shown as a table because six loose checkboxes are unreadable,
  whereas the grid makes the whole rule set legible at a glance.
- The panel was rebuilt as a responsive card grid with a sticky save bar,
  after it grew past what a single flat column of inputs could carry. It
  reflows to one column on a narrow screen, and the two fleets are colour
  tagged so the settings match the names seen in game.
- Speed is expressed in the game's own units (1-50, where 50 is a player's
  top speed) rather than a 0-1 fraction, which is far more meaningful to tune
  against.
- The rules that apply to everyone - ship life, ship size, contact damage and
  score scaling - are grouped in their own "Game rules" card, rather than
  sitting under the attack matrix they have nothing to do with. Ship life
  moved there from the NPC-only "Ship tuning" card, because it now really is
  everyone's: the player used to spawn with a hardcoded 10 however high an
  admin set it, so raising it armoured the NPCs and nobody else. A player now
  spawns with the configured life, and like an NPC keeps the life they
  spawned with when the setting changes mid-flight.
- Fields respect the minimum and maximum shown on screen, and the saved
  values are re-read from the response, so anything clamped server-side is
  corrected on screen instead of silently differing from what is running.

Bugfixes
- Three leaks that made memory grow without bound during play:
  - Bullets fired by *other* players were never expired locally; they were
    only dropped on an explicit `removeBullet` broadcast, which is sent by
    the player that gets *hit*. Every shot that missed therefore stayed in
    `this.bullets` for the whole session, moved and drawn every frame. They
    are now expired locally for everyone, which needs no extra traffic and
    cannot desync: `isExpired()` is pure geometry derived from the
    `newBullet` payload, so every client agrees at the same moment.
  - `wsQueue` is only drained while the socket is open, but `sendData` keeps
    pushing ~30 times a second regardless, so a disconnection grew the queue
    without limit and flushed thousands of stale snapshots on reconnect. It
    is now capped by length; dropping only superseded position snapshots
    still let a long disconnect grow it and replay seconds-old damage.
  - Leaving the game view did not stop the game. `GameView.vue` only removed
    the injected `<script>`, which does nothing to code already running: the
    `requestAnimationFrame` loop rescheduled itself, the flush interval was
    never cleared, and the socket and listeners stayed live. Each visit left
    an entire `Game` behind - still rendering, still holding its canvases,
    players and bullets, still counted as a player by ships-go. `Game` now
    has a `destroy()` that cancels the loop and interval, closes the socket
    without triggering reconnection, detaches every listener registered in
    `loadEvents()` and releases the collections; `GameView.vue` calls it on
    unmount.
- Coming back to a backgrounded tab replayed everything that had happened
  while it was away: every explosion at once, a wall of bullets, and the
  whole kill feed. Browsers stop `requestAnimationFrame` entirely for a
  hidden tab, and the game advances *everything* from that loop - while the
  websocket keeps delivering. Animations counted frames per draw call and
  messages faded by a fixed step per draw, so anything created in the
  background froze at its first frame and started only on the first frame
  back. Animation frames and message fading are now measured in wall-clock
  time, so anything nobody watched is simply over by the time they look;
  explosions are not built at all while hidden (an `Animation` renders every
  frame into an offscreen canvas the moment it is constructed, so a fleet's
  worth of them was also real memory); the kill feed is capped; and incoming
  bullets are dropped while hidden and cleared on return, since none of them
  could have hit anything - the collision pass is part of the same paused
  loop - and resolving them late meant a wall of bullets and possibly an
  instant death on returning.
- You were missing from the scoreboard and the radar - playing alone the
  table was just its headers. You are added to the player list as soon as the
  connection is acknowledged, but the list is pruned against the broadcast's
  activePlayerIds, which a player only enters once ships-go has processed
  their first playerData frame. A broadcast arriving in between deleted you,
  and nothing put you back, because incoming updates deliberately skip your
  own socketId. NPCs turned a rare race into a near-certain one: with a fleet
  on the map there is something to broadcast every tick rather than once
  every two seconds. We are obviously still connected, so we are no longer
  prunable, and are restored if ever absent.
- Long-standing: a player joining an in-progress game saw every other ship at
  its default size with a zeroed scoreboard, because kills/deaths were only
  counted from `playerDied` events that client personally witnessed.
  `updatePlayers` now also reads the `kills`/`deaths` already present in the
  broadcast (ships-go has always relayed them) and recalculates the ship's
  scale when they move. The two sources are merged by keeping the highest
  value, since both only grow; this stops the scale flickering back a step
  when a kill is witnessed before its owner's next state update reflects it.
- The game tab grew to gigabytes of memory during a long session.
  `gameSounds` cloned its <audio> element on every single shot, and with a
  full NPC fleet the client receives ~35 newBullet events a second - so ~35
  fresh HTMLAudioElements per second, each decoding shot.wav (308 KB of
  uncompressed PCM) into its own native buffer. Those buffers live outside
  the JS heap, so V8 felt no pressure to collect them: the heap stayed flat
  at ~10 MB while the tab climbed past 2 GB. Sounds now play from a fixed
  pool of preloaded elements (8 shot voices, 4 explosion). Measured
  headless: 12 elements at startup and still 12 after a minute of combat,
  against ~2000 before.
- A player flying a custom ship broke every other client. A client only knows
  the generic ships plus its *own* custom ones, so anyone else's custom
  `shipId` was missing from `ShipsManager`, `getShipById` returned undefined
  and `new Player(...)` threw on `ship.layers`. Thrown from the initial
  `updatePlayers()` pass, that aborted setup and left the game with no local
  player at all; the same failure stopped the admin panel's status map
  drawing entirely. Unknown ships now fall back to a generic hull in both, so
  they are merely drawn wrong instead of breaking the session.
- Security: player names were inserted as HTML into the status monitor, which
  the admin panel embeds. Any player could pick a name that ran code in the
  administrator's browser, once a second, for as long as they were online.
  Names are now inserted as text.
- The admin status map rebuilt every player's sprite once a second,
  allocating a canvas each time; sprites are now reused.
- Leaving and re-entering the game leaked a full copy of the ship catalogue
  every time. The preload script attached three key listeners that were never
  removed, and because the module is loaded with a cache-busting url each
  visit created a brand new copy of it, kept alive forever by those
  listeners. It also broke Tab navigation everywhere else in the site for the
  rest of the session. Tab is now suppressed by the game itself, which
  already detaches its own listeners on exit.
- Removed a black hole scale that was silently discarded and two dead
  functions.

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