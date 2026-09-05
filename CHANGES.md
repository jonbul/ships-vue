CHANGES
=======
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