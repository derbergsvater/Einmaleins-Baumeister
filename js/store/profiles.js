// Profil-Store auf localStorage. Storage ist injizierbar (Tests nutzen einen Fake).
const KEY = 'baumeister.v1';

export function createStore(storage) {
  function lesen() {
    try {
      return JSON.parse(storage.getItem(KEY)) || { profiles: {}, activeId: null };
    } catch {
      return { profiles: {}, activeId: null };
    }
  }
  function schreiben(daten) {
    storage.setItem(KEY, JSON.stringify(daten));
  }
  return {
    list() {
      return Object.values(lesen().profiles);
    },
    get(id) {
      return lesen().profiles[id] || null;
    },
    create(name, avatar) {
      const daten = lesen();
      const laufnummer = Object.keys(daten.profiles).length + 1;
      const id = `p${laufnummer}_${name.toLowerCase().replace(/[^a-zäöüß0-9]/gi, '')}`;
      const profil = {
        id,
        name,
        avatar,
        aktivesProjekt: 'rennwagen',
        reihen: {},
        aufgabenStats: {},
        projekte: { rennwagen: { grundbau: 0 } },
      };
      daten.profiles[id] = profil;
      daten.activeId = id;
      schreiben(daten);
      return profil;
    },
    update(profil) {
      const daten = lesen();
      daten.profiles[profil.id] = profil;
      schreiben(daten);
    },
    setActive(id) {
      const daten = lesen();
      daten.activeId = id;
      schreiben(daten);
    },
    getActive() {
      const daten = lesen();
      return daten.activeId ? daten.profiles[daten.activeId] || null : null;
    },
  };
}
