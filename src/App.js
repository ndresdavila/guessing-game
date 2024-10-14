import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import MainMenu from './components/MainMenu';
import GamePage from './components/GamePage';
import StorePage from './components/StorePage';
import WalletConnectPage from './components/WalletConnectPage';
import { UserProvider } from './context/UserContext';
import ProtectedRoute from './components/ProtectedRoute'; // Ruta protegida para usuarios autenticados
import PublicRoute from './components/PublicRoute'; // Nueva ruta pública

function App() {
  return (
    <UserProvider> 
      <Router>
        <Routes>
          {/* Ruta pública para login, solo si el usuario no está autenticado */}
          <Route exact path="/" element={<PublicRoute><LoginPage /></PublicRoute>} />
          
          {/* Rutas protegidas para usuarios autenticados */}
          <Route path="/menu" element={<ProtectedRoute><MainMenu /></ProtectedRoute>} />
          <Route path="/game" element={<ProtectedRoute><GamePage /></ProtectedRoute>} />          <Route path="/store" element={<ProtectedRoute><StorePage /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><WalletConnectPage /></ProtectedRoute>} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
