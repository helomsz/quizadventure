import React, { useEffect, useState } from 'react';
import './home-page.css';
import AppNav from '../../components/app-nav/app-nav';

import bgMobile from '../../assets/backgrounds/imagem-default-mobile.png';
import bgDesktop from '../../assets/backgrounds/imagem-default.png';

import heloImg from '../../assets/personagens/helo.png';
import miloImg from '../../assets/personagens/milo.png';
import leoImg from '../../assets/personagens/leo.png';
import lunaImg from '../../assets/personagens/luna.png';

export default function HomePage() {
  const [selectedCharacter, setSelectedCharacter] = useState('helo');
  const [stampsCount, setStampsCount] = useState(0);

  const characterImages = {
    helo: heloImg,
    milo: miloImg,
    leo: leoImg,
    luna: lunaImg
  };

  useEffect(() => {
    const savedCharacter = localStorage.getItem('mapventure_character');
    if (savedCharacter) {
      setSelectedCharacter(savedCharacter);
    }

    const savedStamps = localStorage.getItem('mapventure_stamps_count');
    if (savedStamps) {
      setStampsCount(parseInt(savedStamps, 10));
    }
  }, []);

  const handleCharacterClick = () => {
    console.log(`Voce interagiu com o personagem: ${selectedCharacter}`);
  };

  return (
    <div className="home-container">
      <img src={bgMobile} alt="" className="home-bg home-bg-mobile" />
      <img src={bgDesktop} alt="" className="home-bg home-bg-desktop" />

      <div className="home-overlay" />

      <header className="home-top-bar">
        <div className="heart-status-box" onClick={() => alert('Em breve: Sistema de Conquistas e Afeto!')}>
          <span className="heart-icon">❤️</span>
          <span className="heart-icon">❤️</span>
          <span className="heart-icon">❤️</span>
          <span className="heart-icon">❤️</span>
          <span className="heart-icon heart-icon-empty">🤍</span>
          <span className="heart-plus">+</span>
        </div>

        <div className="stamps-counter-box">
          <span className="stamp-emoji">🏅</span>
          <span className="counter-text">{stampsCount} SELOS</span>
        </div>
      </header>

      <main className="home-character-stage">
        <img
          src={characterImages[selectedCharacter] || heloImg}
          alt="Seu Personagem"
          className="home-character-display"
          onClick={handleCharacterClick}
        />
      </main>

      <AppNav />
    </div>
  );
}
