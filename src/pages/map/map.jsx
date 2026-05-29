import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Lock,
  Play,
  X,
  Plus,
  Minus,
} from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MapContainer, ImageOverlay, Marker, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './map.css';
import { MusicToggleIcon, SoundToggleIcon } from '../../components/audio-toggle-icons/audio-toggle-icons';
import quizIslands from '../../data/quiz-questions.json';
import {
  isGameSoundEnabled,
  setGameSoundEnabled,
} from '../../utils/game-audio';
import {
  canPlay,
  COMPLETED_KEY,
  getHearts,
  loadJson,
  resetGameState,
} from '../../utils/game-state';

import imagemMapaCompleto from '../../assets/backgrounds/fundo-mapa.png';
import arrowIcon from '../../assets/icons/icone-seta.svg';
import pauseIcon from '../../assets/icons/pause.svg';
import homeIcon from '../../assets/icons/home.svg';
import refreshIcon from '../../assets/icons/refresh.svg';
import cactoIcon from '../../assets/icons/cacto.png';
import geloIcon from '../../assets/icons/gelo.png';
import coqueiroIcon from '../../assets/icons/coqueiro.png';
import fogoIcon from '../../assets/icons/fogo.png';
import trophyIcon from '../../assets/icons/troféu.png';

const islandIcons = {
  tropical: coqueiroIcon,
  desert: cactoIcon,
  ice: geloIcon,
  volcano: fogoIcon,
};

const withIsland = (island, challenge) => ({ ...challenge, island });
const firstIsland = quizIslands[0];
const firstChallenge = withIsland(firstIsland, firstIsland.challenges[0]);
const lastIsland = quizIslands[quizIslands.length - 1];
const lastChallenge = withIsland(lastIsland, lastIsland.challenges[lastIsland.challenges.length - 1]);

const getNextChallengeInIsland = (island, completedSet) => {
  const nextChallenge = island.challenges.find((challenge) => !completedSet.has(challenge.id));
  return withIsland(island, nextChallenge || island.challenges[island.challenges.length - 1]);
};

const getNextAdventureChallenge = (completed = []) => {
  const completedSet = new Set(completed);
  const nextIsland = quizIslands.find((island) =>
    island.challenges.some((challenge) => !completedSet.has(challenge.id))
  );

  return nextIsland ? getNextChallengeInIsland(nextIsland, completedSet) : lastChallenge;
};

function MapFocus({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, Math.max(map.getZoom(), 1), { duration: 0.7 });
    }
  }, [map, position]);

  return null;
}

function MapZoomControls() {
  const map = useMap();

  return (
    <div className="map-zoom-controls">
      <button
        type="button"
        className="map-glossy-icon-button"
        onClick={() => map.zoomIn()}
        aria-label="Aproximar mapa"
      >
        <Plus size={30} strokeWidth={4} />
      </button>
      <button
        type="button"
        className="map-glossy-icon-button"
        onClick={() => map.zoomOut()}
        aria-label="Reduzir mapa"
      >
        <Minus size={30} strokeWidth={4} />
      </button>
    </div>
  );
}

export default function MapPage() {
  const navigate = useNavigate();
  const mapWidth = 1402;
  const mapHeight = 1122;
  const bounds = [[0, 0], [mapHeight, mapWidth]];
  const mapStartPosition = firstChallenge.position;

  const [completed] = useState(() => loadJson(COMPLETED_KEY, []));
  const [selectedChallenge, setSelectedChallenge] = useState(() =>
    getNextAdventureChallenge(loadJson(COMPLETED_KEY, []))
  );
  const [feedback, setFeedback] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [soundOn, setSoundOn] = useState(isGameSoundEnabled);

  const allChallenges = useMemo(
    () => quizIslands.flatMap((island) =>
      island.challenges.map((challenge) => withIsland(island, challenge))
    ),
    []
  );

  const selectedIsland = selectedChallenge?.island;
  const islandIcon = selectedIsland ? islandIcons[selectedIsland.id] : coqueiroIcon;
  const completedSet = useMemo(() => new Set(completed), [completed]);
  const isAdventureComplete = allChallenges.every((challenge) => completedSet.has(challenge.id));

  const islandProgress = useMemo(
    () => quizIslands.map((island) => ({
      id: island.id,
      isComplete: island.challenges.every((challenge) => completedSet.has(challenge.id)),
    })),
    [completedSet]
  );

  const isIslandUnlocked = (islandId) => {
    const islandIndex = quizIslands.findIndex((island) => island.id === islandId);
    if (islandIndex <= 0) return true;

    return islandProgress[islandIndex - 1]?.isComplete;
  };

  const selectedIslandCompletedCount = selectedIsland
    ? selectedIsland.challenges.filter((challenge) => completedSet.has(challenge.id)).length
    : 0;
  const isSelectedIslandComplete = selectedIsland
    ? selectedIslandCompletedCount === selectedIsland.challenges.length
    : false;

  const createLevelIcon = (challenge) => {
    const isDone = completedSet.has(challenge.id);
    const isLocked = !isIslandUnlocked(challenge.island.id);
    const completeIcon = isDone
      ? `<span class="map-level-complete-icon">${renderToStaticMarkup(<Check size={15} strokeWidth={4} />)}</span>`
      : '';

    return L.divIcon({
      html: `<button class="map-level-button map-level-button-${challenge.island.color}${isDone ? ' is-complete' : ''}${isLocked ? ' is-locked' : ''}" type="button">${challenge.number}${completeIcon}</button>`,
      className: 'map-level-marker',
      iconSize: [54, 54],
      iconAnchor: [27, 27],
    });
  };

  const selectIsland = (islandId) => {
    if (!isIslandUnlocked(islandId)) return;

    const island = quizIslands.find((item) => item.id === islandId);
    if (!island) return;

    setSelectedChallenge(getNextChallengeInIsland(island, completedSet));
    setFeedback(null);
  };

  const openQuestion = () => {
    if (!selectedChallenge) return;
    if (!canPlay()) {
      setFeedback({
        type: 'wrong',
        title: 'Sem corações.',
        message: 'Aguarde a recuperação dos corações para jogar novamente.',
      });
      return;
    }

    const nextChallenge = completedSet.has(selectedChallenge.id)
      ? getNextChallengeInIsland(selectedChallenge.island, completedSet)
      : selectedChallenge;

    setSelectedChallenge(nextChallenge);
    setFeedback(null);
    navigate(`/quiz/${nextChallenge.id}`);
  };

  const replayAdventure = () => {
    resetGameState();
    navigate('/');
  };

  const toggleSound = () => {
    const nextSoundOn = !soundOn;
    setSoundOn(nextSoundOn);
    setGameSoundEnabled(nextSoundOn);
  };

  const showMusicNotice = () => {
    window.alert('Caso a musica estiver incomodando, tire o som do computador.');
  };

  return (
    <div className="map-page-container">
      <button
        type="button"
        className="map-back-button"
        onClick={() => navigate('/home-page')}
        aria-label="Voltar para home"
      >
        <img src={arrowIcon} alt="" className="map-back-arrow" draggable="false" />
      </button>

      <button
        type="button"
        className="map-pause-button map-glossy-icon-button"
        onClick={() => setIsPaused(true)}
        aria-label="Pausar"
      >
        <img src={pauseIcon} alt="" className="map-pause-icon" draggable="false" />
      </button>

      <MapContainer
        crs={L.CRS.Simple}
        center={mapStartPosition}
        zoom={1}
        minZoom={0}
        maxZoom={2}
        maxBounds={bounds}
        maxBoundsViscosity={1}
        zoomSnap={0.5}
        zoomControl={false}
      >
        <MapFocus position={selectedChallenge?.position} />
        <MapZoomControls />
        <ImageOverlay url={imagemMapaCompleto} bounds={bounds} />

        {allChallenges.map((challenge) => (
          <Marker
            key={`${challenge.id}-${completedSet.has(challenge.id)}`}
            position={challenge.position}
            icon={createLevelIcon(challenge)}
            eventHandlers={{
              click: () => {
                if (!isIslandUnlocked(challenge.island.id)) return;

                setSelectedChallenge(challenge);
                setFeedback(null);
              },
            }}
          />
        ))}
      </MapContainer>

      {selectedChallenge && (
        <section className={`map-island-card ${isAdventureComplete ? 'map-island-card-victory' : `map-island-card-${selectedIsland.color}`}`}>
          <div className="map-card-shine" />

          <button
            type="button"
            className="map-card-close"
            onClick={() => setSelectedChallenge(null)}
            aria-label="Fechar"
          >
            <X size={22} strokeWidth={4} />
          </button>

          {isAdventureComplete ? (
            <div className="map-victory-content">
              <div className="map-victory-badge">Passaporte completo</div>

              <div className="map-victory-crown" aria-hidden="true">
                <img src={trophyIcon} alt="" draggable="false" />
              </div>

              <div className="map-victory-stamps" aria-hidden="true">
                {quizIslands.map((island) => (
                  <span key={island.id} className={`map-victory-stamp map-victory-stamp-${island.color}`}>
                    <img src={islandIcons[island.id]} alt="" />
                  </span>
                ))}
              </div>

              <div className="map-victory-copy">
                <h2>Você venceu!</h2>
              </div>

              <button type="button" className="map-victory-button" onClick={replayAdventure}>
                <img src={refreshIcon} alt="" className="map-victory-button-icon" draggable="false" />
                <span>Reiniciar</span>
              </button>
            </div>
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
                        onClick={() => setSelectedChallenge(withIsland(selectedIsland, challenge))}
                        aria-label={`Fase ${challenge.number}`}
                      >
                        {isLocked ? <Lock size={14} strokeWidth={3} /> : isDone ? <Check size={15} strokeWidth={4} /> : challenge.number}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="map-island-nav" aria-label="Navegacao entre ilhas">
                {quizIslands.map((island, index) => (
                  <button
                    key={island.id}
                    type="button"
                    className={`map-island-nav-button map-island-nav-button-${island.color}${selectedIsland.id === island.id ? ' is-active' : ''}${!isIslandUnlocked(island.id) ? ' is-locked' : ''}`}
                    onClick={() => selectIsland(island.id)}
                    disabled={!isIslandUnlocked(island.id)}
                    aria-label={!isIslandUnlocked(island.id) ? `${island.name} bloqueada` : island.name}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              {feedback && (
                <div className={`map-feedback map-feedback-${feedback.type}`}>
                  <strong>{feedback.title}</strong>
                  <span>{feedback.message}</span>
                </div>
              )}

              <div className="map-card-footer">
                <button type="button" className="map-play-button" onClick={openQuestion}>
                  {getHearts() > 0 ? (isSelectedIslandComplete ? 'Jogar novamente' : 'Jogar') : 'Aguarde'}
                </button>
              </div>
            </>
          )}
        </section>
      )}

      {isPaused && (
        <div className="map-pause-overlay" role="presentation">
          <section
            className="map-pause-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="map-pause-title"
          >
            <button
              type="button"
              className="map-pause-close"
              onClick={() => setIsPaused(false)}
              aria-label="Fechar pausa"
            >
              <X size={34} strokeWidth={4.2} />
            </button>

            <h2 id="map-pause-title">PAUSE</h2>

            <div className="map-pause-audio-actions" aria-label="Controles de audio">
              <button
                type="button"
                className={`map-pause-audio-button${soundOn ? '' : ' is-off'}`}
                data-audio-toggle="true"
                onClick={toggleSound}
                aria-label={soundOn ? 'Desativar sons' : 'Ativar sons'}
                aria-pressed={soundOn}
              >
                <SoundToggleIcon />
                <span>Sons</span>
              </button>

              <button
                type="button"
                className="map-pause-audio-button"
                data-audio-toggle="true"
                onClick={showMusicNotice}
                aria-label="Aviso sobre musica"
              >
                <MusicToggleIcon />
                <span>Musica</span>
              </button>
            </div>

            <div className="map-pause-actions">
              <button
                type="button"
                className="map-pause-action map-pause-action-green"
                onClick={() => setIsPaused(false)}
              >
                <Play size={42} strokeWidth={4.2} fill="currentColor" />
                <span>Continuar</span>
              </button>

              <button
                type="button"
                className="map-pause-action map-pause-action-green"
                onClick={replayAdventure}
              >
                <img src={refreshIcon} alt="" className="map-pause-action-icon" draggable="false" />
                <span>Jogar novamente</span>
              </button>

              <button
                type="button"
                className="map-pause-action map-pause-action-blue"
                onClick={() => navigate('/home-page')}
              >
                <img src={homeIcon} alt="" className="map-pause-action-icon" draggable="false" />
                <span>Ir para home</span>
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
