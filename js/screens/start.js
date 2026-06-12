const AVATARE = ['🦊', '🦄', '🐯', '🐸', '🦖', '🐼', '🚀', '⭐'];

export function showStart(root, ctx, navigate) {
  root.innerHTML = `
    <div class="screen start">
      <h1>🏎️ 1x1 Baumeister</h1>
      <p class="slogan">Rechne richtig — bau dein Ding!</p>
      <div class="profil-liste"></div>
      <form class="profil-neu">
        <h3>Neues Profil</h3>
        <input class="name-eingabe" name="name" maxlength="12" placeholder="Wie heißt du?" required autocomplete="off">
        <div class="avatar-wahl">
          ${AVATARE.map((a, i) => `
            <label class="avatar-option">
              <input type="radio" name="avatar" value="${a}" ${i === 0 ? 'checked' : ''}>
              <span>${a}</span>
            </label>`).join('')}
        </div>
        <button type="submit" class="btn gross">Los geht's! 🔧</button>
      </form>
    </div>`;

  const liste = root.querySelector('.profil-liste');
  const profile = ctx.store.list();
  if (profile.length) {
    liste.innerHTML = '<h3>Wer spielt?</h3>';
    for (const p of profile) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn profil-knopf';
      btn.textContent = `${p.avatar} ${p.name}`;
      btn.onclick = () => {
        ctx.store.setActive(p.id);
        navigate('hub');
      };
      liste.appendChild(btn);
    }
  }

  root.querySelector('.profil-neu').onsubmit = (e) => {
    e.preventDefault();
    const daten = new FormData(e.target);
    const name = String(daten.get('name') || '').trim();
    if (!name) return;
    ctx.store.create(name, daten.get('avatar'));
    navigate('hub');
  };
}
