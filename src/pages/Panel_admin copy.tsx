import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/Autenticacion';
import Administrador from '../components/Administrador';
import Footer from '../components/shared/Footer';
import Header from '../components/shared/Header';
import DarkModeToggle from '../components/shared/DarkModeToggle';
import { useDarkMode } from '../hooks/useDarkMode';
import { useNavigate } from 'react-router-dom';

const PanelAdmin = () => {
  const { logout, user } = useAuthStore();
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


  function handleLogout(): void {
    logout(); // Llama a la función de logout de tu store
    setRedirectReason('logout'); // Opcional: para mostrar el mensaje de sesión cerrada
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white bg-gradient-to-b from-blue-500 to-blue-300">
        <div className="max-w-md p-8 text-center text-blue-800 bg-white rounded-lg shadow-lg">
          <h1 className="mb-4 text-2xl font-bold">
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


  return (
    <div className={min - h - screen flex flex-col ${isDarkMode ? 'bg-gradient-to-b from-black via-blue-400 to-white' : 'bg-gradient-to-r from-blue-400 via-blue-300 to-white'
    }}
    >
  {/* Header */ }
  < Header onLogout = { handleLogout } />

    {/* Main Content */ }
    < main className = "container flex-grow px-4 py-8 mx-auto" >
      <Administrador />
      </ >

  {/* Boton Dark mode */ }
  < DarkModeToggle />

  {/* Footer */ }
  < Footer />
    </div >
  );
};

export default PanelAdmin;