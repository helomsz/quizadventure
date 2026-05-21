import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './onboarding.css';

import bgMobile from '../../assets/backgrounds/imagem-default-mobile.png';
import bgDesktop from '../../assets/backgrounds/imagem-default.png';

import HeloAcenando from '../../assets/personagens/helo-acenando.png';
import HeloMapa from '../../assets/personagens/helo-mapa.png';
import HeloPassaporte from '../../assets/personagens/helo-passaporte.png';
import HeloApontando from '../../assets/personagens/helo-apontando.png';

import balaoFalaImg from '../../assets/items/balao-fala.png';

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const steps = [
    {
      text:
        'Olá, explorador!\nMeu nome é Helo e eu adoro descobrir lugares incríveis!',
      character: HeloAcenando,
    },
    {
      text:
        'Só que existem várias regiões misteriosas esperando para serem exploradas...',
      character: HeloMapa,
    },
    {
      text:
        'E somente os melhores aventureiros conseguem completar todos os selos do passaporte!',
      character: HeloPassaporte,
    },
    {
      text: 'Nossa aventura está prestes a começar!',
      character: HeloApontando,
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    alert('Indo para o jogo!');
    // navigate('/game');
  };

  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="onboarding-container">
      {/* Background */}
      <img src={bgMobile} alt="" className="ob-bg ob-bg-mobile" />
      <img src={bgDesktop} alt="" className="ob-bg ob-bg-desktop" />

      {/* Skip */}
      <button className="btn-skip" onClick={handleSkip}>
        Pular
      </button>

      <div className="onboarding-content">
        {/* Balão */}
        <div className="speech-bubble-container">
          <img
            src={balaoFalaImg}
            alt="Balão"
            className="speech-bubble-img"
          />

          <div className="speech-bubble-text">
            {steps[currentStep].text.split('\n').map((line, index) => (
              <React.Fragment key={index}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Personagem */}
        <div className="character-container">
          <img
            src={steps[currentStep].character}
            alt="Helo"
            className="character-img"
          />
        </div>

        {/* Dots */}
        {!isLastStep && (
          <div className="dots-container">
            {steps.slice(0, 3).map((_, index) => (
              <div
                key={index}
                className={`dot ${currentStep === index ? 'active' : ''}`}
              />
            ))}
          </div>
        )}


        {!isLastStep ? (
          <button className="btn-next" onClick={handleNext}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.97 3.97a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06l6.22-6.22H3a.75.75 0 0 1 0-1.5h16.22l-6.22-6.22a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        ) : (
          <button className="btn-start" onClick={handleSkip}>
            COMEÇAR
          </button>
        )}
      </div>
    </div>
  );
}