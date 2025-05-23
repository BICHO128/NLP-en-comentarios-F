import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthStore } from "../stores/Autenticacion";
import { useDarkMode } from '../hooks/useDarkMode';
import Header from "../components/shared/Header";
import Footer from "../components/shared/Footer";
import DarkModeToggle from "../components/shared/DarkModeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { MdDelete } from "react-icons/md";

interface Docente {
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

export default function AdminAsignar() {
    const navigate = useNavigate();
    const { token } = useAuthStore();
    const { isDarkMode } = useDarkMode();

    const [docentes, setDocentes] = useState<Docente[]>([]);
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [docenteSeleccionado, setDocenteSeleccionado] = useState<number | "">("");
    const [cursosPorAsignar, setCursosPorAsignar] = useState<Curso[]>([]);
    const [cursosAsignados, setCursosAsignados] = useState<Curso[]>([]);
    const [cursosSeleccionados, setCursosSeleccionados] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingEliminar, setLoadingEliminar] = useState<number | null>(null);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [docentesRes, cursosRes] = await Promise.all([
                    fetch("http://localhost:5000/api/admin/listar-docentes", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch("http://localhost:5000/api/admin/listar-cursos", {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                ]);

                const docentesData = await docentesRes.json();
                const cursosData = await cursosRes.json();

                setDocentes(docentesData);
                setCursos(cursosData);
            } catch {
                toast.error("Error al cargar los datos");
            }
        };

        cargarDatos();
    }, [token]);

    useEffect(() => {
        const cargarCursosDocente = async () => {
            setCursosSeleccionados([]);
            setCursosAsignados([]);
            setCursosPorAsignar([]);

            if (!docenteSeleccionado) return;

            try {
                const response = await fetch(
                    `http://localhost:5000/api/admin/obtener-cursos-docente/${docenteSeleccionado}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const asignados: Curso[] = await response.json();

                setCursosAsignados(asignados);
                setCursosPorAsignar(
                    cursos.filter((curso) => !asignados.some((asig) => asig.id === curso.id))
                );
            } catch {
                toast.error("Error al cargar los cursos del docente");
            }
        };

        cargarCursosDocente();
    }, [docenteSeleccionado, cursos, token]);

    function handleToggleCurso(id: number) {
        setCursosSeleccionados((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
        );
    }

    async function handleAsignar() {
        if (!docenteSeleccionado || cursosSeleccionados.length === 0) {
            toast.error("Selecciona un docente y al menos un curso.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(
                "http://localhost:5000/api/admin/asignar-cursos-docente",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        docente_id: docenteSeleccionado,
                        cursos_ids: cursosSeleccionados,
                    }),
                }
            );

            const data = await res.json();
            setLoading(false);

            if (res.status === 200) {
                toast.success(
                    `Se asignaron ${data.total_cursos_asignados} cursos al docente`,
                    { autoClose: 3000 }
                );

                // Refrescar datos
                const response = await fetch(
                    `http://localhost:5000/api/admin/obtener-cursos-docente/${docenteSeleccionado}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const asignados: Curso[] = await response.json();

                setCursosAsignados(asignados);
                setCursosPorAsignar(
                    cursos.filter((curso) => !asignados.some((asig) => asig.id === curso.id))
                );
                setCursosSeleccionados([]);
            } else if (res.status === 207) {
                toast.warning(
                    `Asignación parcial: ${data.total_cursos_asignados} cursos asignados, pero con algunos errores`,
                    { autoClose: 4000 }
                );
            } else {
                toast.error(data.error || "Error al asignar cursos");
            }
        } catch {
            setLoading(false);
            toast.error("Error de conexión con el backend.");
        }
    }

    async function handleQuitarCurso(cursoId: number) {
        if (!docenteSeleccionado) {
            toast.error("No se ha seleccionado un docente");
            return;
        }

        setLoadingEliminar(cursoId);

        try {
            const response = await fetch(
                `http://localhost:5000/api/admin/docentes/${docenteSeleccionado}/cursos/${cursoId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const data = await response.json();

            if (response.ok) {
                const nuevosCursosAsignados = cursosAsignados.filter(c => c.id !== cursoId);
                setCursosAsignados(nuevosCursosAsignados);

                const cursoDesasignado = cursos.find(c => c.id === cursoId);
                if (cursoDesasignado) {
                    setCursosPorAsignar(prev => [...prev, cursoDesasignado]);
                }

                toast.success(data.message || "Curso desasignado correctamente");
            } else {
                toast.error(data.error || "Error al desasignar el curso");
            }
        } catch {
            toast.error("Error de conexión con el servidor");
        } finally {
            setLoadingEliminar(null);
        }
    }

    const animConfig = {
        initial: { opacity: 0, x: 30 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -30 },
        transition: { duration: 0.4 },
    };

    return (
        <div className={`min-h-screen flex flex-col ${isDarkMode ? "bg-gradient-to-b from-black via-blue-400 to-white" : "bg-gray-50"}`}>
            <Header onLogout={() => navigate("/")} />

            <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-12">
                <button
                    onClick={() => navigate("/panel-admin")}
                    className={`mb-6 flex items-center px-4 py-2 rounded-3xl font-medium transition-colors ${isDarkMode
                            ? "bg-blue-700 hover:bg-blue-600 text-white"
                            : "bg-blue-100 hover:bg-blue-200 text-blue-800"
                        }`}
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Volver
                </button>

                <div className={`max-w-6xl mx-auto rounded-3xl shadow-lg overflow-hidden ${isDarkMode
                        ? "bg-transparent shadow-gray-200"
                        : "bg-white shadow-blue-400"
                    }`}>
                    <div className={`p-6 shadow-lg ${isDarkMode
                            ? "bg-gradient-to-br from-blue-400 via-white to-blue-400 shadow-blue-400"
                            : "bg-gradient-to-br from-blue-300 via-white to-blue-300 shadow-blue-200"
                        }`}>
                        <h1 className={`text-2xl md:text-3xl font-bold text-center ${isDarkMode ? "text-blue-800" : "text-blue-800"
                            }`}>
                            Asignar Cursos a Docentes
                        </h1>
                    </div>

                    <div className="p-6">
                        <div className="flex flex-col md:flex-row gap-8 justify-center items-start w-full">
                            {/* Columna 1: Docente */}
                            <div className="w-full md:w-1/3">
                                <h2 className={`text-xl font-semibold mb-4 text-center ${isDarkMode ? "text-blue-300" : "text-blue-700"
                                    }`}>
                                    Selecciona un Docente
                                </h2>
                                <select
                                    className={`w-full p-3 rounded-3xl border ${isDarkMode
                                            ? "bg-gray-700 border-gray-600 text-white"
                                            : "bg-white border-gray-300 text-gray-800"
                                        }`}
                                    value={docenteSeleccionado}
                                    onChange={(e) => setDocenteSeleccionado(Number(e.target.value) || "")}
                                >
                                    <option value="">Seleccione docente</option>
                                    {docentes.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.first_name} {d.last_name} ({d.username})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Línea divisoria */}
                            <div className={`hidden md:block border-r-4 ${isDarkMode ? "border-blue-500" : "border-cyan-300"
                                } h-[260px] mx-2`} />

                            {/* Columna 2: Cursos por asignar */}
                            <div className="w-full md:w-1/3 flex flex-col">
                                <h2 className={`text-xl font-semibold mb-4 text-center ${isDarkMode ? "text-blue-300" : "text-blue-700"
                                    }`}>
                                    Cursos por asignar
                                </h2>
                                <div className="flex flex-col gap-2">
                                    <AnimatePresence>
                                        {cursosPorAsignar.map((curso) => (
                                            <motion.div
                                                key={curso.id}
                                                {...animConfig}
                                                className={`flex items-center justify-between p-3 rounded-3xl shadow cursor-pointer border ${cursosSeleccionados.includes(curso.id)
                                                        ? isDarkMode
                                                            ? "bg-green-800 border-green-600"
                                                            : "bg-green-100 border-green-700"
                                                        : isDarkMode
                                                            ? "bg-gray-700 border-gray-600"
                                                            : "bg-gray-50 border-gray-300"
                                                    }`}
                                                onClick={() => handleToggleCurso(curso.id)}
                                            >
                                                <span className="font-medium">{curso.nombre}</span>
                                                {cursosSeleccionados.includes(curso.id) && (
                                                    <span className={`ml-4 font-bold ${isDarkMode ? "text-green-300" : "text-green-700"
                                                        }`}>✓</span>
                                                )}
                                            </motion.div>
                                        ))}
                                        {cursosPorAsignar.length === 0 && (
                                            <div className={`text-center py-10 ${isDarkMode ? "text-gray-400" : "text-gray-500"
                                                }`}>
                                                Todos los cursos ya están asignados.
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Línea divisoria */}
                            <div className={`hidden md:block border-r-4 ${isDarkMode ? "border-blue-500" : "border-cyan-300"
                                } h-[260px] mx-2`} />

                            {/* Columna 3: Cursos asignados */}
                            <div className="w-full md:w-1/3 flex flex-col">
                                <h2 className={`text-xl font-semibold mb-4 text-center ${isDarkMode ? "text-blue-300" : "text-blue-700"
                                    }`}>
                                    Cursos asignados
                                </h2>
                                <div className="flex flex-col gap-2">
                                    <AnimatePresence>
                                        {cursosAsignados.map((curso) => (
                                            <motion.div
                                                key={curso.id}
                                                {...animConfig}
                                                className={`flex items-center p-3 rounded-3xl shadow border justify-between ${isDarkMode
                                                        ? "bg-gray-700 border-gray-600"
                                                        : "bg-blue-50 border-blue-400"
                                                    }`}
                                            >
                                                <span className="font-medium">{curso.nombre}</span>
                                                <button
                                                    className={`ml-2 rounded-lg p-2 transition ${loadingEliminar === curso.id
                                                            ? "bg-gray-500"
                                                            : isDarkMode
                                                                ? "bg-red-600 hover:bg-red-700"
                                                                : "bg-red-500 hover:bg-red-600"
                                                        }`}
                                                    disabled={loadingEliminar === curso.id}
                                                    title="Desasignar curso"
                                                    onClick={() => handleQuitarCurso(curso.id)}
                                                >
                                                    <MdDelete className="text-white text-xl" />
                                                </button>
                                            </motion.div>
                                        ))}
                                        {cursosAsignados.length === 0 && (
                                            <div className={`text-center py-10 ${isDarkMode ? "text-gray-400" : "text-gray-500"
                                                }`}>
                                                No tiene cursos asignados.
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        {/* Botón de asignar */}
                        <div className="flex justify-center mt-10">
                            <button
                                className={`px-8 py-3 rounded-3xl font-medium shadow-lg transition ${loading
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : isDarkMode
                                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                                            : "bg-blue-500 hover:bg-blue-600 text-white"
                                    }`}
                                disabled={loading}
                                onClick={handleAsignar}
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
                                        Asignando...
                                    </span>
                                ) : (
                                    `Asignar Cursos (${cursosSeleccionados.length})`
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <DarkModeToggle />

            <Footer />
        </div>
    );
}