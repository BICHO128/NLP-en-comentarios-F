import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/Autenticacion';
import Docentes from '../components/Docentes';
import Footer from '../components/shared/Footer';
import Header from '../components/shared/Header';
import DarkModeToggle from '../components/shared/DarkModeToggle';
import { useDarkMode } from '../hooks/useDarkMode';
import { useNavigate } from 'react-router-dom';

const PanelDocente = () => {
  const { logout, user } = useAuthStore();
  const [showProfile, setShowProfile] = useState(false);
  const [redirectReason, setRedirectReason] = useState<'reload' | 'logout' | null>(null); // Estado para la razón de redirección
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user && redirectReason) {
      // Muestra el mensaje de alerta basado en la razón
      if (redirectReason === 'reload') {
        window.alert('Por seguridad, será redirigido al inicio.');
      } else if (redirectReason === 'logout') {
        window.alert('Sesión cerrada. ¡Vuelve pronto!');
      }

      // Redirige después de mostrar el mensaje
      const timeout = setTimeout(() => {
        navigate('/');
      }, 4000);

      return () => clearTimeout(timeout);
    }
  }, [user, navigate, redirectReason]);

  const handleLogout = () => {
    setRedirectReason('logout'); // Establece la razón como cierre de sesión
    logout(); // Llama a la función de cierre de sesión
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-500 to-blue-300 text-white">
        <div className="bg-white text-blue-800 p-8 rounded-lg shadow-lg text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">
            {redirectReason === 'logout'
              ? 'Sesión Cerrada'
              : 'Recargando Información'}
          </h1>
          <p className="mb-6">
            {redirectReason === 'logout'
              ? 'Cerramos su sesión por temas de seguridad. Por favor vuelva a iniciar sesión.'
              : 'Parece que recargó la página. Por favor vuelva a iniciar sesión.'}
          </p>
        </div>
      </div>
    );
  }

  const handleProfileClick = () => {
    setShowProfile(!showProfile);
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gradient-to-b from-black via-blue-400 to-white' : 'bg-white'}`}>
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
            <h2 className="text-xl font-bold mb-2 text-center">Información Personal</h2>
            <p>
              <strong>Nombre:</strong> {user?.username || 'Administrador'}
            </p>
            <p>
              <strong>Correo Institucional:</strong> {user?.email || 'admin@uniautonoma.edu.co'}
            </p>
            <div className="flex items-center space-x-4 justify-center mt-4">
              <button
                onClick={handleLogout}
                className="px-2 py-1 text-blue-800 bg-blue-100 hover:bg-blue-400 rounded-full"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <Docentes />
      </main>

      {/* Boton Dark mode */}
      <DarkModeToggle />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PanelDocente;