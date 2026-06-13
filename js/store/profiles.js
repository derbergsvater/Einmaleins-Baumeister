// Profil-Store auf localStorage. Storage ist injizierbar (Tests nutzen einen Fake).
const KEY = 'baumeister.v1';

// Sorgt dafür, dass ältere Profile alle erwarteten Felder haben (sanfte Migration).
function normalisiere(profil) {
  profil.aktivesProjekt ||= 'rennwagen';
  profil.reihen ||= {};
  profil.aufgabenStats ||= {};
  profil.projekte ||= {};
  const rw = (profil.projekte.rennwagen ||= { grundbau: 0 });
  rw.grundbau ||= 0;
  rw.montierteAddons ||= [];
  const ef = (profil.projekte.eierfarm ||= {});
  ef.geschluepft ||= {};
  ef.accessoires ||= {};
  return profil;
}

export function createStore(storage) {
  function lesen() {
    let daten;
    try {
      daten = JSON.parse(storage.getItem(KEY)) || { profiles: {}, activeId: null };
    } catch {
      daten = { profiles: {}, activeId: null };
    }
    for (const profil of Object.values(daten.profiles)) normalisiere(profil);
    return daten;
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
        projekte: {
          rennwagen: { grundbau: 0, montierteAddons: [] },
          eierfarm: { geschluepft: {}, accessoires: {} },
        },
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
