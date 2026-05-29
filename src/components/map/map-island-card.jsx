import { Check, Lock, X } from 'lucide-react';

// card exibido quando a aventura termina
function MapVictoryCard({
  islands,
  islandIcons,
  trophyIcon,
  refreshIcon,
  onReplayAdventure,
}) {
  return (
    <div className="map-victory-content">
      <div className="map-victory-badge">Passaporte completo</div>

      <div className="map-victory-crown" aria-hidden="true">
        <img src={trophyIcon} alt="" draggable="false" />
      </div>

      <div className="map-victory-stamps" aria-hidden="true">
        {islands.map((island) => (
          <span key={island.id} className={`map-victory-stamp map-victory-stamp-${island.color}`}>
            <img src={islandIcons[island.id]} alt="" />
          </span>
        ))}
      </div>

      <div className="map-victory-copy">
        <h2>Você venceu!</h2>
      </div>

      <button type="button" className="map-victory-button" onClick={onReplayAdventure}>
        <img src={refreshIcon} alt="" className="map-victory-button-icon" draggable="false" />
        <span>Reiniciar</span>
      </button>
    </div>
  );
}

export default function MapIslandCard({
  islands,
  islandIcons,
  islandIcon,
  selectedIsland,
  selectedChallenge,
  selectedIslandCompletedCount,
  isAdventureComplete,
  completedSet,
  feedback,
  mapPlayButtonLabel,
  trophyIcon,
  refreshIcon,
  onClose,
  onReplayAdventure,
  onOpenQuestion,
  onSelectIsland,
  onSelectChallenge,
  isIslandUnlocked,
}) {
  return (
    <section className={`map-island-card ${isAdventureComplete ? 'map-island-card-victory' : `map-island-card-${selectedIsland.color}`}`}>
      <div className="map-card-shine" />

      {/* fechar */}
      <button
        type="button"
        className="map-card-close"
        onClick={onClose}
        aria-label="Fechar"
      >
        <X size={22} strokeWidth={4} />
      </button>

      {isAdventureComplete ? (
        <MapVictoryCard
          islands={islands}
          islandIcons={islandIcons}
          trophyIcon={trophyIcon}
          refreshIcon={refreshIcon}
          onReplayAdventure={onReplayAdventure}
        />
      ) : (
        <>
          <header className="map-island-header">
            <div className={`map-island-icon map-island-icon-${selectedIsland.color}`}>
              <img src={islandIcon} alt="" aria-hidden="true" className="map-island-icon-image" />
            </div>
            <div className="map-island-heading">
              <div className={`map-level-badge map-level-badge-${selectedIsland.color}`}>
                Nível {selectedIsland.level}
              </div>
              <h2>{selectedIsland.name}</h2>
            </div>
          </header>

          <div className="map-stage-title">
            <span>Fase {selectedChallenge.number}</span>
            <h3>{selectedChallenge.title}</h3>
          </div>

          <p className="map-island-description">{selectedIsland.description}</p>

          <div className="map-progress-panel">
            {/* progresso */}
            <div className="map-progress-copy">
              <span>Progresso da ilha</span>
              <strong>{selectedIslandCompletedCount}/{selectedIsland.challenges.length}</strong>
            </div>
            <div
              className="map-progress-line"
              style={{
                '--progress': `${(selectedIslandCompletedCount / selectedIsland.challenges.length) * 100}%`,
              }}
            >
              {selectedIsland.challenges.map((challenge) => {
                const isDone = completedSet.has(challenge.id);
                const isActive = selectedChallenge.id === challenge.id;
                const isLocked = !isIslandUnlocked(selectedIsland.id);

                return (
                  <button
                    key={challenge.id}
                    type="button"
                    className={`map-progress-point${isDone ? ' is-done' : ''}${isActive ? ' is-active' : ''}${isLocked ? ' is-locked' : ''}`}
                    onClick={() => onSelectChallenge(selectedIsland, challenge)}
                    aria-label={`Fase ${challenge.number}`}
                  >
                    {isLocked ? <Lock size={14} strokeWidth={3} /> : isDone ? <Check size={15} strokeWidth={4} /> : challenge.number}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ilhas */}
          <div className="map-island-nav" aria-label="Navegação entre ilhas">
            {islands.map((island, index) => (
              <button
                key={island.id}
                type="button"
                className={`map-island-nav-button map-island-nav-button-${island.color}${selectedIsland.id === island.id ? ' is-active' : ''}${!isIslandUnlocked(island.id) ? ' is-locked' : ''}`}
                onClick={() => onSelectIsland(island.id)}
                disabled={!isIslandUnlocked(island.id)}
                aria-label={!isIslandUnlocked(island.id) ? `${island.name} bloqueada` : island.name}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {feedback && (
            /* feedback */
            <div className={`map-feedback map-feedback-${feedback.type}`}>
              <strong>{feedback.title}</strong>
              <span>{feedback.message}</span>
            </div>
          )}

          {/* ação principal */}
          <div className="map-card-footer">
            <button type="button" className="map-play-button" onClick={onOpenQuestion}>
              {mapPlayButtonLabel}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
