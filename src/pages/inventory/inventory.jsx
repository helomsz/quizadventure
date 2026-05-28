import { Lock, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import quizIslands from '../../data/quiz-questions.json';
import { COMPLETED_KEY, loadJson } from '../../utils/game-state';
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
    <div className="inventory-screen">
      <div className="inventory-backdrop" />

      <main className="inventory-panel">
        <button
          type="button"
          className="inventory-close-button"
          onClick={() => navigate('/home-page')}
          aria-label="Fechar inventario"
        >
          <X size={24} strokeWidth={4} />
        </button>

        <header className="inventory-header">
          <span>Inventário</span>
          <h1>Ilhas</h1>
        </header>

        <section className="inventory-island-grid" aria-label="Progresso das ilhas">
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
                  <div className="inventory-lock-badge" aria-hidden="true">
                    <Lock size={34} strokeWidth={3.4} />
                  </div>
                )}

                <div className="inventory-island-copy">
                  <h2>{island.name}</h2>
                  <p>{island.description}</p>
                </div>

                <div className="inventory-progress-block">
                  <div className="inventory-progress-track">
                    <span style={{ width: `${progress}%` }} />
                  </div>
                  <strong>{completedCount}/{island.challenges.length} · {progress}%</strong>
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}
