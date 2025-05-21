import { useEffect, useState } from "react";
import Header from "../components/shared/Header";
import Footer from "../components/shared/Footer";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthStore } from "../stores/Autenticacion";
import { FaCheckCircle } from "react-icons/fa";

interface Docente {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
}

interface Curso {
    id: number;
    nombre: string;
}

export default function AdminAsignar() {
    const navigate = useNavigate();
    const { token } = useAuthStore();

    const [docentes, setDocentes] = useState<Docente[]>([]);
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [docenteSeleccionado, setDocenteSeleccionado] = useState<number | null>(null);
    const [cursosSeleccionados, setCursosSeleccionados] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);

    // Carga las listas al montar
    useEffect(() => {
        fetch("http://localhost:5000/api/admin/listar-docentes")
            .then(r => r.json())
            .then(setDocentes);
        fetch("http://localhost:5000/api/admin/listar-cursos")
            .then(r => r.json())
            .then(setCursos);
    }, []);

    // Seleccionar docente (solo uno)
    function handleSeleccionarDocente(id: number) {
        setDocenteSeleccionado(id);
    }

    // Seleccionar/des-seleccionar cursos (múltiple)
    function handleToggleCurso(id: number) {
        setCursosSeleccionados(prev =>
            prev.includes(id)
                ? prev.filter(c => c !== id)
                : [...prev, id]
        );
    }

    // Confirmar asignación
    async function handleAsignar() {
        if (!docenteSeleccionado) {
            toast.error("Selecciona un docente");
            return;
        }
        if (cursosSeleccionados.length === 0) {
            toast.error("Selecciona al menos un curso");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("http://localhost:5000/api/admin/asignar-cursos-docentes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    docentes_ids: [docenteSeleccionado],
                    cursos_ids: cursosSeleccionados,
                }),
            });
            const data = await res.json();
            setLoading(false);
            if (res.status === 200) {
                toast.success(<span><FaCheckCircle className="inline text-green-600 mr-2" />Cursos asignados correctamente</span>);
                setCursosSeleccionados([]);
                setDocenteSeleccionado(null);
            } else {
                toast.error(data.error || data.msg || "Error al asignar cursos");
            }
        } catch {
            setLoading(false);
            toast.error("Error de conexión con el backend");
        }
    }

    const handleLogout = () => navigate('/login');

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 to-white dark:from-gray-800 dark:to-gray-900">
            <Header onLogout={handleLogout} />
            {/* Botón de volver */}
            <button
                className="mt-24 absolute top-6 left-6 z-40 bg-blue-700 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-800 transition font-semibold"
                onClick={() => navigate("/panel-admin")}
                style={{ minWidth: 110 }}
            >
                ← Volver
            </button>
            <main className="flex-1 flex flex-col items-center justify-center px-2">
                <div className="w-full max-w-4xl p-8 bg-white rounded-3xl shadow-xl mt-16 mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-center text-blue-800 mb-8">
                        Asignar Cursos a Docente
                    </h1>
                    <div className="flex flex-col md:flex-row justify-between gap-8">
                        {/* DOCENTES */}
                        <div className="flex-1">
                            <h2 className="text-xl font-semibold text-blue-700 mb-4 text-center">Selecciona un docente</h2>
                            <div className="space-y-3">
                                {docentes.map(d => (
                                    <div
                                        key={d.id}
                                        className={`flex items-center justify-between px-4 py-2 rounded-lg shadow cursor-pointer border ${docenteSeleccionado === d.id ? "bg-blue-100 border-blue-700" : "bg-gray-50 border-gray-300"}`}
                                        onClick={() => handleSeleccionarDocente(d.id)}
                                    >
                                        <span>
                                            <b>{d.first_name} {d.last_name}</b> <span className="text-gray-600">({d.username})</span>
                                        </span>
                                        {docenteSeleccionado === d.id && (
                                            <span className="text-blue-700 font-bold ml-4">✓</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* DIVISOR */}
                        <div className="hidden md:block w-1 mx-4 bg-blue-200 rounded-full" />
                        {/* CURSOS */}
                        <div className="flex-1">
                            <h2 className="text-xl font-semibold text-blue-700 mb-4 text-center">Selecciona cursos</h2>
                            <div className="space-y-3">
                                {cursos.map(c => (
                                    <div
                                        key={c.id}
                                        className={`flex items-center justify-between px-4 py-2 rounded-lg shadow cursor-pointer border ${cursosSeleccionados.includes(c.id) ? "bg-green-100 border-green-700" : "bg-gray-50 border-gray-300"}`}
                                        onClick={() => handleToggleCurso(c.id)}
                                    >
                                        <span className="font-medium">{c.nombre}</span>
                                        {cursosSeleccionados.includes(c.id) && (
                                            <span className="text-green-700 font-bold ml-4">✓</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <button
                        className={`mt-8 w-full px-6 py-3 rounded-lg font-semibold transition ${loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-800"
                            }`}
                        disabled={loading}
                        onClick={handleAsignar}
                    >
                        {loading ? "Asignando..." : "Confirmar asignación"}
                    </button>
                </div>
            </main>
            <ToastContainer />
            <Footer />
        </div>
    );
}
