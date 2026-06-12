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
