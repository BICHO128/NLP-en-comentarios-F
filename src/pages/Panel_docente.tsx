import { useState } from 'react';

import Docentes from '../components/Docentes';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';
import DarkModeToggle from '../components/shared/DarkModeToggle';
import { useDarkMode } from '../hooks/useDarkMode';
import { useAuthStore } from '../stores/Autenticacion';


const StudentDashboard = () => {
  const { logout } = useAuthStore();
  const [showProfile, setShowProfile] = useState(false);
  const { isDarkMode } = useDarkMode();

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
            <h2 className="text-xl font-bold mb-2">Información Personal</h2>

            <p>
              <strong>Nombre:</strong> Nombre del Administrador
            </p>
            <p>
              <strong>Correo Institucional:</strong>{" "}
              Administrador@uniautonoma.edu.co
            </p>
            <div className="flex items-center space-x-4 justify-center mt-4">

              <button
                onClick={logout}
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

      {/* Footer */}
      <Footer />

      {/* Boton Dark mode */}
      <DarkModeToggle />

    </div>
  );
};

export default StudentDashboard;