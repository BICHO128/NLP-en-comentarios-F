import { useState, useEffect, ChangeEvent } from "react";
import Header from "../components/shared/Header";
import Footer from "../components/shared/Footer";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthStore } from "../stores/Autenticacion";

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

type FormUsuario = {
    id?: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    email?: string;
    password?: string;
};

type FormCurso = {
    id?: number;
    nombre?: string;
};

type Opcion = "docente" | "estudiante" | "curso";

export default function AdminActualizar() {
    const navigate = useNavigate();
    const { token } = useAuthStore();

    // Tabs: docente, estudiante, curso
    const [opcion, setOpcion] = useState<Opcion>("docente");

    // Listas
    const [listaDocentes, setListaDocentes] = useState<Docente[]>([]);
    const [listaEstudiantes, setListaEstudiantes] = useState<Estudiante[]>([]);
    const [listaCursos, setListaCursos] = useState<Curso[]>([]);

    // Seleccionado (id)
    const [seleccionado, setSeleccionado] = useState<number | "">("");

    // Form
    const [form, setForm] = useState<FormUsuario | FormCurso>({});
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    // Cargar listas desde backend
    useEffect(() => {
        if (opcion === "docente") {
            fetch("http://localhost:5000/api/admin/listar-docentes")
                .then((r) => r.json())
                .then(setListaDocentes);
        } else if (opcion === "estudiante") {
            fetch("http://localhost:5000/api/admin/listar-estudiantes")
                .then((r) => r.json())
                .then(setListaEstudiantes);
        } else if (opcion === "curso") {
            fetch("http://localhost:5000/api/admin/listar-cursos")
                .then((r) => r.json())
                .then(setListaCursos);
        }
        setSeleccionado("");
        setForm({});
        setErrors({});
    }, [opcion]);

    // Cargar datos del elemento seleccionado
    useEffect(() => {
        setForm({});
        setErrors({});
        if (seleccionado === "") return;

        let url = "";
        if (opcion === "docente") {
            url = `http://localhost:5000/api/admin/obtener-docente/${seleccionado}`;
        } else if (opcion === "estudiante") {
            url = `http://localhost:5000/api/admin/obtener-estudiante/${seleccionado}`;
        } else if (opcion === "curso") {
            url = `http://localhost:5000/api/admin/obtener-curso/${seleccionado}`;
        }

        if (!url) return;

        fetch(url, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((r) => r.json())
            .then((data) => {
                if (opcion === "curso") setForm({ id: data.id, nombre: data.nombre });
                else setForm({
                    id: data.id,
                    first_name: data.first_name,
                    last_name: data.last_name,
                    username: data.username,
                    email: data.email,
                });
            });
    }, [seleccionado, opcion, token]);


    // Maneja los cambios en los formularios
    const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    };

    // Validación avanzada por campo antes de enviar
    const validar = (): boolean => {
        const nuevosErrores: { [k: string]: string } = {};

        if (opcion === "docente" || opcion === "estudiante") {
            const f = form as FormUsuario;
            if (f.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(f.email))
                nuevosErrores.email = "Correo inválido";
            if (f.password && f.password.length < 5)
                nuevosErrores.password = "Contraseña: mínimo 5 caracteres";
            if (f.password && !/[A-Z]/.test(f.password))
                nuevosErrores.password = "Contraseña: al menos 1 mayúscula";
            if (f.password && !/[!@#$%^&*(),.?":{}|<>]/.test(f.password))
                nuevosErrores.password = "Contraseña: al menos 1 caracter especial";
        }
        if (opcion === "curso") {
            const f = form as FormCurso;
            if (f.nombre && f.nombre.trim().length === 0)
                nuevosErrores.nombre = "El nombre es obligatorio";
        }

        // Debe haber al menos un cambio
        if (seleccionado && Object.keys(form).length <= 1) {
            nuevosErrores.general = "Debes editar al menos un campo.";
        }

        setErrors(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    // Envía los formularios según la opción
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!validar()) {
            setLoading(false);
            return;
        }

        let url = "";
        let body = {};

        if (opcion === "docente") {
            url = `http://localhost:5000/api/admin/actualizar-docente/${(form as FormUsuario).id}`;
            body = form;
        } else if (opcion === "estudiante") {
            url = `http://localhost:5000/api/admin/actualizar-estudiante/${(form as FormUsuario).id}`;
            body = form;
        } else if (opcion === "curso") {
            url = `http://localhost:5000/api/admin/actualizar-curso/${(form as FormCurso).id}`;
            body = { nombre: (form as FormCurso).nombre };
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
            if (res.status === 200) {
                toast.success("Actualización exitosa");
                setErrors({});
                // Actualizar listas tras éxito (opcional, puedes quitar si no quieres refetch inmediato)
                if (opcion === "docente") {
                    setListaDocentes((prev) =>
                        prev.map((d) => (d.id === (form as FormUsuario).id
                            ? { ...d, ...form }
                            : d
                        ))
                    );
                }
                if (opcion === "estudiante") {
                    setListaEstudiantes((prev) =>
                        prev.map((e) => (e.id === (form as FormUsuario).id
                            ? { ...e, ...form }
                            : e
                        ))
                    );
                }
                if (opcion === "curso") {
                    setListaCursos((prev) =>
                        prev.map((c) => (c.id === (form as FormCurso).id
                            ? { ...c, ...form }
                            : c
                        ))
                    );
                }
            } else {
                // Manejo de errores personalizados
                if (data.error?.toLowerCase().includes("username")) {
                    setErrors(prev => ({ ...prev, username: "El usuario ya existe" }));
                }
                if (data.error?.toLowerCase().includes("email")) {
                    setErrors(prev => ({ ...prev, email: "El correo ya existe" }));
                }
                if (data.error?.toLowerCase().includes("nombre")) {
                    setErrors(prev => ({ ...prev, nombre: "Realiza un cambio" }));
                }
                if (data.error?.toLowerCase().includes("contraseña")) {
                    setErrors(prev => ({ ...prev, password: data.error }));
                }
                if (!data.error && !data.msg) {
                    toast.error("Error desconocido. Intenta de nuevo.");
                } else {
                    toast.error(data.error || data.msg);
                }
            }
        } catch {
            setLoading(false);
            toast.error("Error de conexión con el backend.");
        }
    };

    // ------ OPCIONAL / EXTRA: RENDER DE OPCIONES POR FUNCIÓN ---------
    function renderOptions() {
        if (opcion === "curso") {
            return listaCursos.map((c) =>
                <option key={c.id} value={c.id}>{c.nombre}</option>
            );
        } else if (opcion === "docente") {
            return listaDocentes.map((d) =>
                <option key={d.id} value={d.id}>
                    {d.first_name} {d.last_name} ({d.username})
                </option>
            );
        } else {
            return listaEstudiantes.map((e) =>
                <option key={e.id} value={e.id}>
                    {e.first_name} {e.last_name} ({e.username})
                </option>
            );
        }
    }

    const handleTabChange = (tab: Opcion) => {
        setOpcion(tab);
        setSeleccionado("");
        setForm({});
        setErrors({});
    };

    const handleLogout = () => {
        navigate('/login');
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
                        Actualizar Información
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

                    {/* Selector de elemento */}
                    <div className="mb-6">
                        <select
                            value={seleccionado}
                            onChange={e => {
                                const value = Number(e.target.value);
                                setSeleccionado(value);

                                // Asegúrate que el form siempre tenga el id correcto
                                if (opcion === "curso") {
                                    const cursoSel = listaCursos.find((c) => c.id === value);
                                    if (cursoSel) setForm({ id: cursoSel.id, nombre: cursoSel.nombre });
                                } else if (opcion === "docente") {
                                    const docenteSel = listaDocentes.find((d) => d.id === value);
                                    if (docenteSel) setForm({
                                        id: docenteSel.id,
                                        first_name: docenteSel.first_name,
                                        last_name: docenteSel.last_name,
                                        username: docenteSel.username,
                                        email: docenteSel.email,
                                    });
                                } else if (opcion === "estudiante") {
                                    const estudianteSel = listaEstudiantes.find((e) => e.id === value);
                                    if (estudianteSel) setForm({
                                        id: estudianteSel.id,
                                        first_name: estudianteSel.first_name,
                                        last_name: estudianteSel.last_name,
                                        username: estudianteSel.username,
                                        email: estudianteSel.email,
                                    });
                                }
                                setErrors({});
                            }}
                            className="w-full px-4 py-2 border rounded-lg"
                        >
                            <option value="">Selecciona {opcion}</option>
                            {renderOptions()}
                        </select>

                    </div>

                    {/* Formulario de actualización */}
                    {seleccionado && (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-5 items-center w-full">
                            {/* DOCENTE/ESTUDIANTE */}
                            {(opcion === "docente" || opcion === "estudiante") && (
                                <>
                                    <div className="w-full">
                                        <input
                                            type="text"
                                            name="first_name"
                                            placeholder="Nombres"
                                            value={(form as FormUsuario).first_name || ""}
                                            onChange={handleInput}
                                            className={`w-full px-4 py-2 border rounded-lg ${errors.first_name ? "border-red-500" : ""}`}
                                        />
                                        {errors.first_name && <span className="text-red-600 text-sm">{errors.first_name}</span>}
                                    </div>
                                    <div className="w-full">
                                        <input
                                            type="text"
                                            name="last_name"
                                            placeholder="Apellidos"
                                            value={(form as FormUsuario).last_name || ""}
                                            onChange={handleInput}
                                            className={`w-full px-4 py-2 border rounded-lg ${errors.last_name ? "border-red-500" : ""}`}
                                        />
                                        {errors.last_name && <span className="text-red-600 text-sm">{errors.last_name}</span>}
                                    </div>
                                    <div className="w-full">
                                        <input
                                            type="text"
                                            name="username"
                                            placeholder="Usuario"
                                            value={(form as FormUsuario).username || ""}
                                            onChange={handleInput}
                                            className={`w-full px-4 py-2 border rounded-lg ${errors.username ? "border-red-500" : ""}`}
                                        />
                                        {errors.username && <span className="text-red-600 text-sm">{errors.username}</span>}
                                    </div>
                                    <div className="w-full">
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="Correo electrónico"
                                            value={(form as FormUsuario).email || ""}
                                            onChange={handleInput}
                                            className={`w-full px-4 py-2 border rounded-lg ${errors.email ? "border-red-500" : ""}`}
                                        />
                                        {errors.email && <span className="text-red-600 text-sm">{errors.email}</span>}
                                    </div>
                                    <div className="w-full">
                                        <input
                                            type="password"
                                            name="password"
                                            placeholder="Contraseña (opcional)"
                                            value={(form as FormUsuario).password || ""}
                                            onChange={handleInput}
                                            className={`w-full px-4 py-2 border rounded-lg ${errors.password ? "border-red-500" : ""}`}
                                            autoComplete="new-password"
                                        />
                                        {errors.password && <span className="text-red-600 text-sm">{errors.password}</span>}
                                    </div>
                                </>
                            )}

                            {/* CURSO */}
                            {opcion === "curso" && (
                                <div className="w-full">
                                    <input
                                        type="text"
                                        name="nombre"
                                        placeholder="Nombre del curso"
                                        value={(form as FormCurso).nombre || ""}
                                        onChange={handleInput}
                                        className={`w-full px-4 py-2 border rounded-lg ${errors.nombre ? "border-red-500" : ""}`}
                                    />
                                    {errors.nombre && (
                                        <span className="text-red-600 text-sm">{errors.nombre}</span>
                                    )}
                                </div>
                            )}

                            {/* Mensaje general */}
                            {errors.general && (
                                <span className="text-red-600 text-sm">{errors.general}</span>
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
                                    : "Actualizar"}
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
