import { useEffect, useState } from 'react';
import './game-top-bar.css';

import heartIcon from '../../assets/icons/coracao.png';
import emptyHeartIcon from '../../assets/icons/coracao-vazio.png';
import stampIcon from '../../assets/icons/selo.png';
import {
  GAME_STATE_EVENT,
  getHearts,
  getRecoveryAt,
  getStamps,
  MAX_HEARTS,
} from '../../utils/game-state';

const formatTime = (ms) => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
};

export default function GameTopBar() {
  const [hearts, setHearts] = useState(() => getHearts());
  const [stamps, setStamps] = useState(() => getStamps());
  const [recoveryLeft, setRecoveryLeft] = useState(() => Math.max(0, getRecoveryAt() - Date.now()));

  useEffect(() => {
    const sync = () => {
      setHearts(getHearts());
      setStamps(getStamps());
      setRecoveryLeft(Math.max(0, getRecoveryAt() - Date.now()));
    };

    sync();
    window.addEventListener(GAME_STATE_EVENT, sync);
    window.addEventListener('storage', sync);

    const timer = window.setInterval(sync, 1000);

    return () => {
      window.removeEventListener(GAME_STATE_EVENT, sync);
      window.removeEventListener('storage', sync);
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className="game-top-bar">
      <div className="game-hearts-tag" aria-label={`${hearts} coracoes`}>
        {Array.from({ length: MAX_HEARTS }, (_, index) => (
          <img
            key={index}
            src={index < hearts ? heartIcon : emptyHeartIcon}
            alt=""
            className="game-heart-img"
          />
        ))}
        {hearts === 0 && recoveryLeft > 0 && (
          <span className="game-recovery-timer">{formatTime(recoveryLeft)}</span>
        )}
      </div>

      <div className="game-stamps-tag" aria-label={`${stamps.length} selos`}>
        <img src={stampIcon} alt="" className="game-stamp-img" />
        <span>{stamps.length} SELOS</span>
      </div>
    </div>
  );
}
