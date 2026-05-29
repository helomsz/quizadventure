import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import './app-nav.css';

import cabanaIcon from '../../assets/icons/cabana.png';
import chapeuIcon from '../../assets/icons/chapeu.png';
import mapinhaIcon from '../../assets/icons/mapinha.png';
import passaporteIcon from '../../assets/icons/passaporte.png';
import mochilinhaIcon from '../../assets/icons/mochilinha.png';

const navItems = [
  { path: '/home-page', label: 'Início', icon: cabanaIcon },
  { path: '/map', label: 'Mapa', icon: mapinhaIcon },
  { path: '/passport', label: 'Selos', icon: passaporteIcon },
  { path: '/inventory', label: 'Inventário', icon: mochilinhaIcon },
  { path: '/character-selection', label: 'Trocar', icon: chapeuIcon },
];

const VISIBLE_ITEMS = 3;

export default function AppNav({ floating = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = useRef(null);

  const [isMobile, setIsMobile] = useState(false);

  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);

    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const scrollNav = (direction) => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    const itemWidth = scrollEl.scrollWidth / navItems.length;
    const maxScroll = scrollEl.scrollWidth - scrollEl.clientWidth;
    const currentScroll = scrollEl.scrollLeft;
    const nextScroll = currentScroll + direction * itemWidth * VISIBLE_ITEMS;

    let targetScroll = nextScroll;
    if (direction < 0 && currentScroll <= 4) {
      targetScroll = maxScroll;
    } else if (direction > 0 && currentScroll >= maxScroll - 4) {
      targetScroll = 0;
    }

    scrollEl.scrollTo({
      left: targetScroll,
      behavior: 'smooth',
    });
  };

  const onMouseDown = (event) => {
    if (!scrollRef.current) return;

    isDragging.current = true;
    startX.current = event.pageX - scrollRef.current.offsetLeft;
    scrollStart.current = scrollRef.current.scrollLeft;
    scrollRef.current.style.cursor = 'grabbing';
  };

  const onMouseUp = () => {
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = 'grab';
  };

  const onMouseMove = (event) => {
    if (!isDragging.current || !scrollRef.current) return;

    event.preventDefault();
    const x = event.pageX - scrollRef.current.offsetLeft;
    scrollRef.current.scrollLeft = scrollStart.current - (x - startX.current) * 1.2;
  };

  return (
    <nav className={`app-nav-bar${floating ? ' app-nav-bar-floating' : ''}`}>
      <button
        type="button"
        className="app-nav-arrow app-nav-arrow-left"
        onClick={() => scrollNav(-1)}
        aria-label="Anterior"
      >
        <ChevronLeft size={28} strokeWidth={4} />
      </button>

      <div
        className="app-nav-scroll"
        ref={scrollRef}
        onMouseDown={isMobile ? onMouseDown : undefined}
        onMouseLeave={isMobile ? onMouseUp : undefined}
        onMouseUp={isMobile ? onMouseUp : undefined}
        onMouseMove={isMobile ? onMouseMove : undefined}
      >
        {navItems.map((item) => (
          <button
            key={item.path}
            type="button"
            className={`app-nav-item${location.pathname === item.path ? ' is-active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <img src={item.icon} alt="" className="app-nav-icon" />
            <span className="app-nav-label">{item.label}</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        className="app-nav-arrow app-nav-arrow-right"
        onClick={() => scrollNav(1)}
        aria-label="Próximo"
      >
        <ChevronRight size={28} strokeWidth={4} />
      </button>
    </nav>
  );
}
