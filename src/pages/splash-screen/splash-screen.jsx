import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './splash-screen.css';
import {
  isGameSoundEnabled,
  setGameSoundEnabled,
} from '../../utils/game-audio';
import { MusicToggleIcon, SoundToggleIcon } from '../../components/audio-toggle-icons/audio-toggle-icons';

import bgMobile from '../../assets/backgrounds/imagem-splash-mobile.png'; 
import bgDesktop from '../../assets/backgrounds/imagem-splash.png'; 
import logoImg from '../../assets/logo/loguinho.png'; 
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&display=swap" rel="stylesheet"></link>

export default function SplashScreen() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [soundOn, setSoundOn] = useState(isGameSoundEnabled);

  const toggleSound = () => {
    const nextSoundOn = !soundOn;
    setSoundOn(nextSoundOn);
    setGameSoundEnabled(nextSoundOn);
  };

  const showMusicNotice = () => {
    window.alert('Caso a musica estiver incomodando, tire o som do computador.');
  };

  // Simulador do carregamento da barra
  useEffect(() => {
    if (progress < 100) {
      const timer = setTimeout(() => {
        setProgress((prev) => Math.min(prev + 5, 100));
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [progress]);

  return (
    <div className="splash-container">
      

      <img src={bgMobile} alt="Background Mobile" className="bg-image bg-mobile" />
      <img src={bgDesktop} alt="Background Desktop" className="bg-image bg-desktop" />

      <div className="interface-wrapper">

        <div className="logo-container">
          <img src={logoImg} alt="Quiz Adventure Logo" className="logo-img" />
        </div>


        <div className="controls-container">
          
          {isLoading ? (
            <div className="loading-bar-container">
              <div className="loading-bar-track">
                <div 
                  className="loading-bar-fill" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (

            <div className="buttons-group">
    
              <button className="btn-play" onClick={() => navigate('/onboarding')}>
                JOGAR
              </button>

        
              <div className="audio-buttons-row">
                
                <button 
                  type="button"
                  className={`btn-audio ${soundOn ? 'active' : 'inactive'}`}
                  data-audio-toggle="true"
                  onClick={toggleSound}
                  aria-label={soundOn ? 'Desativar sons' : 'Ativar sons'}
                  aria-pressed={soundOn}
                >
                  <SoundToggleIcon />
                </button>

                <button 
                  type="button"
                  className="btn-audio active"
                  data-audio-toggle="true"
                  onClick={showMusicNotice}
                  aria-label="Aviso sobre musica"
                >
                  <MusicToggleIcon />
                </button>

              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
