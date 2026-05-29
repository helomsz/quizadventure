export const MAX_HEARTS = 5;
export const HEART_RECOVERY_MS = 5 * 60 * 1000;
export const HEARTS_KEY = 'mapventure_hearts';
export const HEART_RECOVERY_KEY = 'mapventure_heart_recovery_at';
export const STAMPS_KEY = 'mapventure_stamps';
export const STAMPS_COUNT_KEY = 'mapventure_stamps_count';
export const PASSPORT_PLACED_KEY = 'mapventure_passport_placed_stamps';
export const PASSPORT_COMPLETE_KEY = 'mapventure_passport_complete';
export const COMPLETED_KEY = 'mapventure_completed_challenges';
export const GAME_STATE_EVENT = 'mapventure-game-state-change';

export const emitGameStateChange = () => {
  window.dispatchEvent(new Event(GAME_STATE_EVENT));
};

export const loadJson = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export const saveJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
  emitGameStateChange();
};

export const getRecoveryAt = () => Number(localStorage.getItem(HEART_RECOVERY_KEY)) || 0;

export const getHearts = () => {
  const recoveryAt = getRecoveryAt();

  if (recoveryAt && Date.now() >= recoveryAt) {
    localStorage.setItem(HEARTS_KEY, String(MAX_HEARTS));
    localStorage.removeItem(HEART_RECOVERY_KEY);
    emitGameStateChange();
    return MAX_HEARTS;
  }

  const saved = localStorage.getItem(HEARTS_KEY);
  if (saved === null) return MAX_HEARTS;

  const hearts = Number(saved);
  return Number.isFinite(hearts) && hearts >= 0 ? Math.min(hearts, MAX_HEARTS) : MAX_HEARTS;
};

export const loseHeart = () => {
  const next = Math.max(0, getHearts() - 1);
  localStorage.setItem(HEARTS_KEY, String(next));

  if (next === 0) {
    localStorage.setItem(HEART_RECOVERY_KEY, String(Date.now() + HEART_RECOVERY_MS));
  }

  emitGameStateChange();
  return next;
};

export const getStamps = () => loadJson(STAMPS_KEY, []);

export const saveStamps = (stamps) => {
  saveJson(STAMPS_KEY, stamps);
  localStorage.setItem(STAMPS_COUNT_KEY, String(stamps.length));
  emitGameStateChange();
};

export const unplacePassportStamp = (stampId) => {
  const placedStamps = loadJson(PASSPORT_PLACED_KEY, {});

  if (!placedStamps[stampId]) return;

  const nextPlacedStamps = { ...placedStamps };
  delete nextPlacedStamps[stampId];
  saveJson(PASSPORT_PLACED_KEY, nextPlacedStamps);
};

export const canPlay = () => getHearts() > 0;

export const resetGameState = () => {
  [
    HEARTS_KEY,
    HEART_RECOVERY_KEY,
    STAMPS_KEY,
    STAMPS_COUNT_KEY,
    PASSPORT_PLACED_KEY,
    PASSPORT_COMPLETE_KEY,
    COMPLETED_KEY,
    'mapventure_character',
  ].forEach((key) => localStorage.removeItem(key));

  emitGameStateChange();
};
