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
            element={
              isAuthenticated ? <AdminActualizar /> : <Navigate to="/" />
            }
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

      {/* ÚNICO ToastContainer CON CONFIGURACIÓN COMPLETA */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false} // Cambiado a false para evitar desapariciones
        draggable
        pauseOnHover
        theme="colored"
        style={{ width: "auto", maxWidth: "500px" }}
        toastStyle={{
          borderRadius: "12px",
          padding: "16px",
          fontSize: "16px",
          margin: "8px",
        }}
      />
    </>
  );
}

export default App;