import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SplashScreen from './pages/splash-screen/splash-screen';
import Onboarding from './pages/onboarding/onboarding';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/onboarding" element={<Onboarding />} />
      </Routes>
    </BrowserRouter>
  );
}