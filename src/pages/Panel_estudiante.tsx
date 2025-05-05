import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Estudiantes from '../components/Estudiantes';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';
import DarkModeToggle from '../components/shared/DarkModeToggle';
import { useDarkMode } from '../hooks/useDarkMode';
import { useAuthStore } from '../stores/Autenticacion';

const PanelEstudiante = () => {
  const { logout, user } = useAuthStore();
  const [showProfile, setShowProfile] = useState(false);
  const [redirectReason, setRedirectReason] = useState<'reload' | 'logout' | null>(null); // Estado para la razón de redirección
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      // Si no hay usuario, determina la razón de la redirección
      if (!redirectReason) {
        setRedirectReason('reload'); // Si no hay razón, asumimos que es por recarga
      }

      // Redirige después de 2 segundos
      const timeout = setTimeout(() => {
        navigate('/');
      }, 4000);

      return () => clearTimeout(timeout); // Limpia el timeout si el componente se desmonta
    }
  }, [user, navigate, redirectReason]);

  const handleLogout = () => {
    setRedirectReason('logout'); // Establece la razón como cierre de sesión
    logout(); // Llama a la función de cierre de sesión
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-500 to-blue-100 text-white">
        <div
          className="bg-white via-transparent bg-opacity-80 rounded-3xl px-4 py-8 text-blue-800 p-8  text-center max-w-md"
        >
          <svg
            // icono de alerta
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto mb-4 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
            />
          </svg>
          <h1 className="text-4xl font-bold mb-4">
            {redirectReason === "logout"
              ? "Sesión Cerrada"
              : "Recargando Información"}
          </h1>
          <p className=" text-lg mb-4">
            {redirectReason === "logout"
              ? "Cerramos su sesión por temas de seguridad. Por favor vuelva a iniciar sesión."
              : "Parece que recargó la página. Por favor vuelva a iniciar sesión."}
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-10 py-5 text-3xl font-bold bg-blue-500 text-white rounded-full hover:bg-blue-600"
          >
            Hasta la proxima!😁
          </button>
        </div>
      </div>
    );
  }

  const handleProfileClick = () => {
    setShowProfile(!showProfile);
  };

  return (
    <div
      className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gradient-to-b from-black via-blue-400 to-white' : 'bg-white'
        }`}
    >
      {/* Header */}
      <Header onProfileClick={handleProfileClick} />

      {/* Boton Perfil Info */}
      {showProfile && (
        <div
          className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-90 flex justify-end items-start pt-16"
          onClick={() => setShowProfile(false)}
        >
          <div
            className="bg-white shadow-lg rounded-lg p-4 opacity-80"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-2 text-center">
              Información Personal
            </h2>
            <p>
              <strong>Nombre:</strong> {user.username}
            </p>
            <p>
              <strong>Correo Institucional:</strong> {user.email}
            </p>
            <div className="flex items-center space-x-4 justify-center mt-4">
              <button
                onClick={handleProfileClick}
                className="justify-center"
              >
              </button>
              <button
                onClick={handleLogout} // Usa la función de logout personalizada
                className="px-4 py-2 text-blue-800 bg-blue-100 hover:bg-blue-400 rounded-full"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <Estudiantes />
      </main>

      {/* Dark Mode Toggle */}
      <DarkModeToggle />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PanelEstudiante;