import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Pagina_login';
import PanelEstudiante from './pages/Panel_estudiante';
import PanelDocente from './pages/Panel_docente';
import PanelAdmin from './pages/Panel_admin';
import AdminCrear from './pages/AdminCrear';
import AdminActualizar from './pages/AdminActualizar';
import AdminAsignar from './pages/AdminAsignar';
import AdminEliminar from './pages/AdminEliminar';
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

          {/* NUEVAS RUTAS ADMIN */}
          <Route
            path="/admin/crear"
            element={isAuthenticated ? <AdminCrear /> : <Navigate to="/" />}
          />
          <Route
            path="/admin/actualizar"
            element={isAuthenticated ? <AdminActualizar /> : <Navigate to="/" />}
          />
          <Route
            path="/admin/asignar"
            element={isAuthenticated ? <AdminAsignar /> : <Navigate to="/" />}
          />
          <Route
            path="/admin/eliminar"
            element={isAuthenticated ? <AdminEliminar /> : <Navigate to="/" />}
          />
        </Routes>
      </Router>
      <ToastContainer
        toastClassName={(context) =>
          context?.type === "success"
            ? " w-20 bg-green-100 text-green-800 font-medium rounded-2xl shadow-md text-lg"
            : context?.type === "error"
              ? "w-60 h-20 bg-red-100 text-red-800 font-medium rounded-2xl shadow-md text-lg"
              : ""
        }
        className="toast-container-custom"
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <ToastContainer />
    </>
  );
}

export default App;
