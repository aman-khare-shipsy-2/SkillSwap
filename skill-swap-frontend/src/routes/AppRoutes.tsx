import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Login from '../pages/Login';
import Register from '../pages/Register';
import SkillSelection from '../pages/SkillSelection';
import Dashboard from '../pages/Dashboard';
import Chat from '../pages/Chat';
import VerificationTest from '../pages/VerificationTest';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuthStore();
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Skill Selection Route - Only accessible if user has no offered skills
const SkillSelectionRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, user } = useAuthStore();
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // If user already has skills, redirect to dashboard
  if (user?.offeredSkills && user.offeredSkills.length > 0) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { token } = useAuthStore();

  return (
    <Routes>
      <Route
        path="/login"
        element={token ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={token ? <Navigate to="/skill-selection" replace /> : <Register />}
      />
      <Route
        path="/skill-selection"
        element={
          <SkillSelectionRoute>
            <SkillSelection />
          </SkillSelectionRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat/:chatId"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/verification/:skillId"
        element={
          <ProtectedRoute>
            <VerificationTest />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;

