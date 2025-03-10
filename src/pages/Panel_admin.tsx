import { useState } from 'react';
import { useAuthStore } from '../stores/Autenticacion';
import Administrador from '../components/Administrador';

const AdminDashboard = () => {
  const logout = useAuthStore(state => state.logout);
  const [showProfile, setShowProfile] = useState(false);
  
    const handleProfileClick = () => {
      setShowProfile(!showProfile);
    };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-blue-800 text-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img 
              src="/public/imagenes/logo_autonoma.png" 
              alt="Logo Uniautonoma" 
              className="h-20"
            />
            <h1 className="text-2xl font-bold">Corporación Universitaria Autónoma del Cauca</h1>
            </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleProfileClick}
              className="justify-center"
            >
              <img 
                src="/public/imagenes/perfil.png" 
                alt="Perfil" 
                className="h-14 w-14 rounded-full"
              />
            </button>
            <button
            onClick={logout}
            className="px-2 py-1 text-blue-800 bg-blue-100 hover:bg-blue-400 rounded-full"
            >
            Cerrar Sesión
            </button>
          </div>
        </div>
      </header>
      {/* Boton Perfil Info */}
      {showProfile && (
        <div className="absolute top-16 right-16 bg-white shadow-lg rounded-lg p-4">
          <h2 className="text-xl font-bold mb-2">Información Personal</h2>
          <p><strong>Nombre:</strong> Nombre del Administrador</p>
          <p><strong>Correo Institucional:</strong> Administrador@uniautonoma.edu.co</p>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <Administrador />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0 md:w-1/2">
              <div className="flex items-center space-x-2 mb-4">
                <img 
                  src="/public/imagenes/logo_autonoma.png" 
                  alt="Logo Uniautonoma" 
                  className="h-12"
                />
                <h2 className="text-xl font-bold">Corporación Universitaria Autónoma del Cauca</h2>
              </div>
              <p className="text-gray-400 max-w-md">
                Proyecto de análisis de comentarios estudiantiles mediante procesamiento de lenguaje natural para la Corporación Universitaria Autónoma del Cauca.
              </p>
            </div>
            <div className="md:w-1/2">
              <h3 className="text-lg font-semibold mb-4">Contacto</h3>
              <p className="text-gray-400">Corporación Universitaria Autónoma del Cauca</p>
              <p className="text-gray-400">Popayán, Cauca, Colombia</p>
              <a 
                href="https://www.uniautonoma.edu.co/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 mt-2 inline-block"
              >
                www.uniautonoma.edu.co
              </a>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Corporación Universitaria Autónoma del Cauca. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;