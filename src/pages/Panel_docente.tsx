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


  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gradient-to-b from-black via-blue-400 to-white' : 'bg-white'
      }`}
    >

      {/* Header */}
      <Header onLogout={handleLogout} />

      {user && (
        <div
          className={`
          relative z-20 w-full max-w-3xl mx-auto
            bg-gradient-to-br from-blue-200 via-white to-blue-100
            border border-blue-300 rounded-2xl shadow-xl p-6 mt-10
            transition-all duration-800 hover:shadow-blue-200 hover:scale-[2.01] animate-fade-in
          ${isDarkMode ? "bg-gray-900 border-gray-700 text-blue-900" : "text-blue-900"}
        `}
        >
          <div className='hover:scale-110 focus:scale-110 duration-300'>
            <h2 className="text-3xl font-bold mb-6 text-center">
              ¡Bienvenido(a), {user.username}!
            </h2>
            <p className="text-center mb-10 text-xl/5 text-blue-800 dark:text-blue-800">
              Aquí puedes consultar y analizar las evaluaciones recibidas de tus estudiantes.
            </p>
            <ul className="text-center text-lg/5 text-blue-800 dark:text-gray-500 mb-12">
              <li> Solo tú puedes ver los resultados de tus evaluaciones.</li>
            </ul>
            <p className="text-center text-base text-gray-800 dark:text-gray-800">
              Si tienes dudas, contacta a soporte académico.
            </p>
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