import { useMemo, useRef, useState } from 'react';
import 'drag-drop-touch';
import {
  Check,
  RefreshCw,
  Trophy,
  X,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import './quiz.css';
import quizIslands from '../../data/quiz-questions.json';
import {
  emitGameSound,
} from '../../utils/game-audio';
import {
  canPlay,
  COMPLETED_KEY,
  getStamps,
  loadJson,
  loseHeart,
  resetGameState,
  saveJson,
  saveStamps,
  unplacePassportStamp,
} from '../../utils/game-state';
import seloTropical from '../../assets/selos/selo-tropical.png';
import seloDeserto from '../../assets/selos/selo-deserto.png';
import seloGelo from '../../assets/selos/selo-gelo.png';
import seloLava from '../../assets/selos/selo-lava.png';
import cactoIcon from '../../assets/icons/cacto.png';
import geloIcon from '../../assets/icons/gelo.png';
import coqueiroIcon from '../../assets/icons/coqueiro.png';
import fogoIcon from '../../assets/icons/fogo.png';

const islandIcons = {
  tropical: coqueiroIcon,
  desert: cactoIcon,
  ice: geloIcon,
  volcano: fogoIcon,
};

const stampImages = {
  tropical: seloTropical,
  desert: seloDeserto,
  ice: seloGelo,
  volcano: seloLava,
};

// compara listas de respostas ordenadas
const sameOrder = (current, answer) =>
  current.length === answer.length && current.every((item, index) => item === answer[index]);

const reorderItems = (items, fromIndex, toIndex) => {
  if (fromIndex === toIndex) return items;

  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
};

// embaralha opções sem alterar a origem
const shuffleItems = (items) => {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
};

// prepara alternativas para a pergunta atual
const createShuffledChoices = (question) => {
  if (!question?.options) return [];

  const shuffled = shuffleItems(question.options);

  if (shuffled[0] === question.answer && shuffled.length > 1) {
    const [firstOption] = shuffled.splice(0, 1);
    shuffled.splice(1 + Math.floor(Math.random() * (shuffled.length - 1 || 1)), 0, firstOption);
  }

  return shuffled;
};

const createShuffledOrderItems = (question) => {
  if (question?.type !== 'order') return [];

  const shuffled = shuffleItems(question.items);

  if (sameOrder(shuffled, question.answer) && shuffled.length > 1) {
    [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
  }

  return shuffled;
};

const allChallenges = quizIslands.flatMap((island) =>
  island.challenges.map((challenge) => ({ ...challenge, island }))
);

export default function QuizPage() {
  const navigate = useNavigate();
  const { challengeId } = useParams();
  const activeQuestion = allChallenges.find((challenge) => challenge.id === challengeId);

  const [completed, setCompleted] = useState(() => loadJson(COMPLETED_KEY, []));
  const [stamps, setStamps] = useState(() => getStamps());
  const [selectedOption, setSelectedOption] = useState('');
  const [orderItems, setOrderItems] = useState(() => createShuffledOrderItems(activeQuestion));
  const [dragIndex, setDragIndex] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const touchDragIndexRef = useRef(null);

  const choiceOptions = useMemo(() => createShuffledChoices(activeQuestion), [activeQuestion]);
  const completedSet = useMemo(() => new Set(completed), [completed]);
  const stampsSet = useMemo(() => new Set(stamps), [stamps]);

  if (!activeQuestion) {
    return (
      <div className="quiz-screen quiz-screen-tropical">
        <section className="quiz-modal">
          <h1>Fase não encontrada</h1>
          <button type="button" className="quiz-primary-button" onClick={() => navigate('/map')}>
            Voltar ao mapa
          </button>
        </section>
      </div>
    );
  }

  const activeIslandIcon = islandIcons[activeQuestion.island.id] || coqueiroIcon;

  const updateCompleted = (challenge) => {
    if (completedSet.has(challenge.id)) return completed;

    const nextCompleted = [...completed, challenge.id];
    setCompleted(nextCompleted);
    saveJson(COMPLETED_KEY, nextCompleted);
    return nextCompleted;
  };

  const awardStampIfNeeded = (challenge, nextCompleted) => {
    const island = challenge.island;
    const finishedIsland = island.challenges.every((item) => nextCompleted.includes(item.id));

    if (!finishedIsland || stampsSet.has(island.id)) return false;

    const nextStamps = [...stamps, island.id];
    setStamps(nextStamps);
    unplacePassportStamp(island.id);
    saveStamps(nextStamps);
    return true;
  };

  const playAgain = () => {
    resetGameState();
    navigate('/');
  };

  // valida resposta e monta o feedback
  const submitAnswer = () => {
    if (!canPlay()) {
      emitGameSound('wrong');
      setFeedback({
        type: 'wrong',
        title: 'Sem corações.',
        message: 'Aguarde a recuperação dos corações para jogar novamente.',
        action: 'Voltar ao mapa',
        next: 'map',
      });
      return;
    }

    const isCorrect = activeQuestion.type === 'order'
      ? sameOrder(orderItems, activeQuestion.answer)
      : selectedOption === activeQuestion.answer;

    if (!isCorrect) {
      const nextHearts = loseHeart();
      emitGameSound('wrong');
      setFeedback({
        type: 'wrong',
        title: nextHearts === 0 ? 'Sem corações.' : 'Ops, não foi dessa vez.',
        message: nextHearts === 0
          ? 'Você perdeu todos os corações. Eles voltam em 5 minutos.'
          : 'Você perdeu um coração. Tente de novo com calma.',
        action: nextHearts === 0 ? 'Voltar ao mapa' : 'Tentar de novo',
        next: nextHearts === 0 ? 'map' : 'retry',
      });
      return;
    }

    const nextCompleted = updateCompleted(activeQuestion);
    const gotStamp = awardStampIfNeeded(activeQuestion, nextCompleted);
    const finishedAdventure = allChallenges.every((challenge) => nextCompleted.includes(challenge.id));

    if (gotStamp) {
      emitGameSound(finishedAdventure ? 'complete' : 'stamp');
      setFeedback({
        type: 'stamp',
        title: 'SELO DESBLOQUEADO!',
        message: activeQuestion.island.completionHint,
        stamp: activeQuestion.island.stamp,
        islandId: activeQuestion.island.id,
      });
      return;
    }

    if (finishedAdventure) {
      emitGameSound('complete');
      setFeedback({
        type: 'complete',
        title: 'VOCÊ CONSEGUIU!!!',
        message:
          'Você coletou todos os selos da aventura. Cole seus selos no passaporte para conquistar o passaporte completo e preparar a viagem para uma nova ilha.',
      });
      return;
    }

    emitGameSound('right');
    setFeedback({
      type: 'right',
      title: gotStamp ? `Você ganhou o ${activeQuestion.island.stamp}!` : 'Resposta certa!',
      message: gotStamp ? activeQuestion.island.completionHint : activeQuestion.hint,
      action: 'Continuar',
      next: 'map',
    });
  };

  const moveOrderItem = (fromIndex, toIndex) => {
    setOrderItems((current) => reorderItems(current, fromIndex, toIndex));
  };

  const moveTouchedOrderItem = (toIndex) => {
    const fromIndex = touchDragIndexRef.current;

    if (fromIndex === null || fromIndex === toIndex) return;

    setOrderItems((current) => reorderItems(current, fromIndex, toIndex));
    touchDragIndexRef.current = toIndex;
    setDragIndex(toIndex);
  };

  // suporte de toque para perguntas de ordenar
  const handleOrderPointerDown = (event, index) => {
    if (event.pointerType === 'mouse') return;

    touchDragIndexRef.current = index;
    setDragIndex(index);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handleOrderPointerMove = (event) => {
    if (touchDragIndexRef.current === null || event.pointerType === 'mouse') return;

    event.preventDefault();

    const target = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest('[data-quiz-order-index]');
    const toIndex = Number(target?.dataset.quizOrderIndex);

    if (Number.isInteger(toIndex)) {
      moveTouchedOrderItem(toIndex);
    }
  };

  const finishOrderPointerDrag = () => {
    touchDragIndexRef.current = null;
    setDragIndex(null);
  };

  return (
    <div className={`quiz-screen quiz-screen-${activeQuestion.island.id}`}>
      <div className="quiz-scenery" />

      <section className="quiz-modal" role="dialog" aria-modal="true">
        {/* fechar */}
        <button
          type="button"
          className="quiz-close-button"
          onClick={() => navigate('/map')}
          aria-label="Fechar pergunta"
        >
          <X size={22} strokeWidth={4} />
        </button>

        {/* cabeçalho */}
        <header className="quiz-header">
          <div className={`quiz-island-icon quiz-island-icon-${activeQuestion.island.color}`}>
            <img
              src={activeIslandIcon}
              alt=""
              className="quiz-island-icon-image"
              aria-hidden="true"
              draggable="false"
            />
          </div>

          <div className="quiz-heading">
            <span>{activeQuestion.island.name}</span>
            <strong>Fase {activeQuestion.number}</strong>
          </div>
        </header>

        <div className="quiz-progress">
          <span style={{ width: `${(activeQuestion.number / 20) * 100}%` }} />
        </div>

        {/* pergunta */}
        <div className="quiz-question-card">
          <p>Nível {activeQuestion.island.level}</p>
          <h2>{activeQuestion.question}</h2>
        </div>

        {/* respostas */}
        {activeQuestion.type === 'choice' ? (
          <div className="quiz-answer-grid">
            {choiceOptions.map((option, index) => (
              <button
                key={option}
                type="button"
                className={`quiz-answer-option${selectedOption === option ? ' is-selected' : ''}`}
                onClick={() => setSelectedOption(option)}
              >
                <span>{String.fromCharCode(65 + index)}</span>
                <strong>{option}</strong>
                <Check className="quiz-answer-check" size={20} strokeWidth={4} />
              </button>
            ))}
          </div>
        ) : (
          <div className="quiz-order-list">
            <p className="quiz-order-help">Arraste para organizar a ordem correta.</p>
            {orderItems.map((item, index) => (
              <button
                key={item}
                type="button"
                className={`quiz-order-item${dragIndex === index ? ' is-dragging' : ''}`}
                data-quiz-order-index={index}
                draggable
                onPointerDown={(event) => handleOrderPointerDown(event, index)}
                onPointerMove={handleOrderPointerMove}
                onPointerUp={finishOrderPointerDrag}
                onPointerCancel={finishOrderPointerDrag}
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = 'move';
                  event.dataTransfer.setData('text/plain', String(index));
                  setDragIndex(index);
                }}
                onDragOver={(event) => event.preventDefault()}
                onDragEnter={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  const sourceIndex = dragIndex ?? Number(event.dataTransfer.getData('text/plain'));
                  if (!Number.isInteger(sourceIndex)) return;
                  moveOrderItem(sourceIndex, index);
                  setDragIndex(null);
                }}
                onDragEnd={finishOrderPointerDrag}
              >
                <span>{index + 1}</span>
                <strong>{item}</strong>
              </button>
            ))}
          </div>
        )}

        {/* ações */}
        <div className="quiz-actions">
          <button type="button" className="quiz-secondary-button" onClick={() => navigate('/map')}>
            Voltar
          </button>
          <button
            type="button"
            className="quiz-primary-button"
            onClick={submitAnswer}
            disabled={activeQuestion.type === 'choice' && !selectedOption}
          >
            Responder
          </button>
        </div>
      </section>

      {feedback && (
        /* resultado */
        <div className="quiz-result-overlay" role="presentation">
          {(feedback.type === 'complete' || feedback.type === 'stamp') && (
            <div className="quiz-confetti" aria-hidden="true">
              {Array.from({ length: 44 }, (_, index) => {
                const left = (index * 37) % 100;
                const drift = ((index % 9) - 4) * 18;
                const delay = (index % 12) * -0.14;
                const duration = 2.2 + (index % 8) * 0.16;

                return (
                  <span
                    key={index}
                    style={{
                      '--i': index,
                      '--left': `${left}%`,
                      '--drift': `${drift}px`,
                      '--delay': `${delay}s`,
                      '--duration': `${duration}s`,
                    }}
                  />
                );
              })}
            </div>
          )}

          <section
            className={`quiz-result-popup quiz-result-popup-${feedback.type}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="quiz-result-title"
          >
            <button
              type="button"
              className="quiz-result-close"
              onClick={() => setFeedback(null)}
              aria-label="Fechar resultado"
            >
              <X size={24} strokeWidth={3.5} />
            </button>

            <div className="quiz-result-icon">
              {feedback.type === 'right' ? (
                <Check size={78} strokeWidth={4.5} />
              ) : feedback.type === 'stamp' ? (
                <img src={stampImages[feedback.islandId]} alt={feedback.stamp} />
              ) : feedback.type === 'complete' ? (
                <Trophy size={78} strokeWidth={4.2} />
              ) : (
                <X size={78} strokeWidth={4.5} />
              )}
            </div>

            <h2 id="quiz-result-title">{feedback.title}</h2>
            <p>{feedback.message}</p>

            {feedback.type === 'stamp' ? (
              <button
                type="button"
                className="quiz-result-action quiz-stamp-action"
                onClick={() => navigate('/passport')}
              >
                Ir para o passaporte
              </button>
            ) : feedback.type === 'complete' ? (
              <div className="quiz-complete-actions">
                <button
                  type="button"
                  className="quiz-result-action"
                  onClick={() => navigate('/passport')}
                >
                  Ir para o passaporte
                </button>
                <button
                  type="button"
                  className="quiz-result-action quiz-result-action-secondary"
                  onClick={playAgain}
                >
                  <RefreshCw size={20} strokeWidth={4} />
                  Jogar novamente
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="quiz-result-action"
                onClick={() => {
                  if (feedback.next === 'map') {
                    navigate('/map');
                    return;
                  }
                  setFeedback(null);
                }}
              >
                {feedback.action}
              </button>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
