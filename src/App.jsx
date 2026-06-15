import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import Home from './pages/Home';
import Quran from './pages/Quran';
import Game from './pages/Game';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import Adhkar from './pages/Adhkar';
import Qibla from './pages/Qibla';
import Names from './pages/Names';
import Tasbeeh from './pages/Tasbeeh';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Private Layout wrapper */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="quran" element={<Quran />} />
          <Route path="game" element={<Game />} />
          <Route path="admin" element={<Admin />} />
          <Route path="adhkar" element={<Adhkar />} />
          <Route path="qibla" element={<Qibla />} />
          <Route path="names" element={<Names />} />
          <Route path="tasbeeh" element={<Tasbeeh />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
