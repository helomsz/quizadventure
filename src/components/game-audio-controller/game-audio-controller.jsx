import { useEffect } from 'react';
import {
  playGameSound,
  startGameMusic,
  unlockGameAudio,
} from '../../utils/game-audio';

export default function GameAudioController() {
  // libera áudio no primeiro gesto do jogador
  useEffect(() => {
    const unlockAndStartMusic = (event) => {
      if (event.target?.closest?.('[data-audio-toggle="true"]')) return;

      unlockGameAudio();
      startGameMusic();
    };

    const playButtonClick = (event) => {
      const clickable = event.target?.closest?.('button, [role="button"], a[href]');
      const isDisabled = clickable?.disabled || clickable?.getAttribute('aria-disabled') === 'true';

      if (clickable && !isDisabled) {
        playGameSound('click');
      }
    };

    const playRequestedSound = (event) => {
      playGameSound(event.detail);
    };

    window.addEventListener('pointerdown', unlockAndStartMusic, { once: true });
    window.addEventListener('keydown', unlockAndStartMusic, { once: true });
    document.addEventListener('click', playButtonClick, true);
    window.addEventListener('mapventure-audio', playRequestedSound);

    return () => {
      window.removeEventListener('pointerdown', unlockAndStartMusic);
      window.removeEventListener('keydown', unlockAndStartMusic);
      document.removeEventListener('click', playButtonClick, true);
      window.removeEventListener('mapventure-audio', playRequestedSound);
    };
  }, []);

  return null;
}
