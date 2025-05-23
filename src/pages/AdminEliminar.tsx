import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaTrash } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import { useAuthStore } from "../stores/Autenticacion";
import { useDarkMode } from '../hooks/useDarkMode';
import Header from "../components/shared/Header";
import Footer from "../components/shared/Footer";
import DarkModeToggle from "../components/shared/DarkModeToggle";

interface Docente {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
}

interface Estudiante {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
}

interface Curso {
    id: number;
    nombre: string;
}

type Opcion = "docente" | "estudiante" | "curso";

export default function AdminEliminar() {
    const navigate = useNavigate();
    const { token } = useAuthStore();
    const { isDarkMode } = useDarkMode();
    const { logout } = useAuthStore();

    const [opcion, setOpcion] = useState<Opcion>("docente");
    const [listaDocentes, setListaDocentes] = useState<Docente[]>([]);
    const [listaEstudiantes, setListaEstudiantes] = useState<Estudiante[]>([]);
    const [listaCursos, setListaCursos] = useState<Curso[]>([]);
    const [seleccionados, setSeleccionados] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);


    const handleLogout = () => {
        logout(); // Limpia el estado de autenticación
        navigate('/'); // Redirige al login
    };

    // Carga de datos según la opción
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                let url = "";
                if (opcion === "docente") {
                    url = "http://localhost:5000/api/admin/listar-docentes";
                } else if (opcion === "estudiante") {
                    url = "http://localhost:5000/api/admin/listar-estudiantes";
                } else if (opcion === "curso") {
                    url = "http://localhost:5000/api/admin/listar-cursos";
                }

                const response = await fetch(url);
                const data = await response.json();

                if (opcion === "docente") {
                    setListaDocentes(data);
                } else if (opcion === "estudiante") {
                    setListaEstudiantes(data);
                } else if (opcion === "curso") {
                    setListaCursos(data);
                }

                setSeleccionados([]);
            } catch {
                toast.error("Error al cargar los datos");
            }
        };

        cargarDatos();
    }, [opcion]);

    function quitarSeleccionado(id: number) {
        setSeleccionados(seleccionados => seleccionados.filter(s => s !== id));
    }

    function agregarSeleccionado(id: number) {
        setSeleccionados(seleccionados => [...seleccionados, id]);
    }

    async function handleEliminar() {
        if (seleccionados.length === 0) {
            toast.error("Selecciona al menos uno para eliminar");
            return;
        }
        setLoading(true);

        let urlBase = "";
        if (opcion === "docente") urlBase = "http://localhost:5000/api/admin/eliminar-docente/";
        if (opcion === "estudiante") urlBase = "http://localhost:5000/api/admin/eliminar-estudiante/";
        if (opcion === "curso") urlBase = "http://localhost:5000/api/admin/eliminar-curso/";

        let exitos = 0;
        for (const id of seleccionados) {
            try {
                const res = await fetch(urlBase + id, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.status === 200) {
                    exitos++;
                } else {
                    toast.error(data.error || data.msg || "Error al eliminar");
                }
            } catch {
                toast.error("Error de conexión");
            }
        }
        setLoading(false);

        if (opcion === "docente") setListaDocentes(prev => prev.filter(d => !seleccionados.includes(d.id)));
        if (opcion === "estudiante") setListaEstudiantes(prev => prev.filter(e => !seleccionados.includes(e.id)));
        if (opcion === "curso") setListaCursos(prev => prev.filter(c => !seleccionados.includes(c.id)));

        setSeleccionados([]);
        if (exitos > 0) toast.success(`Eliminado(s) correctamente`);
    }

    function renderLista() {
        const icono = (id: number) =>
            seleccionados.includes(id) ? (
                <button
                    className={`p-2 rounded-full shadow transition ml-2 ${isDarkMode
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-red-500 hover:bg-red-600 text-white"
                        }`}
                    onClick={() => quitarSeleccionado(id)}
                    title="Quitar de la lista de eliminación"
                >
                    <FaTrash />
                </button>
            ) : (
                <button
                    className={`p-2 rounded-full shadow-md shadow-gray-600 transition ml-2 text-4xl ${isDarkMode
                        ? "bg-transparent hover:text-red-600 text-gray-700"
                        : "bg-transparent hover:text-red-500 text-gray-700"
                        }`}
                    onClick={() => agregarSeleccionado(id)}
                    title="Seleccionar para eliminar"
                >
                    <FaTrash />
                </button>
            );

        const listaRender = opcion === "docente"
            ? listaDocentes
            : opcion === "estudiante"
                ? listaEstudiantes
                : listaCursos;

        return listaRender.map((item) => (
            <div
                key={item.id}
                className={`flex justify-between items-center p-4 rounded-3xl mb-2 transition border-2 border-blue-400 ${isDarkMode ? "bg-white " : "bg-white"
                    }`}
            >
                <div>
                    {opcion === "curso" ? (
                        <span
                            className={`font-semibold text-lg md:text-xl ${isDarkMode ? "text-black" : "text-black"
                                }`}
                        >
                            {(item as Curso).nombre}
                        </span>
                    ) : (
                        <>
                            <span
                                className={`font-semibold text-lg md:text-xl ${isDarkMode ? "text-black" : "text-black"
                                    }`}
                            >
                                {(item as Docente | Estudiante).first_name}{" "}
                                {(item as Docente | Estudiante).last_name}
                            </span>
                            <span
                                className={`ml-2 text-base md:text-lg ${isDarkMode ? "text-gray-400" : "text-gray-500"
                                    }`}
                            >
                                ({(item as Docente | Estudiante).username})
                            </span>
                        </>
                    )}
                </div>
                {icono(item.id)}
            </div>
        ));
    }

    const handleTabChange = (tab: Opcion) => {
        setOpcion(tab);
        setSeleccionados([]);
    };

    return (
        <div
            className={`min-h-screen flex flex-col ${isDarkMode
                ? "bg-gradient-to-b from-black via-blue-400 to-white"
                : "bg-white"
                }`}
        >
            <Header onLogout={handleLogout} />

            <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-12">
                <button
                    onClick={() => navigate("/panel-admin")}
                    className={`mb-6 flex items-center px-4 py-2 rounded-3xl font-medium transition-colors ${isDarkMode
                        ? "bg-blue-700 hover:bg-blue-600 text-white"
                        : "bg-blue-100 hover:bg-blue-200 text-blue-800"
                        }`}
                >
                    <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        />
                    </svg>
                    Volver
                </button>

                <div
                    className={`max-w-4xl mx-auto rounded-3xl shadow-lg overflow-hidden border-2 border-blue-400 ${isDarkMode
                        ? "bg-white border-blue-600"
                        : "bg-transparent shadow-blue-400"
                        }`}
                >
                    <div
                        className={`p-6 shadow-lg ${isDarkMode
                            ? "bg-gradient-to-br from-blue-400 via-white to-blue-400 shadow-blue-400"
                            : "bg-gradient-to-br from-blue-300 via-white to-blue-300 shadow-blue-200"
                            }`}
                    >
                        <h1
                            className={`text-2xl md:text-3xl font-bold text-center ${isDarkMode ? "text-blue-800" : "text-blue-800"
                                }`}
                        >
                            Eliminar Usuarios o Cursos
                        </h1>
                    </div>

                    <div className="p-6">
                        <div className="flex flex-wrap justify-center gap-2 mb-8">
                            {(["docente", "estudiante", "curso"] as Opcion[]).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => handleTabChange(tab)}
                                    className={`px-4 py-2 rounded-full font-medium transition-all border text-xl ${opcion === tab
                                        ? isDarkMode
                                            ? "bg-blue-700 text-white shadow-md border-blue-900"
                                            : "bg-blue-700 text-white shadow-md border-blue-400"
                                        : isDarkMode
                                            ? "bg-white text-blue-700 hover:bg-blue-400 border-blue-700"
                                            : "bg-gray-100 text-blue-700 hover:bg-blue-400 border-blue-400"
                                        }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>

                        <div className="mb-6">{renderLista()}</div>

                        <button
                            type="button"
                            className={`w-full p-3 rounded-3xl font-medium transition-colors text-xl border-2 ${loading || seleccionados.length === 0
                                ? isDarkMode
                                    ? "bg-gray-800  text-white opacity-25 cursor-not-allowed"
                                    : "bg-gray-100  text-gray-400 cursor-not-allowed border-gray-300"
                                : isDarkMode
                                    ? "bg-red-600 hover:bg-red-700 text-white"
                                    : "bg-red-500 hover:bg-red-600 text-white"
                                }`}
                            disabled={loading || seleccionados.length === 0}
                            onClick={handleEliminar}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Eliminando...
                                </span>
                            ) : (
                                `Eliminar seleccionados (${seleccionados.length})`
                            )}
                        </button>
                    </div>
                </div>
            </main>

            <DarkModeToggle />

            <Footer />
        </div>
    );
}