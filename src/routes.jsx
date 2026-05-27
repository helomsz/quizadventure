import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SplashScreen from './pages/splash-screen/splash-screen';
import Onboarding from './pages/onboarding/onboarding';
import CharacterSelection from './pages/character-selection/character-selection';
import HomePage from './pages/home-page/home-page';
import MapPage from './pages/map/map';
import QuizPage from './pages/quiz/quiz';
import GameTopBar from './components/game-top-bar/game-top-bar';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <GameTopBar />
      <Routes>
        {/* Tela Inicial: Splash */}
        <Route path="/" element={<SplashScreen />} />
        
        {/* Segunda Tela: Introdução e Contexto */}
        <Route path="/onboarding" element={<Onboarding />} />
        
        {/* Terceira Tela: Escolha de Personagem */}
        <Route path="/character-selection" element={<CharacterSelection />} />
        <Route path="/home-page" element={<HomePage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/quiz/:challengeId" element={<QuizPage />} />
      </Routes>
    </BrowserRouter>
  );
}
