const SOUND_ENABLED_KEY = 'mapventure_sound_enabled';
const MUSIC_ENABLED_KEY = 'mapventure_music_enabled';
const AUDIO_STATE_KEY = '__mapventureAudioState';

const getStoredFlag = (key) => localStorage.getItem(key) !== 'false';

const getAudioState = () => {
  window[AUDIO_STATE_KEY] ||= {
    sfxContext: null,
    musicContext: null,
    musicGain: null,
    musicTimer: null,
    musicStep: 0,
    musicEnabled: true,
    activeMusicOscillators: new Set(),
  };

  const state = window[AUDIO_STATE_KEY];

  if (state.context && !state.musicContext && !state.sfxContext) {
    try {
      state.context.close();
    } catch {
      // Older dev-server audio context may already be closing.
    }

    state.context = null;
  }

  return state;
};

const createAudioContext = () => {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  return AudioContextClass ? new AudioContextClass() : null;
};

const getSfxContext = () => {
  const state = getAudioState();

  if (!state.sfxContext || state.sfxContext.state === 'closed') {
    state.sfxContext = createAudioContext();
  }

  return state.sfxContext;
};

const getMusicContext = () => {
  const state = getAudioState();

  if (!state.musicContext || state.musicContext.state === 'closed') {
    state.musicContext = createAudioContext();
    state.musicGain = null;
  }

  return state.musicContext;
};

export const isGameSoundEnabled = () => getStoredFlag(SOUND_ENABLED_KEY);
export const isGameMusicEnabled = () => true;

const getMusicGain = () => {
  const state = getAudioState();
  const context = getMusicContext();
  if (!context) return null;

  if (!state.musicGain) {
    state.musicGain = context.createGain();
    state.musicGain.gain.setValueAtTime(isGameMusicEnabled() ? 1 : 0, context.currentTime);
    state.musicGain.connect(context.destination);
  }

  return state.musicGain;
};

const setMusicVolume = (volume) => {
  const context = getMusicContext();
  const gain = getMusicGain();
  if (!context || !gain) return;

  gain.gain.cancelScheduledValues(context.currentTime);
  gain.gain.setValueAtTime(volume, context.currentTime);
};

export const setGameSoundEnabled = (enabled) => {
  localStorage.setItem(SOUND_ENABLED_KEY, String(enabled));
};

export const stopGameMusic = () => {
  const state = getAudioState();

  state.musicEnabled = false;
  setMusicVolume(0);

  if (state.musicTimer) {
    clearInterval(state.musicTimer);
    state.musicTimer = null;
  }

  state.activeMusicOscillators.forEach((oscillator) => {
    try {
      oscillator.stop(0);
    } catch {
    }
  });
  state.activeMusicOscillators.clear();
  state.musicGain = null;

  if (state.musicContext && state.musicContext.state !== 'closed') {
    state.musicContext.close().catch(() => {});
  }

  state.musicContext = null;
};

export const setGameMusicEnabled = (enabled) => {
  const state = getAudioState();

  state.musicEnabled = true;
  localStorage.setItem(MUSIC_ENABLED_KEY, 'true');
  setMusicVolume(1);
  startGameMusic();
};

export const unlockGameAudio = () => {
  const sfxContext = getSfxContext();
  const musicContext = isGameMusicEnabled() ? getMusicContext() : null;

  if (sfxContext?.state === 'suspended') {
    sfxContext.resume();
  }

  if (musicContext?.state === 'suspended') {
    musicContext.resume();
  }
};

const playTone = ({
  frequency,
  duration = 0.12,
  delay = 0,
  type = 'sine',
  volume = 0.08,
  endFrequency,
  group = 'sfx',
}) => {
  if (group === 'music' && !isGameMusicEnabled()) return;

  const state = getAudioState();
  const context = group === 'music' ? getMusicContext() : getSfxContext();
  if (!context) return;

  const startAt = context.currentTime + delay;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startAt);

  if (endFrequency) {
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, startAt + duration);
  }

  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  oscillator.connect(gain);

  if (group === 'music') {
    const destination = getMusicGain();
    if (!destination || !isGameMusicEnabled()) return;
    gain.connect(destination);
    state.activeMusicOscillators.add(oscillator);
  } else {
    gain.connect(context.destination);
  }

  oscillator.addEventListener('ended', () => {
    state.activeMusicOscillators.delete(oscillator);
  });

  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.03);
};

export const playGameSound = (soundName = 'click') => {
  if (!isGameSoundEnabled()) return;

  unlockGameAudio();

  if (soundName === 'wrong') {
    playTone({ frequency: 220, endFrequency: 90, duration: 0.24, type: 'sawtooth', volume: 0.08 });
    return;
  }

  if (soundName === 'right') {
    [523.25, 659.25, 783.99].forEach((frequency, index) => {
      playTone({ frequency, delay: index * 0.07, duration: 0.12, type: 'triangle', volume: 0.09 });
    });
    return;
  }

  if (soundName === 'stamp') {
    [392, 523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
      playTone({ frequency, delay: index * 0.055, duration: 0.16, type: 'triangle', volume: 0.085 });
    });
    return;
  }

  if (soundName === 'complete') {
    [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98].forEach((frequency, index) => {
      playTone({ frequency, delay: index * 0.065, duration: 0.2, type: 'triangle', volume: 0.09 });
    });
    return;
  }

  playTone({ frequency: 720, endFrequency: 1080, duration: 0.075, type: 'square', volume: 0.035 });
};

const playMusicStep = () => {
  if (!isGameMusicEnabled()) return;

  const state = getAudioState();
  const melody = [392, 440, 523.25, 587.33, 523.25, 440, 392, 329.63];
  const bass = [196, 196, 261.63, 261.63, 220, 220, 174.61, 174.61];
  const noteIndex = state.musicStep % melody.length;

  playTone({
    frequency: melody[noteIndex],
    duration: 0.18,
    type: 'triangle',
    volume: 0.018,
    group: 'music',
  });

  if (state.musicStep % 2 === 0) {
    playTone({
      frequency: bass[noteIndex],
      duration: 0.35,
      type: 'sine',
      volume: 0.012,
      group: 'music',
    });
  }

  state.musicStep += 1;
};

export const startGameMusic = () => {
  const state = getAudioState();

  if (state.musicTimer || !isGameMusicEnabled()) return;

  unlockGameAudio();
  setMusicVolume(1);
  playMusicStep();
  state.musicTimer = setInterval(playMusicStep, 360);
};

export const emitGameSound = (soundName) => {
  window.dispatchEvent(new CustomEvent('mapventure-audio', { detail: soundName }));
};

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    stopGameMusic();
  });
}
