import { useEffect, useState } from "react";
import Header from "../components/shared/Header";
import Footer from "../components/shared/Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthStore } from "../stores/Autenticacion";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MdDelete } from "react-icons/md"; // <-- Ícono papelera

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

    // Estado
    const [docentes, setDocentes] = useState<Docente[]>([]);
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [docenteSeleccionado, setDocenteSeleccionado] = useState<number | "">("");
    const [cursosPorAsignar, setCursosPorAsignar] = useState<Curso[]>([]);
    const [cursosAsignados, setCursosAsignados] = useState<Curso[]>([]);
    const [cursosSeleccionados, setCursosSeleccionados] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingEliminar, setLoadingEliminar] = useState<number | null>(null);

    useEffect(() => {
        fetch("http://localhost:5000/api/admin/listar-docentes", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then(setDocentes);

        fetch("http://localhost:5000/api/admin/listar-cursos", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then(setCursos);
    }, [token]);

    useEffect(() => {
        setCursosSeleccionados([]);
        setCursosAsignados([]);
        setCursosPorAsignar([]);
        if (!docenteSeleccionado) return;

        fetch(
            `http://localhost:5000/api/admin/obtener-cursos-docente/${docenteSeleccionado}`,
            { headers: { Authorization: `Bearer ${token}` } }
        )
            .then((r) => r.json())
            .then((asignados: Curso[]) => {
                setCursosAsignados(asignados);
                setCursosPorAsignar(
                    cursos.filter(
                        (curso) =>
                            !asignados.some((asig) => asig.id === curso.id)
                    )
                );
            });
        // // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [docenteSeleccionado, cursos, token]);

    // Selección/deselección de cursos a asignar
    function handleToggleCurso(id: number) {
        setCursosSeleccionados((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
        );
    }

    // Asignar cursos
    // Función para asignar cursos corregida
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
                        docente_id: docenteSeleccionado, // Enviamos un solo ID
                        cursos_ids: cursosSeleccionados, // Enviamos array de cursos
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
                fetch(
                    `http://localhost:5000/api/admin/obtener-cursos-docente/${docenteSeleccionado}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                )
                    .then((r) => r.json())
                    .then((asignados: Curso[]) => {
                        setCursosAsignados(asignados);
                        setCursosPorAsignar(
                            cursos.filter(
                                (curso) => !asignados.some((asig) => asig.id === curso.id)
                            )
                        );
                        setCursosSeleccionados([]);
                    });
            }
            else if (res.status === 207) {
                // Asignación parcial con errores
                toast.warning(
                    `Asignación parcial: ${data.total_cursos_asignados} cursos asignados, pero con algunos errores`,
                    { autoClose: 4000 }
                );
                console.log("Errores parciales:", data.errores);
            }
            else {
                toast.error(data.error || "Error al asignar cursos");
            }
        } catch (error) {
            setLoading(false);
            toast.error("Error de conexión con el backend.");
            console.error("Error:", error);
        }
    }

    // Quitar/desasignar un curso del docente (lo mueve de asignados a por asignar en tiempo real)
    // Quitar/desasignar un curso del docente (lo mueve de asignados a por asignar en tiempo real)
    async function handleQuitarCurso(cursoId: number) {
        if (!docenteSeleccionado) return;

        // Validar que no sea el último curso
        if (cursosAsignados.length === 1) {
            toast.error("No puedes desasignar el único curso del docente. Asigna otro curso primero.");
            return;
        }

        setLoadingEliminar(cursoId);
        try {
            // Deja los cursos menos el que vamos a quitar
            const nuevosCursosAsignados = cursosAsignados.filter(c => c.id !== cursoId);
            const nuevosIds = nuevosCursosAsignados.map(c => c.id);

            const res = await fetch(
                "http://localhost:5000/api/admin/asignar-cursos-docente",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        docentes_ids: [docenteSeleccionado],
                        cursos_ids: nuevosIds,
                    }),
                }
            );
            const data = await res.json();
            setLoadingEliminar(null);
            if (res.status === 200 || res.status === 207) {
                // Actualiza columnas visualmente
                setCursosAsignados(nuevosCursosAsignados);
                const cursoDesasignado = cursos.find(c => c.id === cursoId);
                if (cursoDesasignado) setCursosPorAsignar(prev => [...prev, cursoDesasignado]);
                toast.success("Curso desasignado");
            } else {
                toast.error(data.error || "Error al desasignar curso");
            }
        } catch {
            setLoadingEliminar(null);
            toast.error("Error de conexión con el backend.");
        }
    }

    // Animación de aparición para cursos asignados
    const animConfig = {
        initial: { opacity: 0, x: 30 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -30 },
        transition: { duration: 0.4 },
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 to-white dark:from-gray-800 dark:to-gray-900">
            <Header onLogout={() => navigate("/login")} />
            <button
                className="mt-24 absolute top-6 left-6 z-40 bg-blue-700 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-800 transition font-semibold"
                onClick={() => navigate("/panel-admin")}
                style={{ minWidth: 110 }}
            >
                ← Volver
            </button>
            <main className="flex-1 flex flex-col items-center justify-center px-2">
                <div className="w-full max-w-6xl p-8 bg-white rounded-3xl shadow-xl mt-16 mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-center text-blue-800 mb-8">
                        Asignar Cursos a Docentes
                    </h1>
                    <div className="flex flex-col md:flex-row gap-8 justify-center items-start w-full">
                        {/* Columna 1: Docente */}
                        <div className="w-full md:w-1/3">
                            <h2 className="text-xl text-blue-700 font-semibold mb-4 text-center">Selecciona un Docente</h2>
                            <select
                                className="w-full px-4 py-2 border rounded-lg mb-2"
                                value={docenteSeleccionado}
                                onChange={(e) =>
                                    setDocenteSeleccionado(Number(e.target.value) || "")
                                }
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
                        <div className="hidden md:block border-r-4 border-cyan-300 h-[260px] mx-2" />
                        {/* Columna 2: Cursos por asignar */}
                        <div className="w-full md:w-1/3 flex flex-col">
                            <h2 className="text-xl text-blue-700 font-semibold mb-4 text-center">Cursos por asignar</h2>
                            <div className="flex flex-col gap-2">
                                <AnimatePresence>
                                    {cursosPorAsignar.map((curso) => (
                                        <motion.div
                                            key={curso.id}
                                            {...animConfig}
                                            className={`flex items-center justify-between px-4 py-2 rounded-lg shadow cursor-pointer border ${cursosSeleccionados.includes(curso.id)
                                                ? "bg-green-100 border-green-700"
                                                : "bg-gray-50 border-gray-300"
                                                }`}
                                            onClick={() => handleToggleCurso(curso.id)}
                                        >
                                            <span className="font-medium">{curso.nombre}</span>
                                            {cursosSeleccionados.includes(curso.id) && (
                                                <span className="text-green-700 font-bold ml-4">✓</span>
                                            )}
                                        </motion.div>
                                    ))}
                                    {cursosPorAsignar.length === 0 && (
                                        <div className="text-gray-400 text-center py-10">
                                            Todos los cursos ya están asignados.
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                        {/* Línea divisoria */}
                        <div className="hidden md:block border-r-4 border-cyan-300 h-[260px] mx-2" />
                        {/* Columna 3: Cursos asignados */}
                        <div className="w-full md:w-1/3 flex flex-col">
                            <h2 className="text-xl text-blue-700 font-semibold mb-4 text-center">Cursos asignados</h2>
                            <div className="flex flex-col gap-2">
                                <AnimatePresence>
                                    {cursosAsignados.map((curso) => (
                                        <motion.div
                                            key={curso.id}
                                            {...animConfig}
                                            className="flex items-center px-4 py-2 rounded-lg shadow border bg-blue-50 border-blue-400 justify-between"
                                        >
                                            <span className="font-medium">{curso.nombre}</span>
                                            <button
                                                className="ml-2 bg-red-500 hover:bg-red-600 rounded-lg p-1 transition"
                                                disabled={loadingEliminar === curso.id}
                                                title="Desasignar curso"
                                                onClick={() => handleQuitarCurso(curso.id)}
                                            >
                                                <MdDelete className="text-white text-xl" />
                                            </button>
                                        </motion.div>
                                    ))}
                                    {cursosAsignados.length === 0 && (
                                        <div className="text-gray-400 text-center py-10">
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
                            className={`px-8 py-3 rounded-2xl font-semibold shadow-lg transition ${loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-cyan-600 text-white hover:bg-cyan-800"
                                }`}
                            disabled={loading}
                            onClick={handleAsignar}
                        >
                            {loading ? "Asignando..." : "Asignar Cursos"}
                        </button>
                    </div>
                </div>
            </main>
            <ToastContainer />
            <Footer />
        </div>
    );
}
