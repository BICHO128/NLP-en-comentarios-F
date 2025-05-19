import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/Autenticacion';
import Footer from '../components/shared/Footer';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from "lucide-react";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Login() {


  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [error, setError] = useState('');

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
    if (!email) {
      return toast.error('Por favor, ingrese su correo electrónico.');
    }
    if (!password) {
      return toast.error('Por favor, ingrese su contraseña.');
    }

    const ok = await login(email, password);

    if (!ok) {
      // return toast.error('Credenciales inválidas. Verifique su correo electrónico y contraseña.');
      setError('Credenciales inválidas. Verifique su correo electrónico y contraseña.');
      if (error.includes('correo')) {
        return toast.error('El correo electrónico no existe.');
      } else if (error.includes('contraseña')) {
        return toast.error('La contraseña es incorrecta.');
      } else {
        return toast.error('Credenciales inválidas. Verifique su correo electrónico y contraseña.');
      }
    }
    // aquí NO necesitas navigate, el useEffect lo hará cuando `user` cambie
  };


  return (
    <div
      className="flex flex-col min-h-screen animate-fade-in"
      style={{
        backgroundImage: "url('/imagenes/fondo_login.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Header */}
      <header className="py-4 bg-transparent">
        <div className="container flex items-center justify-between px-4 mx-auto">
          {/* Header content */}
        </div>
      </header>

      {/* Login Form */}
      <header className="flex items-center justify-center w-full p-4">
        <div className="container flex items-center justify-center px-4 mx-auto transition-all duration-300">
          <h1 className="w-full max-w-screen-xl p-4 text-2xl font-bold text-center transition-all duration-300 bg-white bg-opacity-50 rounded-lg shadow-lg sm:text-xl md:text-2xl lg:text-4xl shadow-black animate-fade-in">
            Autoevaluación del Docente con Procesamiento de Lenguaje Natural
          </h1>
        </div>
      </header>

      <div className="flex items-center justify-center flex-grow px-2 my-20 animate-fade-in">
        <div
          className="
          bg-white bg-opacity-60 p-4 sm:p-6 md:p-8 rounded-lg shadow-black shadow-lg w-full max-w-[70vw] xs:max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg transition-all  duration-300"
        >
          <h2 className="mb-6 text-2xl font-bold text-center sm:text-3xl md:text-4xl">
            Inicio de Sesión
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block mb-1 text-base font-bold text-gray-800 sm:text-lg md:text-xl"
              >
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-base border border-gray-300 rounded-md sm:text-lg md:text-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div className="relative">
              <label
                htmlFor="password"
                className="block mb-1 text-base font-bold text-gray-800 sm:text-lg md:text-xl"
              >
                Contraseña
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-base border border-gray-300 rounded-md sm:text-lg md:text-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={togglePassword}
                className={`absolute bottom-2 right-3 flex items-center justify-center p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-300 ${isAnimating ? "scale-90" : "scale-100"
                  }`}
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                <div className="relative w-6 h-6 text-gray-700 transition-colors duration-300 hover:text-blue-600">
                  {showPassword ? (
                    <Eye className="w-full h-full" />
                  ) : (
                    <EyeOff className="w-full h-full" />
                  )}
                </div>
              </button>
            </div>

            {error && (
              <p className="text-sm text-center text-red-600">{error}</p>
            )}
            <button
              type="submit"
              className="w-full px-4 py-2 text-xl font-bold text-white transition duration-200 bg-blue-600 rounded-md hover:bg-blue-700"
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

