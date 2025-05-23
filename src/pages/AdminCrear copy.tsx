import { useState } from "react";
import Header from "../components/shared/Header";
import Footer from "../components/shared/Footer";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthStore } from "../stores/Autenticacion";

export default function AdminCrear() {
    const navigate = useNavigate();
    const { token } = useAuthStore();

    const [opcion, setOpcion] = useState<"estudiante" | "docente" | "curso">("estudiante");
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        nombre: "",
    });

    const handleTabChange = (nuevaOpcion: "estudiante" | "docente" | "curso") => {
        setOpcion(nuevaOpcion);
        setForm({
            username: "",
            email: "",
            password: "",
            first_name: "",
            last_name: "",
            nombre: "",
        });
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Validación básica frontend
        if (opcion !== "curso") {
            if (!form.first_name || !form.last_name || !form.username || !form.email || !form.password) {
                toast.error("Todos los campos son requeridos");
                setLoading(false);
                return;
            }
            if (form.password.length < 5) {
                toast.error("La contraseña debe tener al menos 5 caracteres");
                setLoading(false);
                return;
            }
        } else if (!form.nombre) {
            toast.error("El nombre del curso es requerido");
            setLoading(false);
            return;
        }

        let url = "";
        let body = {};

        if (opcion === "estudiante" || opcion === "docente") {
            url = opcion === "estudiante"
                ? "/api/admin/crear-estudiante"
                : "/api/admin/crear-docente";
            body = {
                username: form.username,
                email: form.email,
                password: form.password,
                first_name: form.first_name,
                last_name: form.last_name,
            };
        } else if (opcion === "curso") {
            url = "/api/admin/crear-curso";
            body = {
                nombre: form.nombre,
            };
        }

        try {
            // Solución al error ERR_UNEXPECTED_PROXY_AUTH
            const headers: HeadersInit = {
                "Content-Type": "application/json",
            };

            // Solo agregar Authorization si existe token
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }

            const res = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                throw new Error(`Error HTTP: ${res.status}`);
            }



            // Éxito - Mostrar toast de éxito
            toast.success(
                opcion === "curso"
                    ? "✅ Curso creado correctamente"
                    : `✅ ${opcion === "estudiante" ? "Estudiante" : "Docente"} creado correctamente`,
                { autoClose: 3000 }
            );

            // Resetear formulario
            setForm({
                username: "",
                email: "",
                password: "",
                first_name: "",
                last_name: "",
                nombre: "",
            });

        } catch (error) {
            console.error("Error en la solicitud:", error);
            // No mostramos toast de error como solicitaste
        } finally {
            setLoading(false);
        }
    };

    const inputNormalClass = "border-gray-300 focus:border-blue-500";

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 to-white dark:from-gray-800 dark:to-gray-900">
            <Header onLogout={() => navigate("/")} />

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
                        Crear Usuarios o Cursos
                    </h1>

                    <div className="flex justify-center gap-4 mb-8">
                        {["estudiante", "docente", "curso"].map((tab) => (
                            <button
                                key={tab}
                                className={`px-6 py-2 rounded-full font-semibold transition ${opcion === tab
                                    ? "bg-blue-600 text-white scale-110"
                                    : "bg-blue-100 text-blue-700 hover:bg-blue-300"
                                    }`}
                                onClick={() => handleTabChange(tab as "estudiante" | "docente" | "curso")}
                            >
                                Crear {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5 items-center w-full">
                        {(opcion === "estudiante" || opcion === "docente") && (
                            <>
                                <div className="w-full">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombres</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        placeholder="Ej: Juan"
                                        value={form.first_name}
                                        onChange={handleInput}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 ${inputNormalClass}`}
                                        required
                                    />
                                </div>
                                <div className="w-full">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        placeholder="Ej: Pérez"
                                        value={form.last_name}
                                        onChange={handleInput}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 ${inputNormalClass}`}
                                        required
                                    />
                                </div>
                                <div className="w-full">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
                                    <input
                                        type="text"
                                        name="username"
                                        placeholder="Ej: juanperez"
                                        value={form.username}
                                        onChange={handleInput}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 ${inputNormalClass}`}
                                        required
                                    />
                                </div>
                                <div className="w-full">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Ej: juan@example.com"
                                        value={form.email}
                                        onChange={handleInput}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 ${inputNormalClass}`}
                                        required
                                    />
                                </div>
                                <div className="w-full">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Mínimo 5 caracteres"
                                        value={form.password}
                                        onChange={handleInput}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 ${inputNormalClass}`}
                                        required
                                        minLength={5}
                                    />
                                </div>
                            </>
                        )}

                        {opcion === "curso" && (
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del curso</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    placeholder="Ej: Matemáticas Avanzadas"
                                    value={form.nombre}
                                    onChange={handleInput}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 ${inputNormalClass}`}
                                    required
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            className={`w-full px-6 py-3 rounded-lg font-semibold transition mt-4 ${loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                                }`}
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Procesando...
                                </span>
                            ) : opcion === "curso" ? (
                                "Crear Curso"
                            ) : (
                                `Crear ${opcion === "estudiante" ? "Estudiante" : "Docente"}`
                            )}
                        </button>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
}