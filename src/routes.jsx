import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import SplashScreen from './pages/splash-screen/splash-screen';
import Onboarding from './pages/onboarding/onboarding';
import CharacterSelection from './pages/character-selection/character-selection';
import HomePage from './pages/home-page/home-page';
import InventoryPage from './pages/inventory/inventory';
import MapPage from './pages/map/map';
import PassportPage from './pages/passport/passport';
import QuizPage from './pages/quiz/quiz';
import GameTopBar from './components/game-top-bar/game-top-bar';

function AppShell() {
  const location = useLocation();
  const isInitialCharacterSelection =
    location.pathname === '/character-selection' && !localStorage.getItem('mapventure_character');
  const hideGameTopBar =
    location.pathname === '/' ||
    location.pathname === '/onboarding' ||
    isInitialCharacterSelection;

  return (
    <>
      {!hideGameTopBar && <GameTopBar />}
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/character-selection" element={<CharacterSelection />} />
        <Route path="/home-page" element={<HomePage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/passport" element={<PassportPage />} />
        <Route path="/quiz/:challengeId" element={<QuizPage />} />
      </Routes>
    </>
  );
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
