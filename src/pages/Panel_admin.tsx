import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/Autenticacion';
import Administrador from '../components/Administrador';
import Footer from '../components/shared/Footer';
import Header from '../components/shared/Header';
import DarkModeToggle from '../components/shared/DarkModeToggle';
import { useDarkMode } from '../hooks/useDarkMode';
import { useNavigate } from 'react-router-dom';
import ModalConfirmarClave from '../components/ModalConfirmarClave'; // la ruta según tu estructura
import { Menu } from '@headlessui/react';
import { Bars3Icon } from '@heroicons/react/24/outline'; // Iconos para el menú


const PanelAdmin = () => {
  const { logout, user } = useAuthStore();
  const [redirectReason, setRedirectReason] = useState<'reload' | 'logout' | null>(null); // Estado para la razón de redirección
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [rutaDestino, setRutaDestino] = useState<string | null>(null);
  const { token } = useAuthStore();


  function handleIntentarIr(ruta: string) {
    setRutaDestino(ruta);
    setModalOpen(true);
  }


  // Simulación de validación contra backend
  async function verificarClaveBackend(clave: string): Promise<boolean> {
    // Debes tener el token JWT ya disponible en tu store o contexto
    try {
      const res = await fetch("http://localhost:5000/api/admin/verificar-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Asegúrate de que el token esté definido
        },
        body: JSON.stringify({ password: clave }),
      });
      if (res.status === 200) {
        setModalOpen(false);
        setTimeout(() => {
          if (rutaDestino) navigate(rutaDestino);
        }, 150);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

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


  // Descargar Excel global
  const descargarExcelAdmin = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/reportes/admin/excel', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al generar Excel');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reporte_admin_evaluaciones.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('No se pudo descargar el Excel');
    }
  };


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
    <div
      className={`min-h-screen flex flex-col ${isDarkMode
        ? "bg-gradient-to-b from-black via-blue-400 to-white"
        : "bg-white"
        }`}
    >
      {/* Header - Siempre visible y con z-index alto para estar por encima */}
      <div className="relative z-50 w-full">
        <Header onLogout={handleLogout} />
      </div>

      {/* Menú lateral para pantallas pequeñas */}
      <div className="p-4 sm:hidden">
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full dark:bg-gray-200">

            <Bars3Icon className="w-10 h-10 text-gray-800 dark:text-white" />
          </Menu.Button>
          <Menu.Items className="absolute left-0 z-50 mt-2 w-48 origin-top-left bg-white divide-y divide-gray-200 rounded-md shadow-lg dark:bg-gray-800 dark:divide-gray-700">
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${active ? "bg-gray-100 dark:bg-gray-700" : ""
                    } block w-full px-4 py-2 text-left text-sm text-gray-800 dark:text-white`}
                  onClick={() => handleIntentarIr("/admin/crear")}
                >
                  Crear usuarios o cursos
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${active ? "bg-gray-100 dark:bg-gray-700" : ""
                    } block w-full px-4 py-2 text-left text-sm text-gray-800 dark:text-white`}
                  onClick={() => handleIntentarIr("/admin/actualizar")}
                >
                  Actualizar información
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${active ? "bg-gray-100 dark:bg-gray-700" : ""
                    } block w-full px-4 py-2 text-left text-sm text-gray-800 dark:text-white`}
                  onClick={() => handleIntentarIr("/admin/asignar")}
                >
                  Asignación de cursos
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${active ? "bg-gray-100 dark:bg-gray-700" : ""
                    } block w-full px-4 py-2 text-left text-sm text-gray-800 dark:text-white`}
                  onClick={() => handleIntentarIr("/admin/eliminar")}
                >
                  Eliminación de usuarios o cursos
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Menu>
      </div>

      {/* BLOQUE DE ACCIONES ADMIN */}
      <div className="w-auto ml-14 mr-14">
        {/* Contenedor de botones para pantallas grandes */}
        <div
          className={`hidden sm:flex w-full max-w-screen-2xl mx-auto mt-0 bg-gradient-to-br 
            ${isDarkMode
              ? "from-gray-900 to-gray-800"
              : "from-blue-100 via-white to-blue-200"
            } border ${isDarkMode ? "border-gray-700" : "border-blue-300"
            } rounded-b-3xl shadow-md p-2 flex-wrap items-center justify-between gap-2 px-4 sm:px-6 lg:px-8`}
        >
          <button
            className={`text-sm px-4 py-2 rounded-md font-medium transition ${isDarkMode
              ? "bg-gray-800 text-white hover:bg-gray-700"
              : "bg-white text-blue-800 hover:bg-blue-100"
              }`}
            onClick={() => handleIntentarIr("/admin/crear")}
          >
            Crear usuarios o cursos
          </button>
          <button
            className={`text-sm px-4 py-2 rounded-md font-medium transition ${isDarkMode
              ? "bg-gray-800 text-white hover:bg-gray-700"
              : "bg-white text-blue-800 hover:bg-blue-100"
              }`}
            onClick={() => handleIntentarIr("/admin/actualizar")}
          >
            Actualizar información
          </button>
          <button
            className={`text-sm px-4 py-2 rounded-md font-medium transition ${isDarkMode
              ? "bg-gray-800 text-white hover:bg-gray-700"
              : "bg-white text-blue-800 hover:bg-blue-100"
              }`}
            onClick={() => handleIntentarIr("/admin/asignar")}
          >
            Asignación de cursos
          </button>
          <button
            className={`text-sm px-4 py-2 rounded-md font-medium transition ${isDarkMode
              ? "bg-gray-800 text-white hover:bg-gray-700"
              : "bg-white text-blue-800 hover:bg-blue-100"
              }`}
            onClick={() => handleIntentarIr("/admin/eliminar")}
          >
            Eliminación de usuarios o cursos
          </button>
          <button
            className={`text-sm px-4 py-2 rounded-md font-medium transition ${isDarkMode
              ? "bg-green-700 text-white hover:bg-green-800"
              : "bg-green-600 text-white hover:bg-green-700"
              }`}
            onClick={descargarExcelAdmin}
          >
            Descargar Excel
          </button>
        </div>
        <ModalConfirmarClave
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={verificarClaveBackend}
        />
      </div>

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
                  <h2 className="mb-6 text-4xl font-bold text-blue-800 text-center">
                    ¡Bienvenido(a), {user.username}!
                  </h2>
                  <p className="text-xl ml-3 text-gray-700">
                    A su panel de administración del sistema de evaluación docente. Aquí podrá visualizar los resultados de las evaluaciones realizadas por los estudiantes, incluyendo análisis de comentarios y gráficos estadísticos.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Ahora ocupa toda la altura disponible */}
      <main className="flex-grow container mx-auto px-8 py-8">
        <Administrador />
      </main>

      {/* Boton Dark mode */}
      <DarkModeToggle />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PanelAdmin;