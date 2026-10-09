import { asyncRequest } from "/js/utils/functions.js";

async function load() {
  const data = await asyncRequest({ path: '/game/admin/data' });
  const selectAllowedPlayerType = document.getElementById("allowedPlayerType");
  const selectResolution = document.getElementById("resolution");

  // NPC settings are simulated by ships-npc, which the browser can't
  // reach: they're saved here like any other admin setting and ships-go
  // pushes them down its websocket to ships-npc.
  const npcFields = {
    enemyShipController: 'string',
    enemyShips: 'int',
    aiShips: 'int',
    shipLife: 'float',
    enemyShipSpeed: 'float',
    enemyShipFireRateMs: 'int',
    maxBlackHoles: 'int',
    blackHoleSpawnPeriodSec: 'int',
    blackHoleDurationSec: 'int',
    // The attack matrix: one cell per (attacker, target) pair.
    npcAttacksPlayers: 'bool',
    npcAttacksNpc: 'bool',
    npcAttacksAi: 'bool',
    aiAttacksPlayers: 'bool',
    aiAttacksNpc: 'bool',
    aiAttacksAi: 'bool',
    // Not an NPC-only rule: ships-go broadcasts this one to every player's
    // browser too, since ship-to-ship contact is resolved client-side.
    contactDamage: 'bool',
    killScaling: 'bool',
    shipSize: 'int',
  };
  const npcInputs = {};
  for (const name in npcFields) {
    npcInputs[name] = document.getElementById(name);
  }

  const readNpcSettings = () => {
    const settings = {};
    for (const name in npcFields) {
      // The element can legitimately be missing: load() is async, so this
      // may run after the view unmounted, and a renamed id in AdminView
      // would otherwise throw here and abort the whole save.
      const input = npcInputs[name];
      if (!input) continue;
      if (npcFields[name] === 'bool') {
        settings[name] = !!input.checked;
        continue;
      }
      if (npcFields[name] === 'string') {
        settings[name] = input.value;
        continue;
      }
      let value = npcFields[name] === 'int'
        ? parseInt(input.value, 10)
        : parseFloat(input.value);
      // Skip anything unparseable rather than sending NaN: ships-npc would
      // just fall back to its default, silently discarding the other edits.
      if (Number.isNaN(value)) continue;
      // The min/max in the template are otherwise decorative - nothing calls
      // reportValidity(), so an out-of-range number is submitted as typed.
      // ships-npc clamps too; this keeps the on-screen bounds honest.
      const min = parseFloat(input.min);
      const max = parseFloat(input.max);
      if (!Number.isNaN(min)) value = Math.max(min, value);
      if (!Number.isNaN(max)) value = Math.min(max, value);
      input.value = value;
      settings[name] = value;
    }
    return settings;
  };

  // A fleet's size and the controller choice are two ways of saying the same
  // thing, and disagreeing about it is silent: setting "1 AI ship" while the
  // controller is "Rules only" saves happily and spawns nothing. So the
  // controller owns the decision and an inactive fleet's count is disabled,
  // not merely ignored. The count itself is preserved, so switching a fleet
  // off and back on keeps the number.
  const fleetsFor = { none: [], rule: ['enemyShips'], ai: ['aiShips'], both: ['enemyShips', 'aiShips'] };
  const syncFleetAvailability = () => {
    const controller = npcInputs.enemyShipController;
    const active = fleetsFor[controller ? controller.value : 'rule'] || [];
    for (const name of ['enemyShips', 'aiShips']) {
      const input = npcInputs[name];
      const field = document.getElementById(name + 'Field');
      const on = active.includes(name);
      if (input) input.disabled = !on;
      if (field) field.classList.toggle('fleet-off', !on);
    }
  };

  const writeNpcSettings = (settings) => {
    if (!settings) return;
    for (const name in npcFields) {
      if (!npcInputs[name] || settings[name] === undefined) continue;
      if (npcFields[name] === 'bool') {
        npcInputs[name].checked = !!settings[name];
      } else {
        npcInputs[name].value = settings[name];
      }
    }
  };

  writeNpcSettings(data.npcSettings);
  syncFleetAvailability();
  npcInputs.enemyShipController?.addEventListener('change', syncFleetAvailability);

  const saveStatus = document.getElementById("saveStatus");
  document.getElementById("save").addEventListener("click", async (e) => {
    e.preventDefault();
    const allowedPlayerType = selectAllowedPlayerType.value;
    const resolution = selectResolution.value;
    const response = await asyncRequest({
      path: '/game/admin',
      method: 'POST',
      data: { allowedPlayerType, resolution, npcSettings: readNpcSettings() }
    });
    // ships-npc clamps the NPC values it receives, so echo back what was
    // actually applied instead of leaving a rejected value on screen.
    writeNpcSettings(response?.npcSettings);
    syncFleetAvailability();
    if (saveStatus) {
      saveStatus.textContent = response?.success ? 'Saved' : 'Save failed';
      setTimeout(() => { saveStatus.textContent = ''; }, 3000);
    }
  });

  for (const type in data.allowedPlayerTypes) {
    const option = document.createElement("option");
    option.value = data.allowedPlayerTypes[type];
    option.textContent = type;
    if (data.allowedPlayerType === data.allowedPlayerTypes[type]) {
      option.selected = true;
    }
    selectAllowedPlayerType.appendChild(option);
  }
  for (let i = 0; i < data.resolutions.length; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = data.resolutions[i].name;
    if (data.currentResolution === i) {
      option.selected = true;
    }
    selectResolution.appendChild(option);
  }

  const statusMonitor = document.getElementById("statusMonitor");
  const host = location.host.substring(0, location.host.indexOf(":")) || location.host;
  statusMonitor.setAttribute("src", location.protocol + "//" + host + ":3000" + "/status");
}
load();