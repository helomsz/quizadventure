import React, { useState } from 'react';
import CharacterCarousel from '../../components/character-carousel/character-carousel';
import {CHARACTERS} from '../../data/characters';
import './character-selection.css';


import bgMobile from '../../assets/backgrounds/imagem-default-mobile.png';
import bgDesktop from '../../assets/backgrounds/imagem-default.png';
import titleSelect from '../../assets/items/title-select.png'; // Imagem com o letreiro "Escolha seu personagem"

export default function CharacterSelection({ onConfirm }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleConfirmSelection = () => {
    const selectedCharacter = CHARACTERS[currentIndex];
    localStorage.setItem('quizadventure_character', selectedCharacter.id);
    
    if (onConfirm) {
      onConfirm(selectedCharacter);
    }
  };

  return (
    <div className="selection-container">
      
      <img src={bgMobile} alt="Background Mobile" className="sel-bg sel-bg-mobile" />
      <img src={bgDesktop} alt="Background Desktop" className="sel-bg sel-bg-desktop" />
      
      {/* Overlay translúcido de cena */}
      <div className="selection-overlay" />

      <div className="sel-title-box">
        <img src={titleSelect} alt="Escolha seu Personagem" className="sel-title-img" />
      </div>

      {/* Carrossel Central */}
      <CharacterCarousel 
        currentIndex={currentIndex} 
        setCurrentIndex={setCurrentIndex} 
      />

      {/* Botão Gamificado de Confirmação */}
      <div className="sel-actions-box">
        <button onClick={handleConfirmSelection} className="sel-btn-confirm">
          Confirmar
        </button>
      </div>
    </div>
  );
}