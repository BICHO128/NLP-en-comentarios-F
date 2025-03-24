import React, { useState } from 'react';
import { useAuthStore } from '../stores/Autenticacion';
import Footer from '../components/shared/Footer';

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
      <header className="flex justify-center items-center p-8 w-full">
        <div className="container mx-auto px-4 flex justify-center items-center">
          <h1 className="text-2xl sm:text-xl md:text-2xl lg:text-4xl font-bold text-center bg-white bg-opacity-70 p-4 rounded-lg w-full max-w-2xl shadow-lg">
            Autoevaluación del Docente con
            <br />
            Procesamiento de Lenguaje Natural
          </h1>
        </div>
      </header>



      <div className="flex-grow flex items-center justify-center px-4">
        <div className="bg-white bg-opacity-70 p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-4xl font-bold text-center mb-6">Inicio de Sesion</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-xl font-bold text-gray-800 mb-1">
                Usuario
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full text-xl px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xl font-bold text-gray-800 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xl px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            {error && (
              <p className="text-red-600 text-sm text-center">{error}</p>
            )}
            <button
              type="submit"
              className="w-full text-xl font-bold bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
            >
              Ingresar
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LoginPage;
