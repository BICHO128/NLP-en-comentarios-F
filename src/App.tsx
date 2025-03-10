import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Pagina_login';
import StudentDashboard from './pages/Panel_estudiante';
import TeacherDashboard from './pages/Panel_docente';
import AdminDashboard from './pages/Panel_admin';
import { useAuthStore } from './stores/Autenticacion';

function App() {
  const { isAuthenticated, userRole } = useAuthStore();

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              <Navigate 
                to={`/${userRole}`} 
                replace 
              />
            ) : (
              <LoginPage />
            )
          } 
        />
        <Route 
          path="/student" 
          element={
            isAuthenticated && userRole === 'student' ? (
              <StudentDashboard />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        <Route 
          path="/teacher" 
          element={
            isAuthenticated && userRole === 'teacher' ? (
              <TeacherDashboard />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        <Route 
          path="/admin" 
          element={
            isAuthenticated && userRole === 'admin' ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;