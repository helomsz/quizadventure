import React from 'react';
import { Check } from 'lucide-react';

import { CHARACTERS } from '../../data/characters';

import arrowIcon from '../../assets/icons/icone-seta.svg';

export default function CharacterCarousel({
  currentIndex,
  setCurrentIndex,
  onConfirm,
}) {

  // volta no carrossel de personagens
  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? CHARACTERS.length - 1 : prev - 1
    );
  };

  // avança no carrossel de personagens
  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === CHARACTERS.length - 1 ? 0 : prev + 1
    );
  };

  const currentCharacter = CHARACTERS[currentIndex];

  return (
    <div className="sel-carousel-wrapper">

      <div className="sel-carousel-row">

        {/* esquerda */}
        <button
          onClick={handlePrev}
          className="sel-arrow-btn"
          aria-label="Personagem anterior"
        >
          <img
            src={arrowIcon}
            alt=""
            className="sel-arrow-left"
          />
        </button>

        {/* personagem */}
        <div className="sel-character-display">
          <img
            key={currentCharacter.id}
            src={currentCharacter.image}
            alt={currentCharacter.name}
            className="sel-character-img"
          />
        </div>

        {/* direita */}
        <button
          onClick={handleNext}
          className="sel-arrow-btn"
          aria-label="Próximo personagem"
        >
          <img
            src={arrowIcon}
            alt=""
            className="sel-arrow-right"
          />
        </button>
      </div>

      {/* nome + confirmar */}
      <div className="sel-bottom-row">

        <div className="sel-name-plate">
          <span
            key={`name-${currentCharacter.id}`}
            className="sel-name-text"
          >
            {currentCharacter.name}
          </span>
        </div>

        <button
          className="sel-confirm-btn"
          onClick={onConfirm}
          aria-label="Confirmar personagem"
        >
          <Check size={28} strokeWidth={3.5} />
        </button>

      </div>
    </div>
  );
}
