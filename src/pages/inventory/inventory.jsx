import { useNavigate } from 'react-router-dom';
import quizIslands from '../../data/quiz-questions.json';
import { COMPLETED_KEY, loadJson } from '../../utils/game-state';
import arrowIcon from '../../assets/icons/icone-seta.svg';
import lockIcon from '../../assets/icons/cadeado.svg';
import './inventory.css';

const getIslandProgress = (island, completedSet) =>
  island.challenges.filter((challenge) => completedSet.has(challenge.id)).length;

const isIslandUnlocked = (islandIndex, completedSet) => {
  if (islandIndex === 0) return true;

  const previousIsland = quizIslands[islandIndex - 1];
  return previousIsland.challenges.every((challenge) => completedSet.has(challenge.id));
};

export default function InventoryPage() {
  const navigate = useNavigate();
  const completed = loadJson(COMPLETED_KEY, []);
  const completedSet = new Set(completed);

  return (
    <main className="inventory-screen">
      <button
        type="button"
        className="inventory-back-button"
        onClick={() => navigate('/home-page')}
        aria-label="Voltar para home"
      >
        <img src={arrowIcon} alt="" className="inventory-back-arrow" draggable="false" />
      </button>

      <section className="inventory-content" aria-label="Inventario de ilhas">
        <header className="inventory-header">
          <span>Inventario do explorador</span>
          <h1>Ilhas</h1>
        </header>

        <div className="inventory-island-grid">
          {quizIslands.map((island, islandIndex) => {
            const completedCount = getIslandProgress(island, completedSet);
            const progress = Math.round((completedCount / island.challenges.length) * 100);
            const islandUnlocked = isIslandUnlocked(islandIndex, completedSet);

            return (
              <article
                key={island.id}
                className={`inventory-island-card inventory-island-card-${island.color}${islandUnlocked ? '' : ' is-locked'}`}
              >
                {!islandUnlocked && (
                  <img
                    src={lockIcon}
                    alt=""
                    className="inventory-lock-icon"
                    aria-hidden="true"
                    draggable="false"
                  />
                )}

                {islandUnlocked && (
                  <div className="inventory-island-copy">
                    <h2>{island.name}</h2>
                    <p>{island.description}</p>

                    <div className="inventory-progress-row">
                      <div className="inventory-progress-track" aria-hidden="true">
                        <span style={{ width: `${progress}%` }} />
                      </div>
                      <strong>{completedCount}/{island.challenges.length}</strong>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
