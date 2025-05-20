import { useState } from "react";
import Header from "../components/shared/Header";
import Footer from "../components/shared/Footer";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthStore } from "../stores/Autenticacion";

export default function AdminActualizar() {
    const navigate = useNavigate();
    const { token } = useAuthStore();

    const [opcion, setOpcion] = useState<"estudiante" | "docente" | "curso">("estudiante");
    const [form, setForm] = useState({
        id: "",
        username: "",
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        nombre_curso: "",
    });
    const [searchValue, setSearchValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [found, setFound] = useState(false);

    const handleTabChange = (nuevaOpcion: "estudiante" | "docente" | "curso") => {
        setOpcion(nuevaOpcion);
        setErrors({});
        setForm({
            id: "",
            username: "",
            email: "",
            password: "",
            first_name: "",
            last_name: "",
            nombre_curso: "",
        });
        setSearchValue("");
        setFound(false);
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors(prev => ({ ...prev, [e.target.name]: "" }));
    };

    // Buscar usuario o curso para editar
    const handleBuscar = async () => {
        setErrors({});
        setFound(false);
        setLoading(true);

        let url = "";
        if (opcion === "estudiante") url = `http://localhost:5000/api/admin/listar-estudiantes?busqueda=${searchValue}`;
        if (opcion === "docente") url = `http://localhost:5000/api/admin/listar-docentes?busqueda=${searchValue}`;
        if (opcion === "curso") url = `http://localhost:5000/api/admin/listar-cursos?nombre=${searchValue}`;

        try {
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setLoading(false);

            if (!res.ok || !data) {
                toast.error("No se encontró el registro. Revisa la búsqueda.");
                return;
            }
            // Asume la API devuelve el objeto completo (incluyendo id)
            setForm({
                ...form,
                id: data.id || "",
                username: data.username || "",
                email: data.email || "",
                first_name: data.first_name || "",
                last_name: data.last_name || "",
                nombre_curso: data.nombre || "",
                password: "",
            });
            setFound(true);
            toast.success("Registro encontrado. Puedes editar.");
        } catch {
            setLoading(false);
            toast.error("Error de conexión al buscar.");
        }
    };

    // Actualizar datos
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const nuevosErrores: { [key: string]: string } = {};
        if ((opcion === "estudiante" || opcion === "docente")) {
            if (!form.first_name.trim()) nuevosErrores.first_name = "El nombre es requerido";
            if (!form.last_name.trim()) nuevosErrores.last_name = "El apellido es requerido";
            if (!form.username.trim()) nuevosErrores.username = "El usuario es requerido";
            if (!form.email.trim()) nuevosErrores.email = "El correo es requerido";
            if (
                form.email &&
                !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email)
            ) nuevosErrores.email = "Correo inválido";
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
                ? `http://localhost:5000/api/admin/actualizar-estudiante/${form.id}`
                : `http://localhost:5000/api/admin/actualizar-docente/${form.id}`;
            body = {
                username: form.username,
                email: form.email,
                first_name: form.first_name,
                last_name: form.last_name,
                password: form.password ? form.password : undefined, // solo si cambia
            };
        } else if (opcion === "curso") {
            url = `http://localhost:5000/api/admin/actualizar-curso/${form.id}`;
            body = { nombre: form.nombre_curso };
        }

        try {
            const res = await fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            setLoading(false);

            if (res.status === 200) {
                toast.success("Actualización exitosa.");
                setFound(false);
                setForm({
                    id: "",
                    username: "",
                    email: "",
                    password: "",
                    first_name: "",
                    last_name: "",
                    nombre_curso: "",
                });
            } else if (data.errors) {
                setErrors(data.errors);
            } else {
                if (data.error?.toLowerCase().includes("username")) {
                    setErrors(prev => ({ ...prev, username: "El usuario ya existe" }));
                }
                if (data.error?.toLowerCase().includes("email")) {
                    setErrors(prev => ({ ...prev, email: "El correo ya existe" }));
                }
                if (data.error?.toLowerCase().includes("nombre")) {
                    setErrors(prev => ({ ...prev, nombre_curso: "El curso ya existe" }));
                }
                toast.error(data.error || data.msg || "Error al actualizar.");
            }
        } catch {
            setLoading(false);
            toast.error("Error de conexión con el backend.");
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 to-white dark:from-gray-800 dark:to-gray-900">
            <Header onLogout={() => navigate('/login')} />
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
                        Actualizar Usuarios o Cursos
                    </h1>
                    {/* Tabs */}
                    <div className="flex justify-center gap-4 mb-8">
                        <button className={`px-6 py-2 rounded-full font-semibold transition ${opcion === "estudiante" ? "bg-yellow-500 text-white scale-110" : "bg-yellow-100 text-yellow-700 hover:bg-yellow-300"}`}
                            onClick={() => handleTabChange("estudiante")}
                        >Actualizar Estudiante</button>
                        <button className={`px-6 py-2 rounded-full font-semibold transition ${opcion === "docente" ? "bg-yellow-500 text-white scale-110" : "bg-yellow-100 text-yellow-700 hover:bg-yellow-300"}`}
                            onClick={() => handleTabChange("docente")}
                        >Actualizar Docente</button>
                        <button className={`px-6 py-2 rounded-full font-semibold transition ${opcion === "curso" ? "bg-yellow-500 text-white scale-110" : "bg-yellow-100 text-yellow-700 hover:bg-yellow-300"}`}
                            onClick={() => handleTabChange("curso")}
                        >Actualizar Curso</button>
                    </div>
                    {/* Buscador */}
                    <div className="flex gap-2 w-full mb-5">
                        <input
                            type="text"
                            className="flex-1 px-4 py-2 border rounded-lg"
                            placeholder={
                                opcion === "curso"
                                    ? "Nombre exacto del curso"
                                    : "Usuario o correo electrónico"
                            }
                            value={searchValue}
                            onChange={e => setSearchValue(e.target.value)}
                        />
                        <button
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-5 py-2 rounded-lg font-bold"
                            onClick={handleBuscar}
                            disabled={loading}
                        >
                            {loading ? "Buscando..." : "Buscar"}
                        </button>
                    </div>
                    {/* Formulario para actualizar */}
                    {found && (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-5 items-center w-full">
                            {(opcion === "estudiante" || opcion === "docente") && (
                                <>
                                    <div className="w-full">
                                        <input type="text" name="first_name" placeholder="Nombres"
                                            value={form.first_name} onChange={handleInput}
                                            className={`w-full px-4 py-2 border rounded-lg ${errors.first_name ? "border-red-500" : ""}`} required
                                        />
                                        {errors.first_name && (<span className="text-red-600 text-sm">{errors.first_name}</span>)}
                                    </div>
                                    <div className="w-full">
                                        <input type="text" name="last_name" placeholder="Apellidos"
                                            value={form.last_name} onChange={handleInput}
                                            className={`w-full px-4 py-2 border rounded-lg ${errors.last_name ? "border-red-500" : ""}`} required
                                        />
                                        {errors.last_name && (<span className="text-red-600 text-sm">{errors.last_name}</span>)}
                                    </div>
                                    <div className="w-full">
                                        <input type="text" name="username" placeholder="Usuario"
                                            value={form.username} onChange={handleInput}
                                            className={`w-full px-4 py-2 border rounded-lg ${errors.username ? "border-red-500" : ""}`} required
                                        />
                                        {errors.username && (<span className="text-red-600 text-sm">{errors.username}</span>)}
                                    </div>
                                    <div className="w-full">
                                        <input type="email" name="email" placeholder="Correo electrónico"
                                            value={form.email} onChange={handleInput}
                                            className={`w-full px-4 py-2 border rounded-lg ${errors.email ? "border-red-500" : ""}`} required
                                        />
                                        {errors.email && (<span className="text-red-600 text-sm">{errors.email}</span>)}
                                    </div>
                                    <div className="w-full">
                                        <input type="password" name="password" placeholder="Nueva contraseña (dejar vacío si no cambia)"
                                            value={form.password} onChange={handleInput}
                                            className={`w-full px-4 py-2 border rounded-lg ${errors.password ? "border-red-500" : ""}`}
                                            autoComplete="new-password"
                                        />
                                        {errors.password && (<span className="text-red-600 text-sm">{errors.password}</span>)}
                                    </div>
                                </>
                            )}
                            {opcion === "curso" && (
                                <div className="w-full">
                                    <input type="text" name="nombre_curso" placeholder="Nombre del curso"
                                        value={form.nombre_curso} onChange={handleInput}
                                        className={`w-full px-4 py-2 border rounded-lg ${errors.nombre_curso ? "border-red-500" : ""}`} required
                                    />
                                    {errors.nombre_curso && (
                                        <span className="text-red-600 text-sm">{errors.nombre_curso}</span>
                                    )}
                                </div>
                            )}
                            <button
                                type="submit"
                                className={`w-full px-6 py-3 rounded-lg font-semibold transition ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-yellow-600 text-white hover:bg-yellow-800"
                                    }`}
                                disabled={loading}
                            >
                                {loading ? "Procesando..." : "Actualizar"}
                            </button>
                        </form>
                    )}
                </div>
            </main>
            <ToastContainer />
            <Footer />
        </div>
    );
}
