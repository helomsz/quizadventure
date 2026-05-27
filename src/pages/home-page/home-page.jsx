import { useEffect, useState } from 'react';
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

  const characterImages = {
    helo: heloImg,
    milo: miloImg,
    leo: leoImg,
    luna: lunaImg,
  };

  useEffect(() => {
    const savedCharacter = localStorage.getItem('mapventure_character');
    if (savedCharacter) {
      setSelectedCharacter(savedCharacter);
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
