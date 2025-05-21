import { useState, useEffect } from "react";
import Header from "../components/shared/Header";
import Footer from "../components/shared/Footer";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { FaTrash } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import { useAuthStore } from "../stores/Autenticacion";

interface Docente { id: number; first_name: string; last_name: string; username: string; email: string; }
interface Estudiante { id: number; first_name: string; last_name: string; username: string; email: string; }
interface Curso { id: number; nombre: string; }

type Opcion = "docente" | "estudiante" | "curso";

export default function AdminEliminar() {
    const navigate = useNavigate();
    const { token } = useAuthStore();

    const [opcion, setOpcion] = useState<Opcion>("docente");
    const [listaDocentes, setListaDocentes] = useState<Docente[]>([]);
    const [listaEstudiantes, setListaEstudiantes] = useState<Estudiante[]>([]);
    const [listaCursos, setListaCursos] = useState<Curso[]>([]);
    const [seleccionados, setSeleccionados] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);

    // Carga de datos según la opción
    useEffect(() => {
        if (opcion === "docente") {
            fetch("http://localhost:5000/api/admin/listar-docentes")
                .then(r => r.json()).then(setListaDocentes);
        } else if (opcion === "estudiante") {
            fetch("http://localhost:5000/api/admin/listar-estudiantes")
                .then(r => r.json()).then(setListaEstudiantes);
        } else if (opcion === "curso") {
            fetch("http://localhost:5000/api/admin/listar-cursos")
                .then(r => r.json()).then(setListaCursos);
        }
        setSeleccionados([]);
    }, [opcion]);

    // Eliminar uno del array seleccionado
    function quitarSeleccionado(id: number) {
        setSeleccionados(seleccionados => seleccionados.filter(s => s !== id));
    }

    // Añadir uno si se hace click al icono
    function agregarSeleccionado(id: number) {
        setSeleccionados(seleccionados => [...seleccionados, id]);
    }

    // Botón eliminar (envía todos los seleccionados)
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
        // Actualizar la lista sin los eliminados
        if (opcion === "docente") setListaDocentes(prev => prev.filter(d => !seleccionados.includes(d.id)));
        if (opcion === "estudiante") setListaEstudiantes(prev => prev.filter(e => !seleccionados.includes(e.id)));
        if (opcion === "curso") setListaCursos(prev => prev.filter(c => !seleccionados.includes(c.id)));
        setSeleccionados([]);
        if (exitos > 0) toast.success(`Eliminado(s) correctamente`);
    }

    // Renderiza la lista correspondiente con icono papelera
    function renderLista() {
        const icono = (id: number) =>
            seleccionados.includes(id) ? (
                <button
                    className="bg-red-500 hover:bg-red-700 text-white p-3 rounded shadow transition ml-2"
                    onClick={() => quitarSeleccionado(id)}
                    title="Quitar de la lista de eliminación"
                >
                    <FaTrash />
                </button>
            ) : (
                <button
                    className="bg-gray-300 hover:bg-red-500 text-white p-3 rounded shadow transition ml-2"
                    onClick={() => agregarSeleccionado(id)}
                    title="Seleccionar para eliminar"
                >
                    <FaTrash />
                </button>
            );

        if (opcion === "docente") {
            return listaDocentes.map((d) => (
                <div key={d.id} className="flex justify-between items-center border-b py-4">
                    <div>
                        <span className="font-semibold">{d.first_name} {d.last_name}</span> <span className="text-gray-600">({d.username})</span>
                    </div>
                    {icono(d.id)}
                </div>
            ));
        }
        if (opcion === "estudiante") {
            return listaEstudiantes.map((e) => (
                <div key={e.id} className="flex justify-between items-center border-b py-4">
                    <div>
                        <span className="font-semibold">{e.first_name} {e.last_name}</span> <span className="text-gray-600">({e.username})</span>
                    </div>
                    {icono(e.id)}
                </div>
            ));
        }
        // CURSOS
        return listaCursos.map((c) => (
            <div key={c.id} className="flex justify-between items-center border-b py-4">
                <div>
                    <span className="font-semibold">{c.nombre}</span>
                </div>
                {icono(c.id)}
            </div>
        ));
    }

    const handleTabChange = (tab: Opcion) => {
        setOpcion(tab);
        setSeleccionados([]);
    };

    const handleLogout = () => navigate("/login");

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 to-white dark:from-gray-800 dark:to-gray-900">
            <Header onLogout={handleLogout} />
            <button
                className="mt-24 absolute top-6 left-6 z-40 bg-blue-700 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-800 transition font-semibold"
                onClick={() => navigate("/panel-admin")}
                style={{ minWidth: 110 }}
            >
                ← Volver
            </button>
            <main className="flex-1 flex flex-col items-center justify-center px-2">
                <div className="w-full max-w-2xl p-8 bg-white rounded-3xl shadow-xl mt-16 mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-center text-blue-800 mb-8">
                        Eliminar Usuarios o Cursos
                    </h1>
                    {/* Tabs */}
                    <div className="flex justify-center gap-4 mb-8">
                        <button
                            className={`px-6 py-2 rounded-full font-semibold transition ${opcion === "docente"
                                ? "bg-blue-600 text-white scale-110"
                                : "bg-blue-100 text-blue-700 hover:bg-blue-300"
                                }`}
                            onClick={() => handleTabChange("docente")}
                        >
                            Docente
                        </button>
                        <button
                            className={`px-6 py-2 rounded-full font-semibold transition ${opcion === "estudiante"
                                ? "bg-blue-600 text-white scale-110"
                                : "bg-blue-100 text-blue-700 hover:bg-blue-300"
                                }`}
                            onClick={() => handleTabChange("estudiante")}
                        >
                            Estudiante
                        </button>
                        <button
                            className={`px-6 py-2 rounded-full font-semibold transition ${opcion === "curso"
                                ? "bg-blue-600 text-white scale-110"
                                : "bg-blue-100 text-blue-700 hover:bg-blue-300"
                                }`}
                            onClick={() => handleTabChange("curso")}
                        >
                            Curso
                        </button>
                    </div>
                    {/* LISTADO */}
                    <div className="mb-6">
                        {renderLista()}
                    </div>
                    {/* Botón Eliminar */}
                    <button
                        type="button"
                        className={`w-full px-6 py-3 rounded-lg font-semibold transition ${loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-red-600 text-white hover:bg-red-800"
                            }`}
                        disabled={loading || seleccionados.length === 0}
                        onClick={handleEliminar}
                    >
                        {loading ? "Eliminando..." : "Eliminar seleccionados"}
                    </button>
                </div>
            </main>
            <ToastContainer />
            <Footer />
        </div>
    );
}
