import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

const AppRoutes: React.FC = () => {
  const location = useLocation();

  if (location.pathname === '/') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <UserProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </UserProvider>
  );
};

export default App;


