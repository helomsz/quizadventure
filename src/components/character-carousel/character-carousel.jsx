import React from 'react';
import { CHARACTERS } from '../../data/characters';
import arrowLeft from '../../assets/icons/icone-seta.svg';
import arrowRight from '../../assets/icons/icone-seta.svg';

export default function CharacterCarousel({ currentIndex, setCurrentIndex }) {
  
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? CHARACTERS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === CHARACTERS.length - 1 ? 0 : prev + 1));
  };

  const currentCharacter = CHARACTERS[currentIndex];

  return (
    <div className="sel-carousel-wrapper">
      <div className="sel-carousel-row">

        <button onClick={handlePrev} className="sel-arrow-btn">
          <img src={arrowLeft} alt="Anterior" style={{ transform: 'rotate(180deg)' }} />
        </button>

        <div className="sel-character-display">
          <img
            key={currentCharacter.id}
            src={currentCharacter.image}
            alt={currentCharacter.name}
            className="sel-character-img"
          />
        </div>

        <button onClick={handleNext} className="sel-arrow-btn">
          <img src={arrowRight} alt="Próximo" />
        </button>
      </div>


      <div className="sel-name-plate">
        <span key={`name-${currentCharacter.id}`} className="sel-name-text">
          {currentCharacter.name}
        </span>
      </div>
    </div>
  );
}