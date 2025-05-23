import Footer from "../components/shared/Footer";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthStore } from "../stores/Autenticacion";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Header from "../components/shared/Header";
import DarkModeToggle from "../components/shared/DarkModeToggle";
import { useDarkMode } from '../hooks/useDarkMode';
import React from 'react';

export default function AdminCrear() {
    const navigate = useNavigate();
    const { token } = useAuthStore();
    const { isDarkMode } = useDarkMode();
    const { logout } = useAuthStore(); // Asegúrate de tener una función logout en tu store

    // Tab seleccionado
    const [opcion, setOpcion] = useState<"estudiante" | "docente" | "curso">("estudiante");
    const [loading, setLoading] = useState(false);
    // Primero, añade este estado al componente
    const [showPassword, setShowPassword] = useState(false);


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
        logout(); // Limpia el estado de autenticación
        navigate('/'); // Redirige al login
    };

    // Limpia errores al escribir
    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors(prev => ({ ...prev, [e.target.name]: "" }));
    };

    // Función para validar contraseña segura
    const validatePassword = (password: string): { valid: boolean; message?: string } => {
        if (password.length < 5) {
            return { valid: false, message: 'La contraseña debe tener al menos 5 caracteres' };
        }
        if (!/[A-Z]/.test(password)) {
            return { valid: false, message: 'La contraseña debe contener al menos una mayúscula' };
        }
        if (!/\d/.test(password)) {
            return { valid: false, message: 'La contraseña debe contener al menos un número' };
        }
        if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
            return { valid: false, message: 'La contraseña debe contener al menos un carácter especial' };
        }
        return { valid: true };
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
        // Validación de contraseña segura
        const passwordValidation = validatePassword(form.password);
        if (!passwordValidation.valid) {
            nuevosErrores.password = passwordValidation.message || 'Contraseña inválida';
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

            if (res.ok) {
                toast.success(
                    opcion === "curso"
                        ? " Curso creado correctamente"
                        : ` Usuario ${opcion === "estudiante" ? "estudiante" : "docente"} creado correctamente`,
                    {
                        position: "top-right",
                        autoClose: 3000,
                    }
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
            } else if (res.status === 409) {
                // Manejo de errores de duplicados
                setErrors(data.errors || {});

                // Mostrar mensajes de error específicos
                if (data.errors?.username) {
                    toast.error(` ${data.errors.username}`, {
                        position: "top-right",
                        autoClose: 5000,
                    });
                }
                if (data.errors?.email) {
                    toast.error(` ${data.errors.email}`, {
                        position: "top-right",
                        autoClose: 5000,
                    });
                }
                if (data.errors?.nombre) {
                    toast.error(` ${data.errors.nombre}`, {
                        position: "top-right",
                        autoClose: 5000,
                    });
                }
            } else {
                // Manejo de otros errores
                toast.error(
                    data.error || " Error al procesar la solicitud",
                    { position: "top-right" }
                );
            }
        } catch {
            setLoading(false);
            toast.error(" Error de conexión con el servidor", {
                position: "top-right",
            });
        }
    };

    // Animaciones
    const formVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
    };

    return (
        <div
            className={`min-h-screen flex flex-col ${isDarkMode
                ? "bg-gradient-to-b from-black via-blue-400 to-white"
                : "bg-white"
                }`}
        >
            <Header onLogout={handleLogout} />

            {/* Botón de regresar */}
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-24 absolute top-6 left-6 z-40 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-all font-semibold flex items-center gap-2"
                onClick={() => navigate("/panel-admin")}
                style={{ minWidth: 110 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                        clipRule="evenodd"
                    />
                </svg>
                Volver
            </motion.button>

            <main className="flex-1 justify-center items-center flex flex-col gap-4 container mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-2xl p-6 sm:p-8 bg-white rounded-3xl shadow-xl shadow-blue-300 mt-16 mb-10 border border-blue-400"
                >
                    <h1 className="text-3xl md:text-4xl font-bold text-center text-blue-800 mb-8">
                        Crear Usuarios o Cursos
                    </h1>

                    {/* Tabs de selección */}
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8">
                        {(["estudiante", "docente", "curso"] as const).map((tab) => (
                            <motion.button
                                key={tab}
                                className={`px-4 sm:px-6 py-2 rounded-full font-semibold transition-all ${opcion === tab
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                    }`}
                                onClick={() => handleTabChange(tab)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                animate={{
                                    scale: opcion === tab ? 1.1 : 1,
                                }}
                            >
                                {tab === "estudiante" && (
                                    <span className="flex items-center gap-2">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
                                        </svg>
                                        Estudiante
                                    </span>
                                )}
                                {tab === "docente" && (
                                    <span className="flex items-center gap-2">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                        </svg>
                                        Docente
                                    </span>
                                )}
                                {tab === "curso" && (
                                    <span className="flex items-center gap-2">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                                        </svg>
                                        Curso
                                    </span>
                                )}
                            </motion.button>
                        ))}
                    </div>

                    {/* Formulario correspondiente */}
                    <AnimatePresence mode="wait">
                        <motion.form
                            key={opcion}
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-5 items-center w-full"
                            variants={formVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            transition={{ duration: 0.3 }}
                        >
                            {(opcion === "estudiante" || opcion === "docente") && (
                                <>
                                    <div className="w-full space-y-1">
                                        <label
                                            htmlFor="first_name"
                                            className="text-sm font-medium text-gray-700"
                                        >
                                            Nombres
                                        </label>
                                        <input
                                            type="text"
                                            id="first_name"
                                            name="first_name"
                                            placeholder="Ej: Juan Carlos"
                                            value={form.first_name}
                                            onChange={handleInput}
                                            className={`w-full px-4 py-3 border rounded-lg transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.first_name
                                                ? "border-red-500 ring-2 ring-red-200"
                                                : "border-gray-300"
                                                }`}
                                            required
                                        />
                                        {errors.first_name && (
                                            <span className="text-red-600 text-sm flex items-center gap-1">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                {errors.first_name}
                                            </span>
                                        )}
                                    </div>
                                    <div className="w-full space-y-1">
                                        <label
                                            htmlFor="last_name"
                                            className="text-sm font-medium text-gray-700"
                                        >
                                            Apellidos
                                        </label>
                                        <input
                                            type="text"
                                            id="last_name"
                                            name="last_name"
                                            placeholder="Ej: Pérez García"
                                            value={form.last_name}
                                            onChange={handleInput}
                                            className={`w-full px-4 py-3 border rounded-lg transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.last_name
                                                ? "border-red-500 ring-2 ring-red-200"
                                                : "border-gray-300"
                                                }`}
                                            required
                                        />
                                        {errors.last_name && (
                                            <span className="text-red-600 text-sm flex items-center gap-1">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                {errors.last_name}
                                            </span>
                                        )}
                                    </div>
                                    <div className="w-full space-y-1">
                                        <label
                                            htmlFor="username"
                                            className="text-sm font-medium text-gray-700"
                                        >
                                            Nombre de usuario
                                        </label>
                                        <input
                                            type="text"
                                            id="username"
                                            name="username"
                                            placeholder="Ej: juan.perez"
                                            value={form.username}
                                            onChange={handleInput}
                                            className={`w-full px-4 py-3 border rounded-lg transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.username
                                                ? "border-red-500 ring-2 ring-red-200"
                                                : "border-gray-300"
                                                }`}
                                            required
                                        />
                                        {errors.username && (
                                            <span className="text-red-600 text-sm flex items-center gap-1">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                {errors.username}
                                            </span>
                                        )}
                                    </div>
                                    <div className="w-full space-y-1">
                                        <label
                                            htmlFor="email"
                                            className="text-sm font-medium text-gray-700"
                                        >
                                            Correo electrónico
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            placeholder="Ej: juan.perez@example.com"
                                            value={form.email}
                                            onChange={handleInput}
                                            className={`w-full px-4 py-3 border rounded-lg transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.email
                                                ? "border-red-500 ring-2 ring-red-200"
                                                : "border-gray-300"
                                                }`}
                                            required
                                        />
                                        {errors.email && (
                                            <span className="text-red-600 text-sm flex items-center gap-1">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                {errors.email}
                                            </span>
                                        )}
                                    </div>
                                    {/*cajon de contraseñas  */}
                                    <div className="w-full space-y-1 relative">
                                        <label
                                            htmlFor="password"
                                            className="text-sm font-medium text-gray-700"
                                        >
                                            Contraseña
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                id="password"
                                                name="password"
                                                placeholder="Mínimo 5 caracteres, 1 mayúscula, 1 número y 1 carácter especial"
                                                value={form.password}
                                                onChange={handleInput}
                                                className={`w-full px-4 py-3 border rounded-lg transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10 ${errors.password
                                                    ? "border-red-500 ring-2 ring-red-200"
                                                    : "border-gray-300"
                                                    }`}
                                                required
                                                autoComplete="new-password"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                onClick={() => setShowPassword(!showPassword)}
                                                aria-label={
                                                    showPassword
                                                        ? "Ocultar contraseña"
                                                        : "Mostrar contraseña"
                                                }
                                            >
                                                {showPassword ? (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-5 w-5 text-gray-500"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                ) : (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-5 w-5 text-gray-500"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                                                            clipRule="evenodd"
                                                        />
                                                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <span className="text-red-600 text-sm flex items-center gap-1">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                {errors.password}
                                            </span>
                                        )}
                                        {form.password && !errors.password && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                <p>Requisitos de contraseña:</p>
                                                <ul className="list-disc pl-5">
                                                    <li
                                                        className={
                                                            form.password.length >= 5
                                                                ? "text-green-500"
                                                                : ""
                                                        }
                                                    >
                                                        Al menos 5 caracteres{" "}
                                                        {form.password.length >= 5 ? "✓" : ""}
                                                    </li>
                                                    <li
                                                        className={
                                                            /[A-Z]/.test(form.password)
                                                                ? "text-green-500"
                                                                : ""
                                                        }
                                                    >
                                                        Al menos una mayúscula{" "}
                                                        {/[A-Z]/.test(form.password) ? "✓" : ""}
                                                    </li>
                                                    <li
                                                        className={
                                                            /\d/.test(form.password) ? "text-green-500" : ""
                                                        }
                                                    >
                                                        Al menos un número{" "}
                                                        {/\d/.test(form.password) ? "✓" : ""}
                                                    </li>
                                                    <li
                                                        className={
                                                            /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(
                                                                form.password
                                                            )
                                                                ? "text-green-500"
                                                                : ""
                                                        }
                                                    >
                                                        Al menos un carácter especial{" "}
                                                        {/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(
                                                            form.password
                                                        )
                                                            ? "✓"
                                                            : ""}
                                                    </li>
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {opcion === "curso" && (
                                <div className="w-full space-y-1">
                                    <label
                                        htmlFor="nombre_curso"
                                        className="text-sm font-medium text-gray-700"
                                    >
                                        Nombre del curso
                                    </label>
                                    <input
                                        type="text"
                                        id="nombre_curso"
                                        name="nombre_curso"
                                        placeholder="Ej: Matemáticas Avanzadas"
                                        value={form.nombre_curso}
                                        onChange={handleInput}
                                        className={`w-full px-4 py-3 border rounded-lg transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.nombre_curso
                                            ? "border-red-500 ring-2 ring-red-200"
                                            : "border-gray-300"
                                            }`}
                                        required
                                    />
                                    {errors.nombre_curso && (
                                        <span className="text-red-600 text-sm flex items-center gap-1">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            {errors.nombre_curso}
                                        </span>
                                    )}
                                </div>
                            )}

                            <motion.button
                                type="submit"
                                className={`w-full px-6 py-3 rounded-lg font-semibold transition-all mt-4 flex items-center justify-center gap-2 ${loading
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                                    }`}
                                disabled={loading}
                                whileHover={!loading ? { scale: 1.02 } : {}}
                                whileTap={!loading ? { scale: 0.98 } : {}}
                            >
                                {loading ? (
                                    <>
                                        <svg
                                            className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
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
                                    </>
                                ) : (
                                    <>
                                        {opcion === "curso" ? (
                                            <>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                Crear Curso
                                            </>
                                        ) : (
                                            <>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
                                                </svg>
                                                Crear{" "}
                                                {opcion === "estudiante" ? "Estudiante" : "Docente"}
                                            </>
                                        )}
                                    </>
                                )}
                            </motion.button>
                        </motion.form>
                    </AnimatePresence>
                </motion.div>
            </main>

            <DarkModeToggle />

            <Footer />
        </div>
    );
}