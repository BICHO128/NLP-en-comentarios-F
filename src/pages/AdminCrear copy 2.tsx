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

    // Tab seleccionado
    const [opcion, setOpcion] = useState<"estudiante" | "docente" | "curso">("estudiante");
    const [loading, setLoading] = useState(false);

    // Estado de los formularios
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        nombre_curso: "",
    });

    // Errores por campo
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Limpia errores y formulario al cambiar de tab/opción
    const handleTabChange = (nuevaOpcion: "estudiante" | "docente" | "curso") => {
        setOpcion(nuevaOpcion);
        setErrors({});
        setForm({
            username: "",
            email: "",
            password: "",
            first_name: "",
            last_name: "",
            nombre_curso: "",
        });
    };

    const handleLogout = () => {
        navigate("/");
    };

    // Limpia errores al escribir
    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors(prev => ({ ...prev, [e.target.name]: "" }));
    };

    // Envía los formularios según la opción
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // VALIDACIÓN FRONTEND
        const nuevosErrores: { [key: string]: string } = {};
        if (opcion === "estudiante" || opcion === "docente") {
            if (!form.first_name.trim()) nuevosErrores.first_name = "El nombre es requerido";
            if (!form.last_name.trim()) nuevosErrores.last_name = "El apellido es requerido";
            if (!form.username.trim()) nuevosErrores.username = "El usuario es requerido";
            if (!form.email.trim()) nuevosErrores.email = "El correo es requerido";
            if (
                form.email &&
                !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email)
            ) {
                nuevosErrores.email = "Correo inválido";
            }
            if (!form.password.trim()) nuevosErrores.password = "La contraseña es requerida";
            else if (form.password.length < 5) nuevosErrores.password = "Mínimo 5 caracteres";
        }
        if (opcion === "curso" && !form.nombre_curso.trim()) {
            nuevosErrores.nombre_curso = "El nombre del curso es requerido";
        }

        setErrors(nuevosErrores);
        if (Object.keys(nuevosErrores).length > 0) {
            setLoading(false);
            return;
        }

        let url = "";
        let body = {};

        if (opcion === "estudiante" || opcion === "docente") {
            url = opcion === "estudiante"
                ? "http://localhost:5000/api/admin/crear-estudiante"
                : "http://localhost:5000/api/admin/crear-docente";
            body = {
                username: form.username,
                email: form.email,
                password: form.password,
                first_name: form.first_name,
                last_name: form.last_name,
            };
        } else if (opcion === "curso") {
            url = "http://localhost:5000/api/admin/crear-curso";
            body = {
                nombre: form.nombre_curso,
            };
        }

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            setLoading(false);

            if (res.status === 201 || res.status === 200) {
                toast.success(
                    opcion === "curso"
                        ? "Curso creado correctamente"
                        : `Usuario ${opcion === "estudiante" ? "estudiante" : "docente"} creado correctamente`
                );
                setForm({
                    username: "",
                    email: "",
                    password: "",
                    first_name: "",
                    last_name: "",
                    nombre_curso: "",
                });
                setErrors({});
            } else if (res.status === 407 && data.errors) {
                // Manejo de errores específicos enviados por el backend
                console.log("Errores específicos:", data.errors);
                setErrors(data.errors);
                Object.keys(data.errors).forEach((key) => {
                    toast.error(data.errors[key]); // Mostrar cada error en un toast
                });
            } else if (data.error) {
                // Manejo de errores generales
                toast.error(data.error || "Error al crear. Intenta de nuevo.");
            } else {
                // Si no hay errores específicos ni generales, mostrar un mensaje genérico
                toast.error("Error desconocido. Intenta de nuevo.");
            }
        } catch {
            toast.error("Error en la solicitud:");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 to-white dark:from-gray-800 dark:to-gray-900">
            <Header onLogout={handleLogout} />

            {/* Botón de regresar */}
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

                    {/* Tabs de selección */}
                    <div className="flex justify-center gap-4 mb-8">
                        <button
                            className={`px-6 py-2 rounded-full font-semibold transition ${opcion === "estudiante"
                                ? "bg-blue-600 text-white scale-110"
                                : "bg-blue-100 text-blue-700 hover:bg-blue-300"
                                }`}
                            onClick={() => handleTabChange("estudiante")}
                        >
                            Crear Estudiante
                        </button>
                        <button
                            className={`px-6 py-2 rounded-full font-semibold transition ${opcion === "docente"
                                ? "bg-blue-600 text-white scale-110"
                                : "bg-blue-100 text-blue-700 hover:bg-blue-300"
                                }`}
                            onClick={() => handleTabChange("docente")}
                        >
                            Crear Docente
                        </button>
                        <button
                            className={`px-6 py-2 rounded-full font-semibold transition ${opcion === "curso"
                                ? "bg-blue-600 text-white scale-110"
                                : "bg-blue-100 text-blue-700 hover:bg-blue-300"
                                }`}
                            onClick={() => handleTabChange("curso")}
                        >
                            Crear Curso
                        </button>
                    </div>

                    {/* Formulario correspondiente */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5 items-center w-full">
                        {(opcion === "estudiante" || opcion === "docente") && (
                            <>
                                <div className="w-full">
                                    <input
                                        type="text"
                                        name="first_name"
                                        placeholder="Nombres"
                                        value={form.first_name}
                                        onChange={handleInput}
                                        className={`w-full px-4 py-2 border rounded-lg ${errors.first_name ? "border-red-500" : ""}`}
                                        required
                                    />
                                    {errors.first_name && (
                                        <span className="text-red-600 text-sm">{errors.first_name}</span>
                                    )}
                                </div>
                                <div className="w-full">
                                    <input
                                        type="text"
                                        name="last_name"
                                        placeholder="Apellidos"
                                        value={form.last_name}
                                        onChange={handleInput}
                                        className={`w-full px-4 py-2 border rounded-lg ${errors.last_name ? "border-red-500" : ""}`}
                                        required
                                    />
                                    {errors.last_name && (
                                        <span className="text-red-600 text-sm">{errors.last_name}</span>
                                    )}
                                </div>
                                <div className="w-full">
                                    <input
                                        type="text"
                                        name="username"
                                        placeholder="Usuario"
                                        value={form.username}
                                        onChange={handleInput}
                                        className={`w-full px-4 py-2 border rounded-lg ${errors.username ? "border-red-500" : ""}`}
                                        required
                                    />
                                    {errors.username && (
                                        <span className="text-red-600 text-sm">{errors.username}</span>
                                    )}
                                </div>
                                <div className="w-full">
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Correo electrónico"
                                        value={form.email}
                                        onChange={handleInput}
                                        className={`w-full px-4 py-2 border rounded-lg ${errors.email ? "border-red-500" : ""}`}
                                        required
                                    />
                                    {errors.email && (
                                        <span className="text-red-600 text-sm">{errors.email}</span>
                                    )}
                                </div>
                                <div className="w-full">
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Contraseña"
                                        value={form.password}
                                        onChange={handleInput}
                                        className={`w-full px-4 py-2 border rounded-lg ${errors.password ? "border-red-500" : ""}`}
                                        required
                                        autoComplete="new-password"
                                    />
                                    {errors.password && (
                                        <span className="text-red-600 text-sm">{errors.password}</span>
                                    )}
                                </div>
                            </>
                        )}

                        {opcion === "curso" && (
                            <div className="w-full">
                                <input
                                    type="text"
                                    name="nombre_curso"
                                    placeholder="Nombre del curso"
                                    value={form.nombre_curso}
                                    onChange={handleInput}
                                    className={`w-full px-4 py-2 border rounded-lg ${errors.nombre_curso ? "border-red-500" : ""}`}
                                    required
                                />
                                {errors.nombre_curso && (
                                    <span className="text-red-600 text-sm">{errors.nombre_curso}</span>
                                )}
                            </div>
                        )}

                        <button
                            type="submit"
                            className={`w-full px-6 py-3 rounded-lg font-semibold transition ${loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-800"
                                }`}
                            disabled={loading}
                        >
                            {loading
                                ? "Procesando..."
                                : opcion === "curso"
                                    ? "Crear Curso"
                                    : `Crear ${opcion === "estudiante" ? "Estudiante" : "Docente"}`}
                        </button>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
}
