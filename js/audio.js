// Synthetisierte Sounds über WebAudio — keine Audiodateien nötig.
// AudioContext wird erst beim ersten Ton erzeugt (Browser verlangen eine User-Geste)
// und bei Bedarf per resume() geweckt — sonst bleibt er stumm ("suspended").
function createAudio() {
  let audioCtx = null;
  let stumm = false;

  function kontext() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function ton(freq, dauer, typ = 'sine', startIn = 0, lautstaerke = 0.25) {
    if (stumm) return;
    try {
      const ac = kontext();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = typ;
      osc.frequency.value = freq;
      const t = ac.currentTime + startIn;
      gain.gain.setValueAtTime(lautstaerke, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dauer);
      osc.connect(gain).connect(ac.destination);
      osc.start(t);
      osc.stop(t + dauer);
    } catch { /* Audio darf nie das Spiel crashen */ }
  }

  // Gefiltertes Rauschen — klingt nach Werkzeug (Ratsche, Schrauber)
  function rauschen(dauer, startIn = 0, lautstaerke = 0.3, freq = 1800) {
    if (stumm) return;
    try {
      const ac = kontext();
      const puffer = ac.createBuffer(1, Math.ceil(ac.sampleRate * dauer), ac.sampleRate);
      const daten = puffer.getChannelData(0);
      for (let i = 0; i < daten.length; i++) daten[i] = Math.random() * 2 - 1;
      const quelle = ac.createBufferSource();
      quelle.buffer = puffer;
      const filter = ac.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = freq;
      filter.Q.value = 1.2;
      const gain = ac.createGain();
      const t = ac.currentTime + startIn;
      gain.gain.setValueAtTime(lautstaerke, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dauer);
      quelle.connect(filter).connect(gain).connect(ac.destination);
      quelle.start(t);
    } catch { /* s. o. */ }
  }

  return {
    klick() { ton(900, 0.04, 'square', 0, 0.06); },
    // Tonhöhe steigt mit der Serie (1 Halbton pro richtiger Antwort, gedeckelt bei +12)
    richtig(streak = 0) {
      const faktor = Math.pow(2, Math.min(streak, 12) / 12);
      ton(660 * faktor, 0.12, 'sine', 0, 0.3);
      ton(880 * faktor, 0.25, 'sine', 0.1, 0.25);
    },
    combo() { [784, 988, 1175].forEach((f, i) => ton(f, 0.12, 'square', i * 0.07, 0.15)); },
    // Eierknacken: kurzer Knackser (Holz/Schale) + Tick
    knack() {
      rauschen(0.03, 0, 0.3, 1200);
      ton(300, 0.08, 'triangle', 0.02, 0.18);
      rauschen(0.03, 0.06, 0.22, 900);
    },
    // Tier freut sich: kurzes fröhliches Aufblubbern
    tierFreude() {
      ton(523, 0.1, 'sine', 0, 0.22);
      ton(784, 0.12, 'sine', 0.08, 0.2);
      ton(1047, 0.14, 'sine', 0.16, 0.18);
    },
    // Luftdruckschrauber: schnelle Ratterstöße + abfallender Zischer (Garage-Montage)
    luftschrauber() {
      for (let i = 0; i < 5; i++) rauschen(0.04, i * 0.05, 0.35, 2400);
      ton(720, 0.18, 'sawtooth', 0.26, 0.18);
      ton(420, 0.22, 'sawtooth', 0.33, 0.16);
      ton(880, 0.18, 'sine', 0.4, 0.22);
    },
    falsch() { ton(180, 0.35, 'triangle', 0, 0.2); },
    montage() {
      // Dreimal Ratsche, dann ein heller "sitzt!"-Klang
      rauschen(0.05, 0);
      rauschen(0.05, 0.09);
      rauschen(0.05, 0.18);
      ton(523, 0.1, 'triangle', 0.3, 0.3);
      ton(784, 0.22, 'sine', 0.38, 0.3);
    },
    fanfare() {
      [523, 659, 784, 1047].forEach((f, i) => ton(f, 0.32, 'sine', i * 0.15, 0.32));
      ton(1319, 0.5, 'sine', 0.62, 0.25);
      rauschen(0.4, 0.6, 0.12, 6000);
    },
    toggleStumm() { stumm = !stumm; return stumm; },
    istStumm() { return stumm; },
  };
}

export const sound = createAudio();
