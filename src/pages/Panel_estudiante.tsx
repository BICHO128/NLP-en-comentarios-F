// import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Estudiantes from '../components/Estudiantes';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';
import DarkModeToggle from '../components/shared/DarkModeToggle';
import { useDarkMode } from '../hooks/useDarkMode';
import { useAuthStore } from '../stores/Autenticacion';


const PanelEstudiante = () => {
  const { logout, user } = useAuthStore();
  // const [redirectReason, setRedirectReason] = useState<'reload' | 'logout' | null>(null); // Estado para la razón de redirección
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();


  const handleLogout = () => {
    logout(); // Limpia el estado de autenticación
    navigate('/'); // Redirige al login
  };



  // if (!user) {
  //   return (
  //     <div className="flex flex-col items-center justify-center min-h-screen text-white bg-gradient-to-b from-blue-500 to-blue-100">
  //       <div
  //         className="max-w-md p-8 px-4 py-8 text-center text-blue-800 bg-white via-transparent bg-opacity-80 rounded-3xl"
  //       >
  //         <svg
  //           // icono de alerta
  //           xmlns="http://www.w3.org/2000/svg"
  //           className="w-16 h-16 mx-auto mb-4 text-blue-500"
  //           fill="none"
  //           viewBox="0 0 24 24"
  //           stroke="currentColor"
  //         >
  //           <path
  //             strokeLinecap="round"
  //             strokeLinejoin="round"
  //             strokeWidth={2}
  //             d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
  //           />
  //         </svg>
  //         <h1 className="mb-4 text-4xl font-bold">
  //           {redirectReason === "logout"
  //             ? "Sesión Cerrada"
  //             : "Recargando Información"}
  //         </h1>
  //         <p className="mb-4 text-lg ">
  //           {redirectReason === "logout"
  //             ? "Cerramos su sesión por temas de seguridad. Por favor vuelva a iniciar sesión."
  //             : "Parece que recargó la página. Por favor vuelva a iniciar sesión."}
  //         </p>
  //         <button
  //           onClick={() => navigate("/")}
  //           className="px-10 py-5 text-3xl font-bold text-white bg-blue-500 rounded-full hover:bg-blue-600"
  //         >
  //           Hasta la proxima!😁
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div
      className={`min-h-screen flex flex-col ${isDarkMode
        ? "bg-gradient-to-b from-black via-blue-400 to-white"
        : "bg-white"
        }`}
    >
      {/* Header */}
      <Header onLogout={handleLogout} />

      <div className="container flex-grow-0 sm:container px-10 py-8 mx-auto">
        {/* Contenido de Bienvenida */}

        {/* Contenedor principal alineado */}
        <div className="max-w-screen-xl sm:max-w-screen-2xl flex flex-col items-start -mx-4 px-8 lg:px-8 mt-10">
          <div className="flex flex-col justify-start flex-grow-0 my-0 animate-fade-in">
            {/* Bienvenida */}
            {user && (
              <div
                className={`
                  w-full
                  bg-gradient-to-br from-blue-200 via-white to-blue-100
                  border border-blue-300 rounded-3xl shadow-xl p-6 mb-8
                  transition-all duration-800 hover:shadow-blue-200 hover:scale-[1.01] animate-fade-in
                  ${isDarkMode
                    ? "bg-gray-900 border-gray-700 text-blue-900"
                    : "text-blue-900"
                  }
                `}
              >
                <div className="hover:scale-105 focus:scale-105 duration-300">
                  <h2 className="text-3xl font-bold mb-6 text-center">
                    ¡Bienvenido(a), {user.username}!
                  </h2>
                  <p className="mb-10 text-center text-xl/5">
                    En esta sección podrás evaluar a tus docentes y cursos de
                    manera anónima y segura.
                  </p>
                  <ul className="mb-12 text-blue-800 text-start text-lg/5 dark:text-gray-500">
                    <li className="mb-3 text-gray-800">
                      Debes tener en cuenta lo siguiente:
                    </li>
                    <li>
                      • Todos los campos son{" "}
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        obligatorios
                      </span>
                      .
                    </li>
                    <li>
                      • Debes seleccionar un docente y un curso antes de
                      continuar.
                    </li>
                    <li>
                      • Los comentarios deben tener buena ortografía y cumplir
                      con la cantidad mínima de palabras y caracteres.
                    </li>
                  </ul>
                  <p className="text-base text-center text-gray-800 dark:text-gray-800">
                    Si tienes dudas, contacta a soporte académico.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container flex-grow px-10 py-8 mx-auto">
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