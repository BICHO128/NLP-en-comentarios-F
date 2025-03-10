import React, { useState } from 'react';
import { useAuthStore } from '../stores/Autenticacion';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useAuthStore(state => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = await login(username, password);
    if (!success) {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundImage: "url('/imagenes/fondo_login.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
      {/* Header */}
      <header className="py-4 bg-transparent"><div className="container mx-auto px-4 flex justify-between items-center">
        {/* Header content */}
      </div>
      </header>

      {/* Login Form */}
      <div className="flex-grow flex items-center justify-center px-4">
        <div className="bg-white bg-opacity-20 p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-6">Inicio de Sesion</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-800 mb-1">
                Usuario
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-800 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            {error && (
              <p className="text-red-600 text-sm text-center">{error}</p>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
            >
              Ingresar
            </button>
          </form>
        </div>
      </div>

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

export default LoginPage;
