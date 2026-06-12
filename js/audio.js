// Synthetisierte Sounds über WebAudio — keine Audiodateien nötig.
// AudioContext wird erst beim ersten Ton erzeugt (Browser verlangen eine User-Geste).
function createAudio() {
  let audioCtx = null;
  let stumm = false;

  function kontext() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }

  function ton(freq, dauer, typ = 'sine', startIn = 0, lautstaerke = 0.2) {
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

  return {
    richtig() { ton(660, 0.12); ton(880, 0.22, 'sine', 0.1); },
    falsch() { ton(180, 0.3, 'triangle', 0, 0.15); },
    montage() { ton(440, 0.06, 'square', 0, 0.12); ton(520, 0.06, 'square', 0.08, 0.12); ton(660, 0.12, 'square', 0.16, 0.12); },
    fanfare() { [523, 659, 784, 1047].forEach((f, i) => ton(f, 0.3, 'sine', i * 0.15, 0.25)); },
    toggleStumm() { stumm = !stumm; return stumm; },
    istStumm() { return stumm; },
  };
}

export const sound = createAudio();
