import { useEffect, useMemo, useRef, useState } from 'react';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import quizIslands from '../../data/quiz-questions.json';
import { getStamps, PASSPORT_PLACED_KEY } from '../../utils/game-state';
import seloTropical from '../../assets/selos/selo-tropical.png';
import seloDeserto from '../../assets/selos/selo-deserto.png';
import seloGelo from '../../assets/selos/selo-gelo.png';
import seloLava from '../../assets/selos/selo-lava.png';
import passportMobileBg from '../../assets/backgrounds/passaporte-aberto-mobile.png';
import passportDesktopBg from '../../assets/backgrounds/passaporte-aberto-desktop.png';
import arrowIcon from '../../assets/icons/icone-seta.svg';
import './passport.css';

const stampImages = {
  tropical: seloTropical,
  desert: seloDeserto,
  ice: seloGelo,
  volcano: seloLava,
};

const desktopStampSlots = {
  tropical: { x: 25.9, y: 33.9 },
  desert: { x: 37.1, y: 65.9 },
  ice: { x: 62.6, y: 33.8 },
  volcano: { x: 73.2, y: 64.8 },
};

const mobileStampSlots = {
  tropical: { x: 25, y: 42.9 },
  desert: { x: 35, y: 52.7 },
  ice: { x: 62.5, y: 44 },
  volcano: { x: 74.1, y: 53.6 },
};

const loadPlacedStamps = () => {
  try {
    const placedStamps = JSON.parse(localStorage.getItem(PASSPORT_PLACED_KEY)) || {};

    return Object.fromEntries(
      Object.entries(placedStamps).filter(([, value]) => value?.placedAt)
    );
  } catch {
    return {};
  }
};

export default function PassportPage() {
  const navigate = useNavigate();
  const slotsRef = useRef({});
  const [isMobile, setIsMobile] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
  ));
  const earnedStamps = useMemo(() => new Set(getStamps()), []);
  const [placedStamps, setPlacedStamps] = useState(loadPlacedStamps);
  const [draggingStamp, setDraggingStamp] = useState(null);
  const stampSlots = isMobile ? mobileStampSlots : desktopStampSlots;

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const updateIsMobile = () => setIsMobile(mediaQuery.matches);

    updateIsMobile();
    mediaQuery.addEventListener('change', updateIsMobile);

    return () => {
      mediaQuery.removeEventListener('change', updateIsMobile);
    };
  }, []);

  const savePlacedStamps = (nextPlacedStamps) => {
    setPlacedStamps(nextPlacedStamps);
    localStorage.setItem(PASSPORT_PLACED_KEY, JSON.stringify(nextPlacedStamps));
  };

  const startDrag = (event, island, fromSlot = false) => {
    if (!earnedStamps.has(island.id)) return;

    event.currentTarget.setPointerCapture?.(event.pointerId);
    event.preventDefault();
    setDraggingStamp({
      id: island.id,
      fromSlot,
      x: event.clientX,
      y: event.clientY,
    });
  };

  useEffect(() => {
    if (!draggingStamp) return undefined;

    const moveStamp = (event) => {
      setDraggingStamp((current) => (
        current ? { ...current, x: event.clientX, y: event.clientY } : current
      ));
    };

    const dropStamp = (event) => {
      const targetSlot = slotsRef.current[draggingStamp.id];
      const slotRect = targetSlot?.getBoundingClientRect();
      const hitSlot = slotRect
        && event.clientX >= slotRect.left
        && event.clientX <= slotRect.right
        && event.clientY >= slotRect.top
        && event.clientY <= slotRect.bottom;

      if (hitSlot) {
        savePlacedStamps({
          ...placedStamps,
          [draggingStamp.id]: { placedAt: Date.now() },
        });
      }

      setDraggingStamp(null);
    };

    window.addEventListener('pointermove', moveStamp);
    window.addEventListener('pointerup', dropStamp);
    window.addEventListener('pointercancel', dropStamp);

    return () => {
      window.removeEventListener('pointermove', moveStamp);
      window.removeEventListener('pointerup', dropStamp);
      window.removeEventListener('pointercancel', dropStamp);
    };
  }, [draggingStamp, placedStamps]);

  const visibleDockStamps = quizIslands.filter((island) => (
    earnedStamps.has(island.id) && !placedStamps[island.id]
  ));
  const lockedDockStamps = quizIslands.filter((island) => !earnedStamps.has(island.id));
  const draggingIsland = quizIslands.find((island) => island.id === draggingStamp?.id);

  return (
    <main className="passport-screen">
      <div className="passport-art">
        <picture className="passport-background">
          <source srcSet={passportDesktopBg} media="(min-width: 768px)" />
          <img src={passportMobileBg} alt="" />
        </picture>

        <section className="passport-drop-layer" aria-label="Passaporte de selos">
          {quizIslands.map((island) => {
            const slot = stampSlots[island.id];
            const isPlaced = placedStamps[island.id] && earnedStamps.has(island.id);
            const isDraggingThis = draggingStamp?.id === island.id;

            return (
              <div
                key={island.id}
                ref={(element) => {
                  slotsRef.current[island.id] = element;
                }}
                className={`passport-stamp-slot passport-stamp-slot-${island.id}`}
                style={{ '--slot-x': `${slot.x}%`, '--slot-y': `${slot.y}%` }}
              >
                {isPlaced && !isDraggingThis && (
                  <button
                    type="button"
                    className="passport-placed-stamp"
                    onPointerDown={(event) => startDrag(event, island, true)}
                    aria-label={`Mover ${island.stamp}`}
                  >
                    <img src={stampImages[island.id]} alt={island.stamp} draggable="false" />
                  </button>
                )}
              </div>
            );
          })}
        </section>
      </div>

      <button
        type="button"
        className="passport-back-button"
        onClick={() => navigate('/home-page')}
        aria-label="Voltar para home"
      >
        <img
            src={arrowIcon}
            alt="seta para voltar para home"
            className="arrow-left"
        />
      </button>

      <section className="passport-stamp-dock" aria-label="Selos para colar">
        {visibleDockStamps.map((island) => (
          <button
            key={island.id}
            type="button"
            className="passport-dock-stamp"
            onPointerDown={(event) => startDrag(event, island)}
            aria-label={`Arrastar ${island.stamp}`}
          >
            <img src={stampImages[island.id]} alt={island.stamp} draggable="false" />
          </button>
        ))}

        {lockedDockStamps.map((island) => (
          <div key={island.id} className="passport-dock-stamp is-locked" aria-label={`${island.stamp} bloqueado`}>
            <Lock size={28} strokeWidth={3.2} />
          </div>
        ))}
      </section>

      {draggingIsland && (
        <div
          className={`passport-dragging-stamp passport-dragging-stamp-${draggingIsland.id}`}
          style={{ left: draggingStamp.x, top: draggingStamp.y }}
          aria-hidden="true"
        >
          <img src={stampImages[draggingIsland.id]} alt="" draggable="false" />
        </div>
      )}
    </main>
  );
}
