import { Play, X } from 'lucide-react';
import { MusicToggleIcon, SoundToggleIcon } from '../audio-toggle-icons/audio-toggle-icons';

export default function MapPauseModal({
  soundOn,
  refreshIcon,
  homeIcon,
  onClose,
  onToggleSound,
  onShowMusicNotice,
  onReplayAdventure,
  onGoHome,
}) {
  return (
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
          onClick={onClose}
          aria-label="Fechar pausa"
        >
          <X size={34} strokeWidth={4.2} />
        </button>

        <h2 id="map-pause-title">PAUSE</h2>

        {/* áudio */}
        <div className="map-pause-audio-actions" aria-label="Controles de audio">
          <button
            type="button"
            className={`map-pause-audio-button${soundOn ? '' : ' is-off'}`}
            data-audio-toggle="true"
            onClick={onToggleSound}
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
            onClick={onShowMusicNotice}
            aria-label="Aviso sobre musica"
          >
            <MusicToggleIcon />
            <span>Musica</span>
          </button>
        </div>

        {/* ações */}
        <div className="map-pause-actions">
          <button
            type="button"
            className="map-pause-action map-pause-action-green"
            onClick={onClose}
          >
            <Play size={42} strokeWidth={4.2} fill="currentColor" />
            <span>Continuar</span>
          </button>

          <button
            type="button"
            className="map-pause-action map-pause-action-green"
            onClick={onReplayAdventure}
          >
            <img src={refreshIcon} alt="" className="map-pause-action-icon" draggable="false" />
            <span>Jogar novamente</span>
          </button>

          <button
            type="button"
            className="map-pause-action map-pause-action-blue"
            onClick={onGoHome}
          >
            <img src={homeIcon} alt="" className="map-pause-action-icon" draggable="false" />
            <span>Ir para home</span>
          </button>
        </div>
      </section>
    </div>
  );
}
