import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/Autenticacion';
import Footer from '../components/shared/Footer';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from "lucide-react";

export default function Login() {


  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [error] = useState('');

  const { login, user } = useAuthStore();
  const navigate = useNavigate();

  const togglePassword = () => {
    setIsAnimating(true);
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    if (!user) return;    // nada que hacer hasta que user exista
    if (user.role_id === 3) navigate('/panel-admin');
    else if (user.role_id === 2) navigate('/panel-docente');
    else navigate('/panel-estudiante');
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (!ok) return alert('Credenciales inválidas');
    // aquí NO necesitas navigate, el useEffect lo hará cuando `user` cambie
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundImage: "url('/imagenes/fondo_login.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
      {/* Header */}
      <header className="py-4 bg-transparent">
        <div className="container mx-auto px-4 flex justify-between items-center">
          {/* Header content */}
        </div>
      </header>

      {/* Login Form */}
      <header className="flex justify-center items-center p-8 w-full">
        <div className="container mx-auto px-4 flex justify-center items-center">
          <h1 className="text-2xl sm:text-xl md:text-2xl lg:text-4xl font-bold text-center bg-white bg-opacity-50 p-4 rounded-lg w-full max-w-2xl shadow-lg">
            Autoevaluación del Docente con
            <br />
            Procesamiento de Lenguaje Natural
          </h1>
        </div>
      </header>

      <div className="flex-grow flex items-center justify-center px-4">
        <div className="bg-white bg-opacity-50 p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-4xl font-bold text-center mb-6">Inicio de Sesion</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-xl font-bold text-gray-800 mb-1">
                Correo electrónico
              </label>
              <input

                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xl px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div className="relative">
              <label htmlFor="password" className="block text-xl font-bold text-gray-800 mb-1">
                Contraseña
              </label>
              <input

                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xl px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={togglePassword}
                className={`absolute bottom-2 right-3 flex items-center justify-center p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-300 ${isAnimating ? "scale-90" : "scale-100"
                  }`}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                <div className="relative w-6 h-6 text-gray-700 hover:text-blue-600 transition-colors duration-300">
                  {showPassword ? (
                    <Eye className="w-full h-full" />
                  ) : (
                    <EyeOff className="w-full h-full" />
                  )}
                </div>
              </button>
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

