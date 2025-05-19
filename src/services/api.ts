// import axios from "axios";
// import { Estudiante, Docente, Curso, AsignacionCursoDocente } from "../types";

// // Configuración base de axios
// const api = axios.create({
//   baseURL: "http://127.0.0.1:5000/api/admin",
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Interceptor para manejar tokens de autenticación
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Servicios para estudiantes
// export const estudianteService = {
//   crear: (data: Partial<Estudiante>) => api.post("/crear-estudiante", data),
//   actualizar: (id: number, data: Partial<Estudiante>) =>
//     api.put(`/actualizar-estudiante/${id}`, data),
//   eliminar: (id: number) => api.delete(`/eliminar-estudiante/${id}`),
// };

// // Servicios para docentes
// export const docenteService = {
//   crear: (data: Partial<Docente>) => api.post("/crear-docente", data),
//   actualizar: (id: number, data: Partial<Docente>) =>
//     api.put(`/actualizar-docente/${id}`, data),
//   eliminar: (id: number) => api.delete(`/eliminar-docente/${id}`),
//   listar: () => api.get("/listar-docentes"),
//   listarCursos: (id: number) => api.get(`/cursos-docente/${id}`),
// };

// // Servicios para cursos
// export const cursoService = {
//   crear: (data: Partial<Curso>) => api.post("/crear-curso", data),
//   actualizar: (id: number, data: Partial<Curso>) =>
//     api.put(`/actualizar-curso/${id}`, data),
//   eliminar: (id: number) => api.delete(`/eliminar-curso/${id}`),
//   listar: () => api.get("/listar-cursos"),
// };

// // Servicio para asignar cursos a docentes
// export const asignacionService = {
//   asignarCursosDocente: (data: AsignacionCursoDocente) =>
//     api.post("/asignar-cursos-docente", data),
// };

// export default {
//   estudiante: estudianteService,
//   docente: docenteService,
//   curso: cursoService,
//   asignacion: asignacionService,
// };
