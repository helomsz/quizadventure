import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';

import CharacterCarousel from '../../components/character-carousel/character-carousel';
import { CHARACTERS } from '../../data/characters';

import './character-selection.css';

import bgMobile from '../../assets/backgrounds/imagem-default-mobile.png';
import bgDesktop from '../../assets/backgrounds/imagem-default.png';

export default function CharacterSelection({ onConfirm }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

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

  return (
    <div className="selection-container">

      {/* BACKGROUND */}
      <img
        src={bgMobile}
        alt=""
        className="sel-bg sel-bg-mobile"
      />

      <img
        src={bgDesktop}
        alt=""
        className="sel-bg sel-bg-desktop"
      />

      {/* OVERLAY */}
      <div className="selection-overlay" />

      {/* CONTEÚDO */}
      <div className="selection-content">

        {/* TÍTULO */}
        <div className="sel-title-box">
          <h1 className="sel-title-text">
            Escolha seu
            <span>Personagem</span>
          </h1>
        </div>

        {/* CARROSSEL */}
        <CharacterCarousel
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          onConfirm={handleConfirmSelection}
        />

      </div>
    </div>
  );
}
