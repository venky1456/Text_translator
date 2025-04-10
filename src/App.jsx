import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ConfirmSignup from './pages/ConfirmSignup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute'; // Import the ProtectedRoute component
import useIdleTimer from './hooks/useIdleTimer'; // Import the idle timer hook
import ResendVerification from './pages/ResendVerification';

const App = () => {
  const handleIdle = () => {
    // Clear the token and redirect to login
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  // Use the idle timer hook with a 15-minute timeout
  useIdleTimer(handleIdle, 15 * 60 * 1000);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/confirm-signup" element={<ConfirmSignup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/Resend_the_Code" element={<ResendVerification />} />
      {/* Wrap protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Redirect unknown routes to the landing page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;