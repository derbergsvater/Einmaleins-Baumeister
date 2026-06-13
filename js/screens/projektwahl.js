import { PROJEKT_LISTE } from '../projects/registry.js';

export function showProjektwahl(root, ctx, navigate) {
  const profil = ctx.store.getActive();
  if (!profil) { navigate('start'); return; }

  root.innerHTML = `
    <div class="screen projektwahl">
      <h1>Was willst du bauen?</h1>
      <p class="slogan">Such dir aus, was beim Rechnen entsteht!</p>
      <div class="projekt-karten"></div>
    </div>`;

  const karten = root.querySelector('.projekt-karten');
  for (const p of PROJEKT_LISTE) {
    const karte = document.createElement('button');
    karte.type = 'button';
    karte.className = 'projekt-karte' + (p.id === profil.aktivesProjekt ? ' aktiv' : '');
    karte.innerHTML = `
      <span class="karte-emoji">${p.emoji}</span>
      <span class="karte-name">${p.name}</span>
      <span class="karte-slogan">${p.slogan}</span>`;
    karte.onclick = () => {
      profil.aktivesProjekt = p.id;
      ctx.store.update(profil);
      navigate('hub');
    };
    karten.appendChild(karte);
  }
}
