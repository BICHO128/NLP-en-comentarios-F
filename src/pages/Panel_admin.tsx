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
import {
  Bars3Icon,
  DocumentPlusIcon,
  PencilSquareIcon,
  UserGroupIcon,
  TrashIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'; // Iconos para el menú


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

      {/* Menú lateral para pantallas pequeñas - Versión profesional */}
      <div className="p-4 sm:hidden">
        <Menu as="div" className="relative">
          {/* Botón del menú */}
          <Menu.Button
            className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            aria-label="Menú de administración"
          >
            <Bars3Icon className="w-6 h-6 text-gray-800 dark:text-gray-200" />
          </Menu.Button>

          {/* Items del menú */}
          <Menu.Items
            className={`absolute left-0 z-50 mt-2 w-56 origin-top-left rounded-3xl shadow-xl ring-1 ring-opacity-5 divide-y focus:outline-none transition-all duration-100 transform border
              ${isDarkMode
                ? "bg-gray-800 dark:bg-gray-800 ring-gray-700 dark:ring-gray-700 divide-gray-400 "
                : "bg-gradient-to-br from-blue-200 via-white to-blue-100 ring-black divide-blue-300 border-blue-300"
              }
            `}
          >
            {/* Primer ítem */}
            <div className="px-1 py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`group flex w-full items-center px-4 py-3 text-sm rounded-b-md rounded-t-2xl transition-all duration-150 ${isDarkMode
                      ? `${active ? "bg-blue-600 text-white" : "text-gray-200"
                      }`
                      : `${active
                        ? "bg-blue-200 text-blue-800"
                        : "text-blue-600"
                      }`
                      }`}
                    onClick={() => handleIntentarIr("/admin/crear")}
                  >
                    <DocumentPlusIcon className="w-5 h-5 mr-3" />
                    Crear usuarios o cursos
                  </button>
                )}
              </Menu.Item>
            </div>

            {/* Segundo ítem */}
            <div className="px-1 py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`group flex w-full items-center px-4 py-3 text-sm rounded-lg transition-all duration-150 ${isDarkMode
                      ? `${active ? "bg-blue-600 text-white" : "text-gray-200"
                      }`
                      : `${active
                        ? "bg-blue-200 text-blue-800"
                        : "text-blue-600"
                      }`
                      }`}
                    onClick={() => handleIntentarIr("/admin/actualizar")}
                  >
                    <PencilSquareIcon className="w-5 h-5 mr-3" />
                    Actualizar información
                  </button>
                )}
              </Menu.Item>
            </div>

            {/* Tercer ítem */}
            <div className="px-1 py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`group flex w-full items-center px-4 py-3 text-sm rounded-lg transition-all duration-150 ${isDarkMode
                      ? `${active ? "bg-blue-600 text-white" : "text-gray-200"
                      }`
                      : `${active
                        ? "bg-blue-200 text-blue-800"
                        : "text-blue-600"
                      }`
                      }`}
                    onClick={() => handleIntentarIr("/admin/asignar")}
                  >
                    <UserGroupIcon className="w-5 h-5 mr-3" />
                    Asignación de cursos
                  </button>
                )}
              </Menu.Item>
            </div>

            {/* Cuarto ítem */}
            <div className="px-1 py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`group flex w-full items-center px-4 py-3 text-sm rounded-lg transition-all duration-150 ${isDarkMode
                      ? `${active ? "bg-blue-600 text-white" : "text-gray-200"
                      }`
                      : `${active
                        ? "bg-blue-200 text-blue-800"
                        : "text-blue-600"
                      }`
                      }`}
                    onClick={() => handleIntentarIr("/admin/eliminar")}
                  >
                    <TrashIcon className="w-5 h-5 mr-3" />
                    Eliminación de usuarios o cursos
                  </button>
                )}
              </Menu.Item>
            </div>

            {/* Botón de descarga */}
            <div className="px-1 py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`group flex w-full items-center justify-center px-4 py-3 text-sm rounded-3xl transition-all duration-150 ${isDarkMode
                      ? `${active
                        ? "bg-green-700 text-white"
                        : "bg-green-600 text-white"
                      }`
                      : `${active
                        ? "bg-green-600 text-white"
                        : "bg-green-500 text-white"
                      }`
                      }`}
                    onClick={descargarExcelAdmin}
                  >
                    <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                    Descargar Excel
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Menu>
      </div>

      {/* Panel horizontal de administración - Versión responsiva unificada */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Contenedor principal - solo visible en pantallas > sm */}
        <div
          className={`hidden sm:flex w-full max-w-screen-2xl mx-auto mt-0 
      ${isDarkMode
              ? "bg-gray-800 border-gray-700 shadow-gray-400 shadow-lg"
              : "bg-white border-blue-200 shadow-blue-200 shadow-lg"
            } border rounded-b-3xl p-3 items-center justify-between flex-wrap`}
        >
          {/* Grupo de botones principales */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Botón Crear */}
            <button
              className={`group flex items-center px-8 py-2.5 rounded-lg text-base md:text-lg font-medium transition-all duration-200 min-w-max
          ${isDarkMode
                  ? "text-gray-200 hover:bg-gray-700 hover:text-white"
                  : "text-blue-600 hover:bg-blue-50 hover:text-blue-600"
                }`}
              onClick={() => handleIntentarIr("/admin/crear")}
            >
              <DocumentPlusIcon className="w-6 h-6 md:w-7 md:h-7 mr-2 flex-shrink-0" />
              <span className="truncate">Crear usuarios o cursos</span>
            </button>

            {/* Botón Actualizar */}
            <button
              className={`group flex items-center px-8 py-2.5 rounded-lg text-base md:text-lg font-medium transition-all duration-200 min-w-max
          ${isDarkMode
                  ? "text-gray-200 hover:bg-gray-700 hover:text-white"
                  : "text-blue-600 hover:bg-blue-50 hover:text-blue-600"
                }`}
              onClick={() => handleIntentarIr("/admin/actualizar")}
            >
              <PencilSquareIcon className="w-6 h-6 md:w-7 md:h-7 mr-2 flex-shrink-0" />
              <span className="truncate">Actualizar información</span>
            </button>

            {/* Botón Asignar */}
            <button
              className={`group flex items-center px-8 py-2.5 rounded-lg text-base md:text-lg font-medium transition-all duration-200 min-w-max
          ${isDarkMode
                  ? "text-gray-200 hover:bg-gray-700 hover:text-white"
                  : "text-blue-600 hover:bg-blue-50 hover:text-blue-600"
                }`}
              onClick={() => handleIntentarIr("/admin/asignar")}
            >
              <UserGroupIcon className="w-6 h-6 md:w-7 md:h-7 mr-2 flex-shrink-0" />
              <span className="truncate">Asignación de cursos</span>
            </button>

            {/* Botón Eliminar */}
            <button
              className={`group flex items-center px-8 py-2.5 rounded-lg text-base md:text-lg font-medium transition-all duration-200 min-w-max
          ${isDarkMode
                  ? "text-gray-200 hover:bg-gray-700 hover:text-white"
                  : "text-blue-600 hover:bg-blue-50 hover:text-blue-600"
                }`}
              onClick={() => handleIntentarIr("/admin/eliminar")}
            >
              <TrashIcon className="w-6 h-6 md:w-7 md:h-7 mr-2 flex-shrink-0" />
              <span className="truncate">Eliminar usuarios/cursos</span>
            </button>
          </div>

          {/* Botón de acción destacado */}
          <div className="group flex items-center px-8 py-2 rounded-lg text-base md:text-lg font-medium transition-all duration-200 min-w-max ">
            <button
              className={` group flex items-center px-4 py-2 rounded-2xl md:rounded-3xl text-base md:text-lg font-medium transition-all duration-200 shadow-lg hover:shadow-lg mt-2 sm:mt-0 flex-shrink-0  md:ml-0
        ${isDarkMode
                  ? "bg-green-600 hover:bg-green-700 text-white shadow-gray-400"
                  : "bg-green-500 hover:bg-green-600 text-white shadow-gray-400"
                }`}
              onClick={descargarExcelAdmin}
            >
              <ArrowDownTrayIcon className="w-6 h-6 md:w-7 md:h-7 mr-1 flex-shrink-0" />
              <span className="truncate">Descargar Excel</span>
            </button>
          </div>
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
        bg-gradient-to-br from-blue-200 via-white to-blue-200
        border border-blue-300 rounded-3xl shadow-lg p-6 mb-8
        transition-all duration-800 hover:shadow-blue-200 hover:scale-[1.01] animate-fade-in
        ${isDarkMode
                    ? "bg-gray-900 border-gray-700 text-blue-900"
                    : "text-blue-900 shadow-blue-200 shadow-lg"
                  }
      `}
              >
                <div className="hover:scale-105 focus:scale-105 duration-300">
                  <h2 className="mb-6 text-4xl font-bold text-blue-800 text-center">
                    ¡Bienvenido(a), {user.username}!
                  </h2>
                  <p className="text-xl ml-3 text-gray-700">
                    A su panel de administración del sistema de evaluación
                    docente. Aquí podrá visualizar los resultados de las
                    evaluaciones realizadas por los estudiantes, incluyendo
                    análisis de comentarios y gráficos estadísticos.
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