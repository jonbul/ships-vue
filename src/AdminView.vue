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
  <div class="container admin">
    <div class="form-register" id="form-register">
      <h1 class="h3 mb-3 font-weight-normal">Administration panel</h1>

      <div class="form-group">
        <label for="resolution" class="">Resolution</label>
        <select id="resolution" class="form-control" required autofocus name="resolution" value="">

        </select>
      </div>

      <div class="form-group">
        <label for="allowedPlayerType" class="">Players allowed</label>
        <select id="allowedPlayerType" class="form-control" required name="allowedPlayerType">

        </select>
      </div>

      <h2 class="h5 mt-4">NPCs</h2>
      <p class="text-muted small">
        Simulated by ships-npc. Changes apply immediately, with nothing to restart.
      </p>

      <div class="form-group">
        <label for="enemyShips">Enemy ships</label>
        <input id="enemyShips" class="form-control" type="number" min="0" max="20" step="1" />
        <small class="form-text text-muted">How many hostile ships hunt the players at once. 0 disables them.</small>
      </div>

      <div class="form-group">
        <label for="enemyShipLife">Enemy ship life</label>
        <input id="enemyShipLife" class="form-control" type="number" min="1" max="200" step="1" />
        <small class="form-text text-muted">Damage a new enemy ship takes before dying. Ships already in play keep their old value.</small>
      </div>

      <div class="form-group">
        <label for="enemyShipSpeed">Enemy ship speed</label>
        <input id="enemyShipSpeed" class="form-control" type="number" min="1" max="50" step="1" />
        <small class="form-text text-muted">In the game's own speed units. A player's top speed is 50, so 50 means they can never be outrun.</small>
      </div>

      <div class="form-group">
        <label for="enemyShipFireRateMs">Enemy ship fire rate (ms)</label>
        <input id="enemyShipFireRateMs" class="form-control" type="number" min="100" max="10000" step="100" />
        <small class="form-text text-muted">Delay between shots. Lower is deadlier.</small>
      </div>

      <div class="form-group">
        <label for="maxBlackHoles">Max black holes</label>
        <input id="maxBlackHoles" class="form-control" type="number" min="0" max="50" step="1" />
        <small class="form-text text-muted">Cap on black holes alive at once. 0 stops new ones; existing ones still fade out.</small>
      </div>

      <div class="form-group">
        <label for="blackHoleSpawnPeriodSec">Black hole spawn period (s)</label>
        <input id="blackHoleSpawnPeriodSec" class="form-control" type="number" min="1" max="600" step="1" />
        <small class="form-text text-muted">Delay between black hole spawns.</small>
      </div>

      <button class="btn btn-lg btn-primary btn-block" type="button" id="save">Save</button>
      <span id="saveStatus" class="ml-2"></span>
      <iframe id="statusMonitor" src=""
        style="width:100%; height: 1030px; border: solid 1px #ccc; margin-top:20px;"></iframe>
    </div>
  </div>
</template>

<style scoped></style>