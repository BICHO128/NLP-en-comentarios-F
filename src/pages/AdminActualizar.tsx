import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthStore } from "../stores/Autenticacion";
import { useDarkMode } from '../hooks/useDarkMode';
import Header from "../components/shared/Header";
import Footer from "../components/shared/Footer";
import DarkModeToggle from "../components/shared/DarkModeToggle";
import React from 'react';

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
    password: string;
};

type FormCurso = {
    id?: number;
    nombre?: string;
};

type Opcion = "docente" | "estudiante" | "curso";

export default function AdminActualizar() {
    const navigate = useNavigate();
    const { token } = useAuthStore();
    const { isDarkMode } = useDarkMode();
    const { logout } = useAuthStore();

    const [opcion, setOpcion] = useState<Opcion>("docente");
    const [listaDocentes, setListaDocentes] = useState<Docente[]>([]);
    const [listaEstudiantes, setListaEstudiantes] = useState<Estudiante[]>([]);
    const [listaCursos, setListaCursos] = useState<Curso[]>([]);
    const [seleccionado, setSeleccionado] = useState<number | "">("");
    const [form, setForm] = useState<FormUsuario | FormCurso>({});
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const [showPassword, setShowPassword] = useState(false);



    const handleLogout = () => {
        logout(); // Limpia el estado de autenticación
        navigate('/'); // Redirige al login
    };

    // Cargar listas desde backend
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

                setSeleccionado("");
                setForm({});
                setErrors({});
            } catch {
                toast.error("Error al cargar los datos");
            }
        };

        cargarDatos();
    }, [opcion]);

    // Cargar datos del elemento seleccionado
    useEffect(() => {
        const cargarDetalle = async () => {
            if (seleccionado === "") return;

            let url = "";
            if (opcion === "docente") {
                url = `http://localhost:5000/api/admin/obtener-docente/${seleccionado}`;
            } else if (opcion === "estudiante") {
                url = `http://localhost:5000/api/admin/obtener-estudiante/${seleccionado}`;
            } else if (opcion === "curso") {
                url = `http://localhost:5000/api/admin/obtener-curso/${seleccionado}`;
            }

            try {
                const response = await fetch(url, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();

                if (opcion === "curso") {
                    setForm({ id: data.id, nombre: data.nombre });
                } else {
                    setForm({
                        id: data.id,
                        first_name: data.first_name,
                        last_name: data.last_name,
                        username: data.username,
                        email: data.email,
                    });
                }
            } catch {
                toast.error("Error al cargar los detalles");
            }
        };

        cargarDetalle();
    }, [seleccionado, opcion, token]);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    // Modificación en la función validar para mejor manejo de errores
    const validar = (): boolean => {
        const nuevosErrores: { [k: string]: string } = {};
        const f = form as FormUsuario;

        if (opcion === "docente" || opcion === "estudiante") {
            if (!f.first_name?.trim()) nuevosErrores.first_name = "El nombre es requerido";
            if (!f.last_name?.trim()) nuevosErrores.last_name = "El apellido es requerido";

            if (f.email) {
                if (!f.email.trim()) {
                    nuevosErrores.email = "El correo es requerido";
                } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(f.email)) {
                    nuevosErrores.email = "Correo electrónico inválido";
                }
            }

            if (f.username && !f.username.trim()) {
                nuevosErrores.username = "El usuario es requerido";
            }

            // Validación de contraseña solo si se proporciona
            if (f.password && f.password.length > 0) {
                if (f.password.length < 5) {
                    nuevosErrores.password = "Mínimo 5 caracteres";
                }
                if (!/[A-Z]/.test(f.password)) {
                    nuevosErrores.password = (nuevosErrores.password ? nuevosErrores.password + ", " : "") + "1 mayúscula";
                }
                if (!/\d/.test(f.password)) {
                    nuevosErrores.password = (nuevosErrores.password ? nuevosErrores.password + ", " : "") + "1 número";
                }
                if (!/[!@#$%^&*(),.?":{}|<>]/.test(f.password)) {
                    nuevosErrores.password = (nuevosErrores.password ? nuevosErrores.password + ", " : "") + "1 caracter especial";
                }
            }
        }

        if (opcion === "curso") {
            const f = form as FormCurso;
            if (!f.nombre?.trim()) {
                nuevosErrores.nombre = "El nombre del curso es requerido";
            }
        }

        if (seleccionado && Object.keys(form).length <= 1) {
            nuevosErrores.general = "Debes editar al menos un campo";
        }

        setErrors(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!validar()) {
            setLoading(false);
            return;
        }

        try {
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

            if (res.ok) {
                toast.success("Actualización exitosa");
                setErrors({});

                // Actualizar listas
                if (opcion === "docente") {
                    setListaDocentes((prev) =>
                        prev.map((d) => (d.id === (form as FormUsuario).id ? { ...d, ...form } : d))
                    );
                } else if (opcion === "estudiante") {
                    setListaEstudiantes((prev) =>
                        prev.map((e) => (e.id === (form as FormUsuario).id ? { ...e, ...form } : e))
                    );
                } else if (opcion === "curso") {
                    setListaCursos((prev) =>
                        prev.map((c) => (c.id === (form as FormCurso).id ? { ...c, ...form } : c))
                    );
                }
            } else {
                // Manejo mejorado de errores del backend
                if (data.errors) {
                    // Si el backend envía errores estructurados
                    setErrors(data.errors);

                    // Mostrar cada error en un toast
                    Object.entries(data.errors).forEach(([message]) => {
                        toast.error(` ${message}`, {
                            position: "top-right",
                            autoClose: 5000,
                        });
                    });
                } else if (data.error) {
                    // Manejo de errores generales
                    if (data.error.toLowerCase().includes("username")) {
                        setErrors({ username: "El nombre de usuario ya existe" });
                        toast.error(" El nombre de usuario ya existe", {
                            position: "top-right",
                        });
                    } else if (data.error.toLowerCase().includes("email")) {
                        setErrors({ email: "El correo electrónico ya existe" });
                        toast.error(" El correo electrónico ya existe", {
                            position: "top-right",
                        });
                    } else if (data.error.toLowerCase().includes("nombre")) {
                        setErrors({ nombre: "El nombre del curso ya existe" });
                        toast.error(" El nombre del curso ya existe", {
                            position: "top-right",
                        });
                    } else {
                        toast.error(` ${data.error}`, {
                            position: "top-right",
                        });
                    }
                } else {
                    toast.error(" Error desconocido al actualizar", {
                        position: "top-right",
                    });
                }
            }
        } catch {
            setLoading(false);
            toast.error(" Error de conexión con el servidor", {
                position: "top-right",
            });
        }
    };

    const renderOptions = () => {
        if (opcion === "curso") {
            return listaCursos.map((c) => (
                <option key={c.id} value={c.id}>
                    {c.nombre}
                </option>
            ));
        } else if (opcion === "docente") {
            return listaDocentes.map((d) => (
                <option key={d.id} value={d.id}>
                    {d.first_name} {d.last_name} ({d.username})
                </option>
            ));
        } else {
            return listaEstudiantes.map((e) => (
                <option key={e.id} value={e.id}>
                    {e.first_name} {e.last_name} ({e.username})
                </option>
            ));
        }
    };

    const handleTabChange = (tab: Opcion) => {
        setOpcion(tab);
        setSeleccionado("");
        setForm({});
        setErrors({});
    };

    return (
        <div
            className={`min-h-screen flex flex-col  ${isDarkMode ? 'bg-gradient-to-b from-black via-blue-400 to-white' : "bg-gray-50 text-gray-800"
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

                {/* Contenedor para el formulario */}
                <div
                    className={`max-w-4xl mx-auto rounded-3xl shadow-lg overflow-hidden ${isDarkMode
                        ? "bg-white shadow-gray-200"
                        : "bg-white shadow-blue-400"
                        }`}
                >
                    <div
                        className={`p-6 shadow-lg ${isDarkMode ? "bg-gradient-to-br from-blue-400 via-white to-blue-400 shadow-blue-400" : "bg-gradient-to-br from-blue-300 via-white to-blue-300 shadow-blue-200"}`}
                    >
                        <h1
                            className={`text-2xl md:text-3xl font-bold text-center ${isDarkMode ? "text-blue-800" : "text-blue-800"
                                }`}
                        >
                            Actualizar Información
                        </h1>
                    </div>

                    <div className="p-6">
                        <div className="flex flex-wrap justify-center gap-2 mb-8 text-xl">
                            {(["docente", "estudiante", "curso"] as Opcion[]).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => handleTabChange(tab)}
                                    className={`px-4 py-2 rounded-full font-medium transition-all border ${opcion === tab
                                        ? isDarkMode
                                            ? "bg-blue-700 text-white shadow-md border-blue-900"
                                            : "bg-blue-700 text-white shadow-md border-blue-600"
                                        : isDarkMode
                                            ? "bg-gray-100 text-blue-600 hover:bg-blue-400 border-blue-600"
                                            : "bg-gray-100 text-blue-600 hover:bg-blue-400 border-blue-400"
                                        }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>

                        <div className="mb-6">
                            <select
                                value={seleccionado}
                                onChange={(e) =>
                                    setSeleccionado(
                                        e.target.value ? Number(e.target.value) : ""
                                    )
                                }
                                className={`w-full p-3 rounded-3xl border ${isDarkMode
                                    ? "bg-gray-700 border-gray-600 text-white"
                                    : "bg-white border-gray-300 text-gray-800"
                                    }`}
                            >
                                <option value="">Selecciona {opcion}</option>
                                {renderOptions()}
                            </select>
                        </div>

                        {seleccionado && (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {(opcion === "docente" || opcion === "estudiante") && (
                                    <>
                                        {["first_name", "last_name", "username", "email"].map((field) => (
                                            <div key={field} className="mb-4">
                                                <label htmlFor={field} className={`block text-lg font-medium mb-1 ${isDarkMode ? "text-blue-600" : "text-blue-400"}`}>
                                                    {field === "first_name" ? "Nombres" :
                                                        field === "last_name" ? "Apellidos" :
                                                            field === "username" ? "Usuario" : "Correo electrónico"}
                                                </label>
                                                <input
                                                    type={field === "email" ? "email" : "text"}
                                                    id={field}
                                                    name={field}
                                                    value={(form as FormUsuario)[field as keyof FormUsuario] || ""}
                                                    onChange={handleInput}
                                                    className={`w-full p-3 rounded-3xl border-2 ${errors[field]
                                                        ? "border-red-500 bg-red-50"
                                                        : isDarkMode
                                                            ? "bg-white border-blue-600 focus:border-blue-500"
                                                            : "bg-white border-blue-400 focus:border-blue-500"
                                                        }`}
                                                    autoComplete="off"
                                                />
                                                {errors[field] && (
                                                    <p className="mt-1 text-sm text-red-500 flex items-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        {errors[field]}
                                                    </p>
                                                )}
                                            </div>
                                        ))}


                                        <div className="mb-4">
                                            <label htmlFor="password" className={`block text-lg font-medium mb-1 ${isDarkMode ? "text-blue-600" : "text-blue-400"}`}>
                                                Nueva contraseña
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    id="password"
                                                    name="password"
                                                    value={(form as FormUsuario).password || ""}
                                                    onChange={handleInput}
                                                    className={`w-full p-3 rounded-3xl border-2 pr-10 ${errors.password
                                                        ? "border-red-500 bg-red-50"
                                                        : isDarkMode
                                                            ? "bg-white border-blue-600 focus:border-blue-500"
                                                            : "bg-white border-blue-400 focus:border-blue-500"
                                                        }`}
                                                    autoComplete="new-password"
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                                >
                                                    {showPassword ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                            {errors.password && (
                                                <p className="mt-1 text-sm text-red-500 flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    {errors.password}
                                                </p>
                                            )}


                                            {(form as FormUsuario).password && !errors.password && (
                                                <div className="text-sm mt-2">
                                                    <p className={`mb-1 ${isDarkMode ? "text-gray-900" : "text-gray-900"}`}>Requisitos de contraseña:</p>
                                                    <ul className="space-y-1">
                                                        <li className={`flex items-center ${(form as FormUsuario).password?.length >= 5 ? "text-green-500" : isDarkMode ? "text-gray-600" : "text-gray-600"}`}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                                {(form as FormUsuario).password?.length >= 5 ? (
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                ) : (
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                                )}
                                                            </svg>
                                                            Mínimo 5 caracteres
                                                        </li>
                                                        <li className={`flex items-center ${/[A-Z]/.test((form as FormUsuario).password || "") ? "text-green-500" : isDarkMode ? "text-gray-600" : "text-gray-600"}`}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                                {/[A-Z]/.test((form as FormUsuario).password || "") ? (
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                ) : (
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                                )}
                                                            </svg>
                                                            Al menos 1 mayúscula
                                                        </li>
                                                        <li className={`flex items-center ${/\d/.test((form as FormUsuario).password || "") ? "text-green-500" : isDarkMode ? "text-gray-600" : "text-gray-600"}`}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                                {/\d/.test((form as FormUsuario).password || "") ? (
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                ) : (
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                                )}
                                                            </svg>
                                                            Al menos 1 número
                                                        </li>
                                                        <li className={`flex items-center ${/[!@#$%^&*(),.?":{}|<>]/.test((form as FormUsuario).password || "") ? "text-green-500" : isDarkMode ? "text-gray-600" : "text-gray-600"}`}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                                {/[!@#$%^&*(),.?":{}|<>]/.test((form as FormUsuario).password || "") ? (
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                ) : (
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                                )}
                                                            </svg>
                                                            Al menos 1 caracter especial
                                                        </li>
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}

                                {opcion === "curso" && (
                                    <div>
                                        <h2 className="text-blue-700 text-lg mb-2 ml-2"> Actualizar por: </h2>
                                        <input
                                            type="text"
                                            name="nombre"
                                            placeholder="Nombre del curso"
                                            value={(form as FormCurso).nombre || ""}
                                            onChange={handleInput}
                                            className={`w-full p-3 rounded-3xl border-2 border-blue-400 ${isDarkMode
                                                ? "bg-white border-blue-600 text-black"
                                                : "bg-white border-blue-400 text-black"
                                                } ${errors.nombre ? "border-red-500" : ""}`}
                                        />
                                        {errors.nombre && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {errors.nombre}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {errors.general && (
                                    <div className="p-3 rounded-3xl bg-red-100 text-red-700">
                                        {errors.general}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full p-3 rounded-3xl font-medium transition-colors ${loading
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : isDarkMode
                                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                                            : "bg-blue-500 hover:bg-blue-600 text-white"
                                        }`}
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
                                            Procesando...
                                        </span>
                                    ) : (
                                        "Actualizar"
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </main>

            {/* Boton Dark mode */}
            <DarkModeToggle />
            <Footer />
        </div>
    );
}