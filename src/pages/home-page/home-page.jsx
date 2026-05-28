import { useEffect, useState } from 'react';
import './home-page.css';
import AppNav from '../../components/app-nav/app-nav';
import quizIslands from '../../data/quiz-questions.json';
import { COMPLETED_KEY, GAME_STATE_EVENT, loadJson } from '../../utils/game-state';

import tropicalBgMobile from '../../assets/backgrounds/imagem-default-mobile.png';
import tropicalBgDesktop from '../../assets/backgrounds/imagem-default.png';
import desertBgMobile from '../../assets/backgrounds/fundo-default-deserto-mobile.png';
import desertBgDesktop from '../../assets/backgrounds/fundo-default-deserto.png';
import iceBgMobile from '../../assets/backgrounds/fundo-default-gelo-mobile.png';
import iceBgDesktop from '../../assets/backgrounds/fundo-default-gelo.png';
import lavaBgMobile from '../../assets/backgrounds/fundo-default-lava-mobile.png';
import lavaBgDesktop from '../../assets/backgrounds/fundo-default-lava.png';

import heloImg from '../../assets/personagens/helo.png';
import miloImg from '../../assets/personagens/milo.png';
import leoImg from '../../assets/personagens/leo.png';
import lunaImg from '../../assets/personagens/luna.png';

const homeBackgrounds = {
  tropical: {
    mobile: tropicalBgMobile,
    desktop: tropicalBgDesktop,
  },
  desert: {
    mobile: desertBgMobile,
    desktop: desertBgDesktop,
  },
  ice: {
    mobile: iceBgMobile,
    desktop: iceBgDesktop,
  },
  volcano: {
    mobile: lavaBgMobile,
    desktop: lavaBgDesktop,
  },
};

const getCurrentIslandId = () => {
  const completed = loadJson(COMPLETED_KEY, []);
  const completedSet = new Set(completed);
  const currentIsland = quizIslands.find((island) =>
    island.challenges.some((challenge) => !completedSet.has(challenge.id))
  );

  return currentIsland?.id || quizIslands[quizIslands.length - 1].id;
};

export default function HomePage() {
  const [selectedCharacter, setSelectedCharacter] = useState('helo');
  const [currentIslandId, setCurrentIslandId] = useState(() => getCurrentIslandId());

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

    const syncIsland = () => setCurrentIslandId(getCurrentIslandId());
    window.addEventListener(GAME_STATE_EVENT, syncIsland);
    window.addEventListener('storage', syncIsland);

    return () => {
      window.removeEventListener(GAME_STATE_EVENT, syncIsland);
      window.removeEventListener('storage', syncIsland);
    };
  }, []);

  const handleCharacterClick = () => {
    console.log(`Voce interagiu com o personagem: ${selectedCharacter}`);
  };

  const background = homeBackgrounds[currentIslandId] || homeBackgrounds.tropical;

  return (
    <div className="home-container">
      <img src={background.mobile} alt="" className="home-bg home-bg-mobile" />
      <img src={background.desktop} alt="" className="home-bg home-bg-desktop" />

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
