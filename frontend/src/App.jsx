import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const token = localStorage.getItem('admin_token');
  return token ? children : <Navigate to="/admin" />;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rotas do psicólogo */}
        <Route path="/dashboard/*" element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />

        {/* Rotas do admin */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/panel" element={
          <AdminRoute><AdminPanel /></AdminRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
