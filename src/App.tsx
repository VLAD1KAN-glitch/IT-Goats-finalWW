/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore, useThemeStore } from './store';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { TournamentPublic } from './pages/TournamentPublic';
import { TournamentAdmin } from './pages/TournamentAdmin';
import { CreateTournament } from './pages/CreateTournament';
import { Profile } from './pages/Profile';
import { AnimatePresence } from 'motion/react';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="tournaments/new" element={<CreateTournament />} />
          <Route path="tournaments/:id" element={<TournamentPublic />} />
          <Route path="tournaments/:id/admin" element={<TournamentAdmin />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const initializeAuth = useAuthStore((state) => state.initialize);
  const initializeTheme = useThemeStore((state) => state.initialize);

  useEffect(() => {
    initializeAuth();
    initializeTheme();
  }, [initializeAuth, initializeTheme]);

  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
