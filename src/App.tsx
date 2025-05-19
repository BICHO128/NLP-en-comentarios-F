import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Pagina_login';
import PanelEstudiante from './pages/Panel_estudiante';
import PanelDocente from './pages/Panel_docente';
import PanelAdmin from './pages/Panel_admin'; // si lo tienes
import { useAuthStore } from './stores/Autenticacion';
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/panel-estudiante" element={<PanelEstudiante />} />
          <Route
            path="/panel-docente"
            element={isAuthenticated ? <PanelDocente /> : <Navigate to="/" />}
          />
          <Route
            path="/panel-admin"
            element={isAuthenticated ? <PanelAdmin /> : <Navigate to="/" />}
          />
        </Routes>
      </Router>
      <ToastContainer
        toastClassName={(context) =>
          context?.type === "error" ? "toast-error-custom" : ""
        }
        className="toast-container-custom"  // <--- usa className aquí
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default App;