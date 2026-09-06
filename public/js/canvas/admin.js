import { asyncRequest } from "/js/utils/functions.js";

async function load() {
  const data = await asyncRequest({ path: '/game/admin/data' });
  const selectAllowedPlayerType = document.getElementById("allowedPlayerType");
  const selectResolution = document.getElementById("resolution");

  // NPC settings are simulated by ships-npc, which the browser can't
  // reach: they're saved here like any other admin setting and ships-go
  // pushes them down its websocket to ships-npc.
  const npcFields = {
    enemyShips: 'int',
    enemyShipLife: 'float',
    enemyShipSpeed: 'float',
    enemyShipFireRateMs: 'int',
    maxBlackHoles: 'int',
    blackHoleSpawnPeriodSec: 'int',
    enemyShipsFightEachOther: 'bool',
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