import { useLocation, useNavigate } from 'react-router-dom';
import './app-nav.css';

import cabanaIcon from '../../assets/icons/cabana.png';
import chapeuIcon from '../../assets/icons/chapeu.png';
import mapinhaIcon from '../../assets/icons/mapinha.png';
import passaporteIcon from '../../assets/icons/passaporte.png';

const navItems = [
  { path: '/home-page', label: 'Início', icon: cabanaIcon },
  { path: '/map', label: 'Mapa', icon: mapinhaIcon },
  { path: '/passport', label: 'Selos', icon: passaporteIcon },
  { path: '/character-selection', label: 'Trocar', icon: chapeuIcon }
];

export default function AppNav({ floating = false }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className={`app-nav-bar${floating ? ' app-nav-bar-floating' : ''}`}>
      {navItems.map((item) => (
        <button
          key={item.path}
          className={`app-nav-item${location.pathname === item.path ? ' is-active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <img src={item.icon} alt="" className="app-nav-icon" />
          <span className="app-nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
