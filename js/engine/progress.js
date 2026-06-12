// Fortschritts-Logik: pure functions, kein DOM.
import { buildPool } from './tasks.js';

export const TRAINING_ZIEL = 20;

export function comboStufe(streak) {
  if (streak >= 6) return 3;
  if (streak >= 3) return 2;
  return 1;
}

export function applyAnswer({ training = 0, streak = 0 }, richtig) {
  if (!richtig) return { training, streak: 0, punkte: 0 };
  const neuerStreak = streak + 1;
  const punkte = comboStufe(neuerStreak);
  return {
    training: Math.min(TRAINING_ZIEL, training + punkte),
    streak: neuerStreak,
    punkte,
  };
}

export function pruefungBereit(training) {
  return training >= TRAINING_ZIEL;
}

export const PRUEFUNG_AUFGABEN = 12;
export const PRUEFUNG_MAX_FEHLER = 1;

export function createExam(reihe, rng = Math.random) {
  const pool = buildPool(reihe).slice();
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, PRUEFUNG_AUFGABEN);
}

export function evalExam(ergebnisse) {
  const fehler = ergebnisse.filter(ok => !ok).length;
  return {
    fehler,
    bestanden: ergebnisse.length === PRUEFUNG_AUFGABEN && fehler <= PRUEFUNG_MAX_FEHLER,
  };
}
