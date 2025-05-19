import { useState, useEffect, ChangeEvent, } from 'react';
import { Doughnut, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useAuthStore } from '../stores/Autenticacion';
import { useDarkMode } from '../hooks/useDarkMode';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

interface Curso {
  id: number;
  nombre: string;
}
interface Calificacion {
  criterio: string;
  valor: number;
}
interface DocenteConCursos {
  id: number;
  docente_id: number;
  nombre: string;
  cursos: Curso[];
}
interface Comentario {
  sentimiento: 'positivo' | 'neutral' | 'negativo';
  texto: string;
  tipo: 'docente' | 'curso';
}
interface Evaluacion {
  id: number;
  comentarios: Comentario[];
  fecha: string;
  sentimiento_docente: 'positivo' | 'neutral' | 'negativo';
  sentimiento_curso: 'positivo' | 'neutral' | 'negativo';
  calificaciones: Calificacion[];
}

const cursoLabels = ['Metodología', 'Material Didáctico', 'Claridad', 'Retroalimentación'];
const cursoKeys = ['metodologia', 'material_didactico', 'claridad', 'retroalimentacion'];
const docenteLabels = ['Satisfacción General', 'Comunicación', 'Puntualidad', 'Respeto', 'Disponibilidad'];
const docenteKeys = ['satisfaccion_general', 'comunicacion', 'puntualidad', 'respeto', 'disponibilidad'];

export default function Administrador() {
  const [docentesConCursos, setDocentesConCursos] = useState<DocenteConCursos[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [mostrarEvaluaciones, setMostrarEvaluaciones] = useState(false);
  const [filtroDocente, setFiltroDocente] = useState<'todos' | 'positivo' | 'neutral' | 'negativo'>('todos');
  const [filtroCurso, setFiltroCurso] = useState<'todos' | 'positivo' | 'neutral' | 'negativo'>('todos');
  const { isDarkMode } = useDarkMode();
  const { token } = useAuthStore();

  // 1) Traer lista de TODOS los docentes con sus cursos
  useEffect(() => {
    async function fetchDocentesConCursos() {
      try {
        const res = await fetch(
          'http://localhost:5000/api/evaluaciones/docentes-con-cursos',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error('Error al cargar docentes con cursos');
        const data: DocenteConCursos[] = await res.json();
        setDocentesConCursos(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchDocentesConCursos();
  }, [token]);

  const obtenerEvaluaciones = async () => {
    if (!selectedTeacher || !selectedCourse) {
      console.error("Docente o curso no seleccionados");
      return;
    }
    try {
      // Encuentra el docente y curso seleccionados para obtener sus IDs
      const docente = docentesConCursos.find(d => d.nombre === selectedTeacher);
      const curso = docente?.cursos.find(c => c.nombre === selectedCourse);

      if (!docente || !curso) {
        console.error("Docente o curso no encontrados");
        return;
      }

      // Ajustar la URL a la nueva estructura
      const res = await fetch(
        `http://localhost:5000/api/evaluaciones/docente/${docente.docente_id}/curso/${curso.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error('Error al cargar evaluaciones');
      const data: Evaluacion[] = await res.json();

      setEvaluaciones(data);
      setMostrarEvaluaciones(true);
    } catch (error) {
      console.error("Error al obtener evaluaciones:", error);
      setEvaluaciones([]);
      setMostrarEvaluaciones(false);
    }
  };

  // 4) Calcular promedios
  const calcularPromedios = (keys: string[]): number[] => {
    if (!evaluaciones.length) return keys.map(() => 0);

    return keys.map(key => {
      const suma = evaluaciones.reduce((sum, ev) => {
        const calificacion = ev.calificaciones.find(c => c.criterio === key);
        return sum + (calificacion ? calificacion.valor : 0);
      }, 0);

      return parseFloat((suma / evaluaciones.length).toFixed(1));
    });
  };

  // 5) Filtrar comentarios
  const filtrarComentarios = (tipo: 'docente' | 'curso', filtro: string) =>
    evaluaciones
      .flatMap(ev => ev.comentarios.filter(com => com.tipo === tipo))
      .filter(com => (filtro === 'todos' ? true : com.sentimiento === filtro));

  const sentimientosDocente = evaluaciones.reduce(
    (acc, ev) => {
      ev.comentarios
        .filter(com => com.tipo === 'docente')
        .forEach(com => {
          acc[com.sentimiento]++;
        });
      return acc;
    },
    { positivo: 0, neutral: 0, negativo: 0 }
  );

  const sentimientosCurso = evaluaciones.reduce(
    (acc, ev) => {
      ev.comentarios
        .filter(com => com.tipo === 'curso')
        .forEach(com => {
          acc[com.sentimiento]++;
        });
      return acc;
    },
    { positivo: 0, neutral: 0, negativo: 0 }
  );

  const cursoPromedios = calcularPromedios(cursoKeys);
  const docentePromedios = calcularPromedios(docenteKeys);

  const barData = {
    labels: [...cursoLabels, ...docenteLabels],
    datasets: [
      {
        label: 'Promedio',
        data: [...cursoPromedios, ...docentePromedios],
        backgroundColor: 'rgba(54,162,235,0.6)',
        borderColor: 'rgba(54,162,235,1)',
        borderWidth: 1,
      },
    ],
  };

  const donutOptions = {
    responsive: true,
    plugins: { legend: { position: 'bottom' as const } },
    cutout: '70%',
  };

  // Datos para las gráficas de Pie
  const pieDataDocente = {
    labels: ['Positivos', 'Neutrales', 'Negativos'],
    datasets: [
      {
        data: [sentimientosDocente.positivo, sentimientosDocente.neutral, sentimientosDocente.negativo],
        backgroundColor: ['#4CAF50', '#FFEB3B', '#F44336'],
      },
    ],
  };

  const pieDataCurso = {
    labels: ['Positivos', 'Neutrales', 'Negativos'],
    datasets: [
      {
        data: [sentimientosCurso.positivo, sentimientosCurso.neutral, sentimientosCurso.negativo],
        backgroundColor: ['#4CAF50', '#FFEB3B', '#F44336'],
      },
    ],
  };

  // Datos para las gráficas de barras horizontales
  const barDataDocente = {
    labels: ['Positivo', 'Neutral', 'Negativo'],
    datasets: [
      {
        label: '%',
        data: [
          Math.round((sentimientosDocente.positivo * 100) / evaluaciones.length),
          Math.round((sentimientosDocente.neutral * 100) / evaluaciones.length),
          Math.round((sentimientosDocente.negativo * 100) / evaluaciones.length),
        ],
        backgroundColor: ['#4CAF50', '#FFEB3B', '#F44336'],
        barThickness: 20,
      },
    ],
  };

  const barDataCurso = {
    labels: ['Positivo', 'Neutral', 'Negativo'],
    datasets: [
      {
        label: '%',
        data: [
          Math.round((sentimientosCurso.positivo * 100) / evaluaciones.length),
          Math.round((sentimientosCurso.neutral * 100) / evaluaciones.length),
          Math.round((sentimientosCurso.negativo * 100) / evaluaciones.length),
        ],
        backgroundColor: ['#4CAF50', '#FFEB3B', '#F44336'],
        barThickness: 20,
      },
    ],
  };

  // Descargar Excel global
  const descargarExcelAdmin = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/reportes/admin/excel', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al generar Excel');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reporte_admin_evaluaciones.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('No se pudo descargar el Excel');
    }
  };

  // Descargar PDF específico
  const descargarPDF = () => {
    if (!selectedTeacher || !selectedCourse) {
      return alert('Seleccione un curso primero.');
    }

    // Encuentra el docente y curso seleccionados para obtener sus IDs
    const docente = docentesConCursos.find(d => d.nombre === selectedTeacher);
    const curso = docente?.cursos.find(c => c.nombre === selectedCourse);

    if (!docente || !curso) {
      return alert('Docente o curso no encontrados.');
    }

    fetch(
      `http://localhost:5000/api/reportes/docente/${docente.docente_id}/curso/${curso.id}/pdf`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
      .then(res => {
        if (!res.ok) throw new Error('Error al generar el PDF');
        return res.blob();
      })
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_docente_${docente.nombre}_curso_${curso.nombre}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      })
      .catch(err => {
        console.error(err);
        alert('No se pudo descargar el informe. Intente de nuevo más tarde.');
      });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Contenido principal */}

      <div className="p-6">
        {/* Introducción */}
        <div
          className={`
          relative z-20 w-full max-w-3xl mx-auto text-center
            bg-gradient-to-br from-blue-200 via-white to-blue-100
            border border-blue-300 rounded-2xl shadow-xl p-6 mt-10
            transition-all duration-800 hover:shadow-blue-200 hover:scale-[2.01] animate-fade-in
          ${isDarkMode
              ? "bg-gray-900 border-gray-700 text-blue-900"
              : "text-blue-900"
            }
        `}
        >
          <h2 className="mb-2 text-4xl font-bold text-blue-800">
            Evaluaciones Docentes
          </h2>
          <p className="text-xl text-gray-700">
            Bienvenido al panel de administración del sistema de evaluación
            docente. Aquí podrá visualizar los resultados de las evaluaciones
            realizadas por los estudiantes, incluyendo análisis de comentarios y
            gráficos estadísticos.
          </p>
          <p className="mt-4 text-lg font-semibold text-gray-700">
            Puede descargar un reporte general con todas las evaluaciones
            disponibles hasta la fecha.
          </p>

          <button
            onClick={descargarExcelAdmin}
            className="px-6 py-3 mt-6 text-white transition bg-green-600 rounded-md shadow hover:bg-green-700"
          >
            Descargar Excel
          </button>
        </div>

        {/* Selección de docente y curso */}
        <div className={`
          flex flex-col md:flex-row items-stretch justify-center gap-0
          bg-gradient-to-br from-blue-100 via-white to-blue-100
          border border-blue-200 rounded-3xl shadow-lg p-4 mb-8 mt-12
          transition-all duration-300 hover:shadow-blue-200 hover:scale-[1.01] animate-fade-in
          ${isDarkMode ? "bg-gray-800 border-gray-700 shadow-gray-900" : "shadow-blue-200 shadow-lg"}
        `}
        >
          <label
            className={`block font-semibold mb-1 ${isDarkMode ? "text-gray-600" : "text-gray-500"
              }`}
          >
            Docente:
          </label>
          <select
            value={selectedTeacher}
            onChange={(e) => {
              setSelectedTeacher(e.target.value);
              setSelectedCourse("");
              setMostrarEvaluaciones(false);
            }}
            className={`
            w-full border rounded-3xl px-3 py-2 font-medium cursor-pointer
            transition-all duration-200
            hover:scale-105 focus:scale-100 hover:shadow-lg focus:shadow-lg text-xl
            ${isDarkMode
                ? "bg-gray-800 border-white text-white placeholder-gray-400 shadow-gray-800 shadow-lg"
                : "bg-white border-blue-300 text-blue-900 placeholder-gray-500 shadow-blue-200 shadow-lg"
              }
          `}
          >
            <option value="">Seleccione un docente</option>
            {docentesConCursos.map((docente) => (
              <option key={docente.docente_id} value={docente.nombre}>
                {docente.nombre}
              </option>
            ))}
          </select>
        </div>

        {selectedTeacher && (
          <div
            className={`
          flex flex-col md:flex-row items-stretch justify-center gap-0
          bg-gradient-to-br from-blue-100 via-white to-blue-100
          border border-blue-200 rounded-3xl shadow-lg p-4 mb-8
          transition-all duration-300 hover:shadow-blue-200 hover:scale-[1.01] animate-fade-in
          ${isDarkMode
                ? "bg-gray-800 border-gray-700 shadow-gray-900"
                : "shadow-blue-200 shadow-lg"
              }
        `}
          >
            <label
              className={`block font-semibold mb-1 ${isDarkMode ? "text-gray-600" : "text-gray-500"
                }`}
            >
              Curso:
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className={`
            w-full border rounded-3xl px-3 py-2 font-medium cursor-pointer
            transition-all duration-200
            hover:scale-105 focus:scale-100 hover:shadow-lg focus:shadow-lg text-xl
            ${isDarkMode
                  ? "bg-gray-800 border-white text-white placeholder-gray-400 shadow-gray-800 shadow-lg"
                  : "bg-white border-blue-300 text-blue-900 placeholder-gray-500 shadow-blue-200 shadow-lg"
                }
          `}
            >
              <option value="">Seleccione un curso</option>
              {docentesConCursos
                .find((d) => d.nombre === selectedTeacher)
                ?.cursos.map((curso) => (
                  <option key={curso.id} value={curso.nombre}>
                    {curso.nombre}
                  </option>
                ))}
            </select>
          </div>
        )}

        {selectedTeacher && selectedCourse && (
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            <button
              onClick={obtenerEvaluaciones}
              className={`
            px-4 py-2 text-xl rounded-3xl font-semibold shadow-lg
            transition-all duration-200
            hover:scale-110 focus:scale-110 hover:shadow-xl focus:shadow-xl
            ${isDarkMode
                  ? "bg-blue-700 text-white hover:bg-blue-800"
                  : "bg-blue-600 text-white hover:bg-blue-700"
                }
          `}
            >
              Ver Evaluaciones
            </button>
            <button
              onClick={descargarPDF}
              className={`
              px-4 py-2 text-xl rounded-3xl font-semibold shadow-lg
              transition-all duration-200
              hover:scale-110 focus:scale-110 hover:shadow-xl focus:shadow-xl
              ${isDarkMode
                  ? "bg-red-700 text-white hover:bg-red-800"
                  : "bg-red-600 text-white hover:bg-red-700"
                }
            `}
            >
              Descargar PDF
            </button>
          </div>
        )}

        {/* Gráfico Aspectos dl curso*/}
        {mostrarEvaluaciones && evaluaciones.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-3">
              {/* Contenedor 1: Aspectos del Curso */}
              <div className={`rounded-3xl p-4 h-[350px] flex justify-center items-center overflow-hidden transition-all duration-300 hover:scale-105 focus:scale-105 bg-gradient-to-br from-blue-200 via-white to-blue-200
              border border-blue-300 shadow-blue-200 shadow-lg
                  ${isDarkMode
                  ? "bg-gray-900 border-blue-500 text-blue-900"
                  : "text-blue-900"
                }
              `}
              >
                <div className="flex flex-col items-center justify-center w-full">
                  <h3 className="mb-0 text-xl font-semibold text-center md:text-xl ">
                    Aspectos del Curso
                  </h3>
                  <div className="w-[140%] h-[300px] md:h-[300px] flex justify-center items-center">
                    <Doughnut
                      data={{
                        labels: cursoLabels,
                        datasets: [
                          {
                            data: cursoPromedios,
                            backgroundColor: [
                              "#36A2EB",
                              "#4BC0C0",
                              "#9966FF",
                              "#FF9F40",
                            ],
                          },
                        ],
                      }}
                      options={donutOptions}
                    />
                  </div>
                </div>
              </div>

              {/* Contenedor 2: Aspectos del Docente */}
              <div className="bg-white rounded shadow p-4 h-[350px] flex justify-center items-center overflow-hidden">
                <div className="flex flex-col items-center justify-center w-full">
                  <h3 className="text-center font-semibold md:mb-[0px] text-xl md:text-xl">
                    Aspectos del Docente
                  </h3>
                  <div className="w-[140%] h-[300px] md:h-[300px] flex justify-center items-center">
                    <Doughnut
                      data={{
                        labels: docenteLabels,
                        datasets: [
                          {
                            data: docentePromedios,
                            backgroundColor: [
                              "#FF6384",
                              "#FFCD56",
                              "#4BC0C0",
                              "#36A2EB",
                              "#9966FF",
                            ],
                          },
                        ],
                      }}
                      options={donutOptions}
                    />
                  </div>
                </div>
              </div>

              {/* Contenedor 3: Comparación de Promedios */}
              <div className="bg-white rounded shadow p-4 h-[350px] flex justify-center items-center overflow-hidden">
                <div className="w-full ">
                  <div>
                    <h3 className="mb-0 text-xl font-semibold text-center md:text-xl">
                      Comparación de Promedios
                    </h3>
                  </div>
                  <div className="w-[102%] h-[300px] md:h-[300px] flex justify-center items-center">
                    <Bar
                      data={barData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Gráficas de sentimientos y comentarios */}
            <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-2">
              {/* Gráfica de sentimientos del docente */}
              <div className="bg-white rounded shadow p-4 h-[400px] flex flex-col justify-center items-center overflow-hidden">
                <h4 className="mb-4 text-lg font-semibold text-center md:text-xl">
                  Sentimientos Comentarios al Docente
                </h4>
                <div className="w-[110%] h-[250px] md:h-[300px]">
                  <Pie
                    data={pieDataDocente}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: "bottom" } },
                    }}
                  />
                </div>
                <div className="w-[100%] h-[200px] md:h-[250px] mt-4">
                  <Bar
                    data={barDataDocente}
                    options={{
                      indexAxis: "y",
                      maintainAspectRatio: false,
                      scales: {
                        x: {
                          max: 100,
                          title: { display: true, text: "Porcentaje (%)" },
                        },
                      },
                      plugins: { legend: { display: false } },
                    }}
                  />
                </div>
              </div>

              {/* Gráfica de sentimientos del curso */}
              <div className="bg-white rounded shadow p-4 h-[400px] flex flex-col justify-center items-center overflow-hidden">
                <h4 className="mb-4 text-lg font-semibold text-center md:text-xl">
                  Sentimientos Comentarios del Curso
                </h4>
                <div className="w-[110%] h-[250px] md:h-[300px]">
                  <Pie
                    data={pieDataCurso}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: "bottom" } },
                    }}
                  />
                </div>
                <div className="w-[100%] h-[200px] md:h-[250px] mt-4">
                  <Bar
                    data={barDataCurso}
                    options={{
                      indexAxis: "y",
                      maintainAspectRatio: false,
                      scales: {
                        x: {
                          max: 100,
                          title: { display: true, text: "Porcentaje (%)" },
                        },
                      },
                      plugins: { legend: { display: false } },
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Listado de comentarios */}
            <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-2">
              {/* Comentarios del docente */}
              <div className="p-4 rounded bg-blue-50">
                <div className="flex justify-between mb-2">
                  <h5 className="font-semibold">Comentarios del Docente</h5>
                  <select
                    className="px-2 py-1 border rounded"
                    value={filtroDocente}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                      setFiltroDocente(
                        e.target.value as
                        | "todos"
                        | "positivo"
                        | "neutral"
                        | "negativo"
                      )
                    }
                  >
                    <option value="todos">Todos</option>
                    <option value="positivo">Positivos</option>
                    <option value="neutral">Neutrales</option>
                    <option value="negativo">Negativos</option>
                  </select>
                </div>
                <div className="space-y-3 overflow-auto max-h-64">
                  {filtrarComentarios("docente", filtroDocente).map(
                    (com, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded ${com.sentimiento === "positivo"
                          ? "bg-green-50"
                          : com.sentimiento === "neutral"
                            ? "bg-yellow-50"
                            : "bg-red-50"
                          }`}
                      >
                        <p>{com.texto}</p>
                        <small className="text-gray-600">
                          Sentimiento: {com.sentimiento}
                        </small>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Comentarios del curso */}
              <div className="p-4 rounded bg-blue-50">
                <div className="flex justify-between mb-2">
                  <h5 className="font-semibold">Comentarios del Curso</h5>
                  <select
                    className="px-2 py-1 border rounded"
                    value={filtroCurso}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                      setFiltroCurso(
                        e.target.value as
                        | "todos"
                        | "positivo"
                        | "neutral"
                        | "negativo"
                      )
                    }
                  >
                    <option value="todos">Todos</option>
                    <option value="positivo">Positivos</option>
                    <option value="neutral">Neutrales</option>
                    <option value="negativo">Negativos</option>
                  </select>
                </div>
                <div className="space-y-3 overflow-auto max-h-64">
                  {filtrarComentarios("curso", filtroCurso).map((com, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded ${com.sentimiento === "positivo"
                        ? "bg-green-50"
                        : com.sentimiento === "neutral"
                          ? "bg-yellow-50"
                          : "bg-red-50"
                        }`}
                    >
                      <p>{com.texto}</p>
                      <small className="text-gray-600">
                        Sentimiento: {com.sentimiento}
                      </small>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
        <ToastContainer />
      </div>
    </div>
  );
}
