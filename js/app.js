import { createStore } from './store/profiles.js';
import { showStart } from './screens/start.js';
import { showProjektwahl } from './screens/projektwahl.js';
import { showHub } from './screens/hub.js';
import { showWerkstatt } from './screens/werkstatt.js';
import { showPruefung } from './screens/pruefung.js';
import { showGarage } from './screens/garage.js';

const screens = {
  start: showStart,
  projektwahl: showProjektwahl,
  hub: showHub,
  werkstatt: showWerkstatt,
  pruefung: showPruefung,
  garage: showGarage,
};
const root = document.getElementById('app');
const ctx = { store: createStore(window.localStorage) };

export function navigate(name, params = {}) {
  const screen = screens[name];
  root.innerHTML = '';
  root.dataset.screen = name;
  if (screen) {
    screen(root, ctx, navigate, params);
  } else {
    root.innerHTML = `<div class="screen"><h1>1x1 Baumeister</h1><p>Baustelle: Screen „${name}" kommt noch. 🔧</p></div>`;
  }
}

navigate(ctx.store.getActive() ? 'hub' : 'start');
