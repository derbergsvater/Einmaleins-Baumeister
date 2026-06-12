// Screen-Router: Screens registrieren sich hier, navigate() tauscht den Inhalt.
// Die Screen-Importe kommen in späteren Tasks dazu.
const screens = {};
const root = document.getElementById('app');
const ctx = {};

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

navigate('start');
