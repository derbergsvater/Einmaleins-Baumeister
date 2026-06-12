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
    richtig() { ton(660, 0.12, 'sine', 0, 0.3); ton(880, 0.25, 'sine', 0.1, 0.25); },
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
