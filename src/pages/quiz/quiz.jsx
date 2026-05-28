import { useMemo, useState } from 'react';
import {
  Check,
  Flame,
  Landmark,
  RefreshCw,
  Snowflake,
  Trophy,
  TreePalm,
  X,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import './quiz.css';
import quizIslands from '../../data/quiz-questions.json';
import {
  canPlay,
  COMPLETED_KEY,
  getStamps,
  loadJson,
  loseHeart,
  resetGameState,
  saveJson,
  saveStamps,
} from '../../utils/game-state';

const islandIcons = {
  tropical: TreePalm,
  desert: Landmark,
  ice: Snowflake,
  volcano: Flame,
};

const sameOrder = (current, answer) =>
  current.length === answer.length && current.every((item, index) => item === answer[index]);

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
  const [orderItems, setOrderItems] = useState(() =>
    activeQuestion?.type === 'order' ? [...activeQuestion.items].reverse() : []
  );
  const [dragIndex, setDragIndex] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const completedSet = useMemo(() => new Set(completed), [completed]);
  const stampsSet = useMemo(() => new Set(stamps), [stamps]);

  if (!activeQuestion) {
    return (
      <div className="quiz-screen quiz-screen-tropical">
        <section className="quiz-modal">
          <h1>Fase nao encontrada</h1>
          <button type="button" className="quiz-primary-button" onClick={() => navigate('/map')}>
            Voltar ao mapa
          </button>
        </section>
      </div>
    );
  }

  const ActiveIslandIcon = islandIcons[activeQuestion.island.id];

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
    saveStamps(nextStamps);
    return true;
  };

  const playAgain = () => {
    resetGameState();
    navigate('/');
  };

  const submitAnswer = () => {
    if (!canPlay()) {
      setFeedback({
        type: 'wrong',
        title: 'Sem coracoes.',
        message: 'Aguarde a recuperacao dos coracoes para jogar novamente.',
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
      setFeedback({
        type: 'wrong',
        title: nextHearts === 0 ? 'Sem coracoes.' : 'Ops, nao foi dessa vez.',
        message: nextHearts === 0
          ? 'Voce perdeu todos os coracoes. Eles voltam em 5 minutos.'
          : 'Voce perdeu um coracao. Tente de novo com calma.',
        action: nextHearts === 0 ? 'Voltar ao mapa' : 'Tentar de novo',
        next: nextHearts === 0 ? 'map' : 'retry',
      });
      return;
    }

    const nextCompleted = updateCompleted(activeQuestion);
    const gotStamp = awardStampIfNeeded(activeQuestion, nextCompleted);
    const finishedAdventure = allChallenges.every((challenge) => nextCompleted.includes(challenge.id));

    if (finishedAdventure) {
      setFeedback({
        type: 'complete',
        title: 'VOCE CONSEGUIU!!!',
        message:
          'Voce coletou todos os selos da aventura. Cole seus selos no passaporte para conquistar o passaporte completo e preparar a viagem para uma nova ilha.',
      });
      return;
    }

    setFeedback({
      type: 'right',
      title: gotStamp ? `Voce ganhou o ${activeQuestion.island.stamp}!` : 'Resposta certa!',
      message: gotStamp ? activeQuestion.island.completionHint : activeQuestion.hint,
      action: 'Continuar',
      next: 'map',
    });
  };

  const moveOrderItem = (fromIndex, toIndex) => {
    setOrderItems((current) => {
      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  return (
    <div className={`quiz-screen quiz-screen-${activeQuestion.island.id}`}>
      <div className="quiz-scenery" />

      <section className="quiz-modal" role="dialog" aria-modal="true">
        <button
          type="button"
          className="quiz-close-button"
          onClick={() => navigate('/map')}
          aria-label="Fechar pergunta"
        >
          <X size={22} strokeWidth={4} />
        </button>

        <header className="quiz-header">
          <div className={`quiz-island-icon quiz-island-icon-${activeQuestion.island.color}`}>
            <ActiveIslandIcon size={42} strokeWidth={3} />
          </div>

          <div className="quiz-heading">
            <span>{activeQuestion.island.name}</span>
            <strong>Fase {activeQuestion.number}</strong>
          </div>
        </header>

        <div className="quiz-progress">
          <span style={{ width: `${(activeQuestion.number / 20) * 100}%` }} />
        </div>

        <div className="quiz-question-card">
          <p>Nivel {activeQuestion.island.level}</p>
          <h2>{activeQuestion.question}</h2>
        </div>

        {activeQuestion.type === 'choice' ? (
          <div className="quiz-answer-grid">
            {activeQuestion.options.map((option, index) => (
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
                className="quiz-order-item"
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (dragIndex === null) return;
                  moveOrderItem(dragIndex, index);
                  setDragIndex(null);
                }}
              >
                <span>{index + 1}</span>
                <strong>{item}</strong>
              </button>
            ))}
          </div>
        )}

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
        <div className="quiz-result-overlay" role="presentation">
          {feedback.type === 'complete' && (
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
              ) : feedback.type === 'complete' ? (
                <Trophy size={78} strokeWidth={4.2} />
              ) : (
                <X size={78} strokeWidth={4.5} />
              )}
            </div>

            <h2 id="quiz-result-title">{feedback.title}</h2>
            <p>{feedback.message}</p>

            {feedback.type === 'complete' ? (
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
