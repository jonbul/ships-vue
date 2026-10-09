<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
const injectedScripts: HTMLScriptElement[] = [];
onMounted(() => {
  const scripts = ["/js/canvas/admin.js",]
  for (const scriptSrc of scripts) {
    const script = document.createElement('script');
    script.src = `${scriptSrc}?t=${Date.now()}`;
    script.type = 'module';
    document.body.appendChild(script);
    injectedScripts.push(script);
  }
});
onUnmounted(() => {
  injectedScripts.forEach(script => script.remove());
  injectedScripts.length = 0;
});
</script>

<template>
  <div class="admin">
    <header class="admin-header">
      <h1>Administration panel</h1>
      <p>Everything here applies to the running game immediately, with nothing to restart.</p>
    </header>

    <div class="admin-grid">
      <section class="card">
        <h2>Game</h2>
        <div class="field">
          <label for="resolution">Resolution</label>
          <select id="resolution" required autofocus name="resolution"></select>
        </div>
        <div class="field">
          <label for="allowedPlayerType">Players allowed</label>
          <select id="allowedPlayerType" required name="allowedPlayerType"></select>
        </div>
      </section>

      <section class="card">
        <h2>Fleets</h2>
        <p class="hint">
          Simulated by ships-npc. Two controllers can fly the hostile ships: the
          hand-written one, and a small neural network running inside the same
          service. Each fleet has its own size, so switching away and back keeps
          the number you set.
        </p>
        <div class="field">
          <label for="enemyShipController">Controller</label>
          <select id="enemyShipController" name="enemyShipController">
            <option value="none">None &mdash; no hostile ships</option>
            <option value="rule">Rules only &mdash; [NPC] ships</option>
            <option value="ai">AI only &mdash; [AI] ships</option>
            <option value="both">Both &mdash; run them side by side</option>
          </select>
        </div>
<div class="field-row">
          <div class="field" id="enemyShipsField">
            <label for="enemyShips"><span class="tag tag-npc">[NPC]</span> ships</label>
            <input id="enemyShips" type="number" min="0" max="100" step="1" />
            <small class="off-note">Fleet is off &mdash; enable it in Controller.</small>
          </div>
          <div class="field" id="aiShipsField">
            <label for="aiShips"><span class="tag tag-ai">[AI]</span> ships</label>
            <input id="aiShips" type="number" min="0" max="100" step="1" />
            <small class="off-note">Fleet is off &mdash; enable it in Controller.</small>
          </div>
        </div>
        <small class="hint">
          Up to 100 per fleet, so &ldquo;Both&rdquo; can put 200 ships on the map.
          Anything past a few dozen is a load test rather than a game.
        </small>
      </section>

      <section class="card">
        <h2>Ship tuning</h2>
        <p class="hint">Shared by both fleets, so a comparison between them stays fair.</p>
        <div class="field">
          <label for="enemyShipSpeed">Speed</label>
          <input id="enemyShipSpeed" type="number" min="1" max="50" step="1" />
          <small>In the game's own units. A player's top speed is 50, so 50 means they can never be outrun.</small>
        </div>
        <div class="field">
          <label for="enemyShipFireRateMs">Fire rate (ms)</label>
          <input id="enemyShipFireRateMs" type="number" min="100" max="10000" step="100" />
          <small>Delay between shots. Lower is deadlier.</small>
        </div>
      </section>

      <section class="card">
        <h2>Black holes</h2>
        <div class="field">
          <label for="maxBlackHoles">Maximum at once</label>
          <input id="maxBlackHoles" type="number" min="0" max="50" step="1" />
          <small>0 stops new ones; the existing ones still fade out.</small>
        </div>
        <div class="field">
          <label for="blackHoleSpawnPeriodSec">Spawn period (s)</label>
          <input id="blackHoleSpawnPeriodSec" type="number" min="1" max="600" step="1" />
        </div>
        <div class="field">
          <label for="blackHoleDurationSec">Duration (s)</label>
          <input id="blackHoleDurationSec" type="number" min="5" max="3600" step="5" />
          <small>
            How long one lives before it shrinks away. Applied to the black holes
            already on the map, so shortening it clears them rather than only
            affecting the next one.
          </small>
        </div>
        <p class="hint">
          Lethal to ships of both fleets exactly as they are to players, and escaping
          one always outranks hunting.
        </p>
      </section>

      <section class="card card-wide">
        <h2>Who attacks whom</h2>
        <p class="hint">
          Any combination is allowed. A fleet only hunts &mdash; and only damages &mdash;
          what is ticked on its row, so leaving a row empty gives a fleet that flies and
          dodges but never shoots, and ticking a fleet against itself makes it fight among
          its own ships. Players, of course, shoot whoever they like.
        </p>
        <table class="matrix">
          <thead>
            <tr>
              <th>Attacker</th>
              <th>Players</th>
              <th><span class="tag tag-npc">[NPC]</span></th>
              <th><span class="tag tag-ai">[AI]</span></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th><span class="tag tag-npc">[NPC]</span> rule-flown</th>
              <td><input id="npcAttacksPlayers" type="checkbox" aria-label="NPC ships attack players" /></td>
              <td><input id="npcAttacksNpc" type="checkbox" aria-label="NPC ships attack NPC ships" /></td>
              <td><input id="npcAttacksAi" type="checkbox" aria-label="NPC ships attack AI ships" /></td>
            </tr>
            <tr>
              <th><span class="tag tag-ai">[AI]</span> network-flown</th>
              <td><input id="aiAttacksPlayers" type="checkbox" aria-label="AI ships attack players" /></td>
              <td><input id="aiAttacksNpc" type="checkbox" aria-label="AI ships attack NPC ships" /></td>
              <td><input id="aiAttacksAi" type="checkbox" aria-label="AI ships attack AI ships" /></td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="card card-wide">
        <h2>Game rules</h2>
        <p class="hint">
          These apply to everyone on the map &mdash; players and both NPC fleets alike.
          Ship-to-ship contact and ship sizing are worked out by each player's own
          browser, so a change here is pushed to everyone who is already playing.
        </p>
        <div class="field">
          <label for="shipLife">Ship life</label>
          <input id="shipLife" type="number" min="1" max="200" step="1" />
          <small>
            Damage a ship absorbs before dying, for players and both NPC fleets alike.
            Ships already flying keep the life they spawned with; a change applies to
            everyone from their next spawn onwards. 10 is the standard.
          </small>
        </div>

        <div class="field">
          <label for="shipSize">Ship size</label>
          <input id="shipSize" type="number" min="20" max="1000" step="10" />
          <small>
            The size every ship is drawn at when it enters the game, whatever its artwork
            measures &mdash; so a 400px hull and a 100px one meet as equals. This is the
            collision box as well as the picture. 100 is the standard.
          </small>
        </div>

        <div class="field checkbox-field">
          <label for="contactDamage">
            <input id="contactDamage" type="checkbox" />
            Ships take damage when they touch
          </label>
          <small>
            Applies to everyone &mdash; players, <span class="tag tag-npc">[NPC]</span> and
            <span class="tag tag-ai">[AI]</span> alike &mdash; and ignores the attack grid:
            a collision hurts both ships even if neither is allowed to shoot the other.
            Ships still push each other apart when this is off; only the damage stops.
          </small>
        </div>

        <div class="field checkbox-field">
          <label for="killScaling">
            <input id="killScaling" type="checkbox" />
            Ships grow with their score
          </label>
          <small>
            A player's ship is resized by kills minus deaths, so someone on a streak
            becomes visibly bigger &mdash; and a bigger target, since this changes the
            collision box too. Off by default. NPC ships are unaffected: their size is
            owned by ships-npc.
          </small>
        </div>
      </section>
    </div>

    <div class="save-bar">
      <button type="button" id="save">Save</button>
      <span id="saveStatus"></span>
    </div>

    <section class="card card-wide monitor">
      <h2>Live status</h2>
      <iframe id="statusMonitor" src="" title="Live game status"></iframe>
    </section>
  </div>
</template>

<style scoped>
.checkbox-field {
  margin-top: 1.25rem;
}

.checkbox-field label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

/* A fleet whose controller is switched off: the count is kept (so switching
   back restores it) but must not look editable, or a number typed here reads
   as "1 AI ship" while nothing spawns. */
.field.fleet-off label,
.field.fleet-off input {
  opacity: 0.45;
}

.off-note {
  display: none;
  color: #f0b429;
}

.field.fleet-off .off-note {
  display: block;
}

.admin {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 16px 96px;
  color: #212529;
}

.admin-header h1 {
  font-weight: 200;
  font-size: 2rem;
  margin: 0 0 4px;
}

.admin-header p {
  margin: 0 0 20px;
  color: #6c757d;
}

/* auto-fit rather than a fixed column count, so the cards reflow down to a
   single column on a narrow screen without a media query per breakpoint. */
.admin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  align-items: start;
}

.card {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  padding: 16px 18px;
}

.card-wide {
  grid-column: 1 / -1;
}

.card h2 {
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #495057;
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e9ecef;
}

.field {
  margin-bottom: 14px;
}

.field-row {
  display: flex;
  gap: 12px;
}

.field-row .field {
  flex: 1;
}

.field label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.field input[type="number"],
.field select {
  width: 100%;
  box-sizing: border-box;
  padding: 8px 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background: #fff;
  color: #495057;
  font-size: 0.95rem;
}

.field input[type="number"]:focus,
.field select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15);
}

.field small,
.hint {
  display: block;
  color: #6c757d;
  font-size: 0.8rem;
  margin-top: 4px;
}

.hint {
  margin: 0 0 12px;
}

.tag {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.75rem;
  padding: 1px 5px;
  border-radius: 3px;
  white-space: nowrap;
}

.tag-npc {
  background: #e7f1ff;
  color: #0b5ed7;
}

.tag-ai {
  background: #e8f8f0;
  color: #0f7a4d;
}

.matrix {
  width: 100%;
  border-collapse: collapse;
}

.matrix th,
.matrix td {
  padding: 10px 8px;
  border-bottom: 1px solid #f1f3f5;
  text-align: center;
  font-size: 0.9rem;
}

.matrix thead th {
  color: #6c757d;
  font-weight: 600;
}

.matrix tbody th {
  text-align: left;
  font-weight: 500;
}

.matrix input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

/* Sticky, because the matrix and the fleet sizes are far enough apart that a
   save button at the bottom of the page is easy to miss after changing one. */
.save-bar {
  position: sticky;
  bottom: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding: 12px 0;
  background: linear-gradient(to top, #f8f9fa 70%, rgba(248, 249, 250, 0));
}

.save-bar button {
  background-color: #0d6efd;
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.save-bar button:hover {
  background-color: #0b5ed7;
}

.save-bar span {
  color: #6c757d;
  font-size: 0.9rem;
}

.monitor {
  margin-top: 8px;
}

.monitor iframe {
  width: 100%;
  height: 1030px;
  border: 1px solid #e9ecef;
  border-radius: 4px;
}
</style>
