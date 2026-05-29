import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import CharacterCarousel from '../../components/character-carousel/character-carousel';
import { CHARACTERS } from '../../data/characters';
import quizIslands from '../../data/quiz-questions.json';
import { COMPLETED_KEY, GAME_STATE_EVENT, loadJson } from '../../utils/game-state';

import './character-selection.css';

import tropicalBgMobile from '../../assets/backgrounds/imagem-default-mobile.png';
import tropicalBgDesktop from '../../assets/backgrounds/imagem-default.png';
import desertBgMobile from '../../assets/backgrounds/fundo-default-deserto-mobile.png';
import desertBgDesktop from '../../assets/backgrounds/fundo-default-deserto.png';
import iceBgMobile from '../../assets/backgrounds/fundo-default-gelo-mobile.png';
import iceBgDesktop from '../../assets/backgrounds/fundo-default-gelo.png';
import lavaBgMobile from '../../assets/backgrounds/fundo-default-lava-mobile.png';
import lavaBgDesktop from '../../assets/backgrounds/fundo-default-lava.png';

const selectionBackgrounds = {
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

// encontra a ilha atual pelo progresso salvo
const getCurrentIslandId = () => {
  const completed = loadJson(COMPLETED_KEY, []);
  const completedSet = new Set(completed);
  const currentIsland = quizIslands.find((island) =>
    island.challenges.some((challenge) => !completedSet.has(challenge.id))
  );

  return currentIsland?.id || quizIslands[quizIslands.length - 1].id;
};

export default function CharacterSelection({ onConfirm }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentIslandId, setCurrentIslandId] = useState(() => getCurrentIslandId());
  const navigate = useNavigate();

  // mantém a ilha atual sincronizada com o progresso
  useEffect(() => {
    const syncIsland = () => setCurrentIslandId(getCurrentIslandId());
    window.addEventListener(GAME_STATE_EVENT, syncIsland);
    window.addEventListener('storage', syncIsland);

    return () => {
      window.removeEventListener(GAME_STATE_EVENT, syncIsland);
      window.removeEventListener('storage', syncIsland);
    };
  }, []);

  // salva o personagem escolhido e avança para a home
  const handleConfirmSelection = () => {
    const selectedCharacter = CHARACTERS[currentIndex];

   
    localStorage.setItem(
      'mapventure_character',
      selectedCharacter.id
    );

    if (onConfirm) {
      onConfirm(selectedCharacter);
    }

    navigate('/home-page');
  };

  const background = selectionBackgrounds[currentIslandId] || selectionBackgrounds.tropical;

  return (
    <div className="selection-container">

      {/* background */}
      <img
        src={background.mobile}
        alt=""
        className="sel-bg sel-bg-mobile"
      />

      <img
        src={background.desktop}
        alt=""
        className="sel-bg sel-bg-desktop"
      />

      {/* overlay */}
      <div className="selection-overlay" />

      {/* conteúdo */}
      <div className="selection-content">

        {/* título */}
        <div className="sel-title-box">
          <h1 className="sel-title-text">
            Escolha seu
            <span>Personagem</span>
          </h1>
        </div>

        {/* carrossel */}
        <CharacterCarousel
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          onConfirm={handleConfirmSelection}
        />

      </div>
    </div>
  );
}
