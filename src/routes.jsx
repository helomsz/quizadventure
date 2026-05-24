import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SplashScreen from './pages/splash-screen/splash-screen';
import Onboarding from './pages/onboarding/onboarding';
import CharacterSelection from './pages/character-selection/character-selection';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Tela Inicial: Splash */}
        <Route path="/" element={<SplashScreen />} />
        
        {/* Segunda Tela: Introdução e Contexto */}
        <Route path="/onboarding" element={<Onboarding />} />
        
        {/* Terceira Tela: Escolha de Personagem */}
        <Route path="/character-selection" element={<CharacterSelection />} />
      </Routes>
    </BrowserRouter>
  );
}