import { useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ImageOverlay, MapContainer, Marker } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './map.css';
import MapIslandCard from '../../components/map/map-island-card';
import MapPauseModal from '../../components/map/map-pause-modal';
import { MapFocus, MapZoomControls } from '../../components/map/map-controls';
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

// encontra a próxima fase aberta dentro da ilha
const getNextChallengeInIsland = (island, completedSet) => {
  const nextChallenge = island.challenges.find((challenge) => !completedSet.has(challenge.id));
  return withIsland(island, nextChallenge || island.challenges[island.challenges.length - 1]);
};

// encontra a próxima fase da aventura inteira
const getNextAdventureChallenge = (completed = []) => {
  const completedSet = new Set(completed);
  const nextIsland = quizIslands.find((island) =>
    island.challenges.some((challenge) => !completedSet.has(challenge.id))
  );

  return nextIsland ? getNextChallengeInIsland(nextIsland, completedSet) : lastChallenge;
};

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

  // libera a ilha quando a anterior estiver completa
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
  const mapPlayButtonLabel = (() => {
    if (getHearts() <= 0) return 'Aguarde';
    if (isSelectedIslandComplete) return 'Jogar novamente';
    return selectedIslandCompletedCount > 0 ? 'Próxima pergunta' : 'Jogar';
  })();

  // cria o marcador customizado do mapa
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

  // troca o card para a ilha escolhida
  const selectIsland = (islandId) => {
    if (!isIslandUnlocked(islandId)) return;

    const island = quizIslands.find((item) => item.id === islandId);
    if (!island) return;

    setSelectedChallenge(getNextChallengeInIsland(island, completedSet));
    setFeedback(null);
  };

  // abre a próxima pergunta disponível
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
      {/* voltar */}
      <button
        type="button"
        className="map-back-button"
        onClick={() => navigate('/home-page')}
        aria-label="Voltar para home"
      >
        <img src={arrowIcon} alt="" className="map-back-arrow" draggable="false" />
      </button>

      {/* pause */}
      <button
        type="button"
        className="map-pause-button map-glossy-icon-button"
        onClick={() => setIsPaused(true)}
        aria-label="Pausar"
      >
        <img src={pauseIcon} alt="" className="map-pause-icon" draggable="false" />
      </button>

      {/* mapa */}
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
        /* card da ilha */
        <MapIslandCard
          islands={quizIslands}
          islandIcons={islandIcons}
          islandIcon={islandIcon}
          selectedIsland={selectedIsland}
          selectedChallenge={selectedChallenge}
          selectedIslandCompletedCount={selectedIslandCompletedCount}
          isAdventureComplete={isAdventureComplete}
          completedSet={completedSet}
          feedback={feedback}
          mapPlayButtonLabel={mapPlayButtonLabel}
          trophyIcon={trophyIcon}
          refreshIcon={refreshIcon}
          onClose={() => setSelectedChallenge(null)}
          onReplayAdventure={replayAdventure}
          onOpenQuestion={openQuestion}
          onSelectIsland={selectIsland}
          onSelectChallenge={(island, challenge) => setSelectedChallenge(withIsland(island, challenge))}
          isIslandUnlocked={isIslandUnlocked}
        />
      )}

      {isPaused && (
        /* modal de pause */
        <MapPauseModal
          soundOn={soundOn}
          refreshIcon={refreshIcon}
          homeIcon={homeIcon}
          onClose={() => setIsPaused(false)}
          onToggleSound={toggleSound}
          onShowMusicNotice={showMusicNotice}
          onReplayAdventure={replayAdventure}
          onGoHome={() => navigate('/home-page')}
        />
      )}
    </div>
  );
}
