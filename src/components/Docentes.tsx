import { useState, useEffect, ChangeEvent } from 'react';
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
// import { FaSyncAlt } from 'react-icons/fa'; // Importa el ícono de recargar
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

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
  calificaciones: { criterio: string; valor: number }[];
}

const cursoLabels = ['Metodología', 'Material Didáctico', 'Claridad', 'Retroalimentación'];
const cursoKeys = ['metodologia', 'material_didactico', 'claridad', 'retroalimentacion'];

const docenteLabels = ['Satisfacción General', 'Comunicación', 'Puntualidad', 'Respeto', 'Disponibilidad'];
const docenteKeys = ['satisfaccion_general', 'comunicacion', 'puntualidad', 'respeto', 'disponibilidad'];

export default function Docentes() {
  const { user, token: token } = useAuthStore();           // user.name, user.id
  const { isDarkMode } = useDarkMode();

  const [cursos, setCursos] = useState<Curso[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [mostrarEvaluaciones, setMostrarEvaluaciones] = useState(false);
  const [filtroDocente, setFiltroDocente] = useState<'todos' | 'positivo' | 'neutral' | 'negativo'>('todos');
  const [filtroCurso, setFiltroCurso] = useState<'todos' | 'positivo' | 'neutral' | 'negativo'>('todos');
  // Estado para manejar la animación de clic
  // const [isReloading, setIsReloading] = useState(false);

  // Carga los cursos del docente autenticado
  // Modificación del useEffect que carga los cursos
  useEffect(() => {
    if (!user) return;



    fetch(`http://localhost:5000/api/docentes/${user.id}/cursos`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar cursos');
        return res.json();
      })
      .then((data: Curso[]) => {
        console.log('Cargando cursos...', {
          toastId: 'loading-courses'
        });

        setCursos(data);
      })
      .catch(err => {
        console.error('Error al obtener cursos:', err);

        setCursos([]);
      });
  }, [user, token]);

  // Obtiene evaluaciones para el curso seleccionado
  const obtenerEvaluaciones = () => {
    if (!user) {
      toast.error('No se pudo identificar al docente', {
        toastId: 'user-not-found'
      });
      return;
    }

    if (!selectedCourseId) {
      console.log('Por favor selecciona un curso primero', {
        toastId: 'select-course-warning'
      });
      return;
    }

    const loadingToast = toast.loading('Cargando evaluaciones...', {
      toastId: 'loading-evaluations'
    });

    fetch(
      `http://localhost:5000/api/evaluaciones/docente/${user.id}/curso/${selectedCourseId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar evaluaciones');
        return res.json();
      })
      .then((data: Evaluacion[]) => {
        if (data.length === 0) {
          toast.update(loadingToast, {
            render: 'No hay evaluaciones para este curso',
            type: 'info',
            isLoading: false,
            autoClose: 3000
          });
        } else {
          toast.update(loadingToast, {
            render: `Se cargaron ${data.length} evaluaciones`,
            type: 'success',
            isLoading: false,
            autoClose: 2000
          });
        }
        setEvaluaciones(data);
        setMostrarEvaluaciones(data.length > 0);
      })
      .catch(err => {
        console.error('Error al obtener evaluaciones:', err);
        toast.update(loadingToast, {
          render: 'Error al cargar evaluaciones',
          type: 'error',
          isLoading: false,
          autoClose: 3000
        });
        setEvaluaciones([]);
        setMostrarEvaluaciones(false);
      });
  };


  // Mapeo de texto a valor numérico
  const mapCalificaciones = (califs: { criterio: string; valor: number }[]) =>
    califs.reduce<Record<string, number>>((acc, c) => {
      acc[c.criterio] = c.valor;
      return acc;
    }, {});

  const calcularPromedios = (keys: string[]) => {
    if (!evaluaciones.length) return keys.map(() => 0);
    return keys.map(key => {
      const suma = evaluaciones.reduce(
        (acc, ev) => acc + (mapCalificaciones(ev.calificaciones)[key] || 0),
        0
      );
      return parseFloat((suma / evaluaciones.length).toFixed(1));
    });
  };

  // Filtra comentarios según tipo y sentimiento
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

  // Función descargarPDF corregida
  const descargarPDF = () => {
    if (!user) {
      toast.error('No se pudo identificar al docente', {
        toastId: 'user-not-found-pdf'
      });
      return;
    }

    if (!selectedCourseId) {
      toast.warning('Por favor selecciona un curso antes de descargar', {
        toastId: 'no-course-selected'
      });
      return;
    }

    const loadingToast = toast.loading('Generando PDF...', {
      toastId: 'generating-pdf'
    });

    fetch(
      `http://localhost:5000/api/reportes/docente/${user.id}/curso/${selectedCourseId}/pdf`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )
      .then(async res => {
        if (!res.ok) {
          const error = await res.json().catch(() => ({}));
          throw new Error(error.message || "No hay evaluaciones disponibles");
        }
        return res.blob();
      })
      .then(blob => {
        toast.update(loadingToast, {
          render: 'PDF generado correctamente',
          type: 'success',
          isLoading: false,
          autoClose: 2000
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_${user.username}_${selectedCourseId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      })
      .catch(err => {
        console.error('Error al descargar PDF:', err);
        toast.update(loadingToast, {
          render: err.message || 'Error al generar el PDF',
          type: 'error',
          isLoading: false,
          autoClose: 3000
        });
      });
  };

  // Preparación de datos para gráficos
  const cursoPromedios = calcularPromedios(cursoKeys);
  const docentePromedios = calcularPromedios(docenteKeys);

  const barData = {
    labels: [...cursoLabels, ...docenteLabels],
    datasets: [{
      label: 'Promedio',
      data: [...cursoPromedios, ...docentePromedios],
      backgroundColor: 'rgba(54,162,235,0.6)',
      borderColor: 'rgba(54,162,235,1)',
      borderWidth: 1,
    }],
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

  {/* // Nueva función para recargar los datos */ }

  // const handleRecargarDatos = () => {
  //   setIsReloading(true); // Activa la animación
  //   recargarDatos(); // Llama a la función para recargar los datos
  //   setTimeout(() => setIsReloading(false), 1000); // Desactiva la animación después de 1 segundo
  // };

  // const recargarDatos = () => {
  //   if (!user) return;

  //   // Recargar cursos
  //   fetch(`http://localhost:5000/api/docentes/${user.id}/cursos`, {
  //     headers: { Authorization: `Bearer ${token}` },
  //   })
  //     .then((res) => {
  //       if (!res.ok) throw new Error('Error al cargar cursos');
  //       return res.json();
  //     })
  //     .then((data: Curso[]) => {
  //       setCursos(data);
  //     })
  //     .catch((err) => {
  //       console.error('Error al obtener cursos:', err);
  //       setCursos([]);
  //     });

  //   // // Recargar evaluaciones si hay un curso seleccionado
  //   if (selectedCourseId) {
  //     fetch(
  //       `http://localhost:5000/api/evaluaciones/docente/${user.id}/curso/${selectedCourseId}`,
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     )
  //       .then((res) => {
  //         if (!res.ok) throw new Error('Error al cargar evaluaciones');
  //         return res.json();
  //       })
  //       .then((data: Evaluacion[]) => {
  //         setEvaluaciones(data);
  //         setMostrarEvaluaciones(true);
  //       })
  //       .catch((err) => {
  //         console.error('Error al obtener evaluaciones:', err);
  //         setEvaluaciones([]);
  //         setMostrarEvaluaciones(false);
  //       });
  //   }
  // };

  return (
    <div className="p-4 space-y-6 rounded-3xl ">
      {/* Selector de curso */}
      <div
        className={`
          flex flex-col md:flex-row items-center justify-between gap-4
          bg-gradient-to-br from-blue-100 via-white to-blue-100
          border border-blue-200 rounded-3xl shadow-lg p-4 mb-8
          transition-all duration-300 hover:shadow-blue-200 hover:scale-105 
          ${isDarkMode
            ? "bg-gray-800 border-gray-700 shadow-gray-900"
            : "shadow-blue-200 shadow-lg"
          }
        `}
      >
        <div className="flex-1">
          <label
            htmlFor="courseSelect"
            className={`block text-xl font-medium mb-1 ${isDarkMode ? "text-gray-600" : "text-gray-500"
              }`}
          >
            Seleccione un curso:
          </label>
          <select
            className={`
              w-full border rounded-3xl px-3 py-2 font-medium cursor-pointer
              transition-all duration-200
              hover:shadow-lg focus:shadow-lg text-xl
              ${isDarkMode
                ? "bg-gray-800 border-white text-white placeholder-gray-400 shadow-gray-800 shadow-lg"
                : "bg-white border-blue-300 text-blue-900 placeholder-gray-500 shadow-blue-200 shadow-lg"
              }
            `}
            value={selectedCourseId}
            onClick={obtenerEvaluaciones}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => {
              setSelectedCourseId(e.target.value);
              setMostrarEvaluaciones(false);
              if (e.target.value) {
                setTimeout(() => {
                  obtenerEvaluaciones();
                }, 0);
              }
            }}
          >
            <option
              value=""
              className="text-xl rounded-lg font-semibold text-gray-600"
            >
              Elija un curso, para ver sus evaluaciones 😉
            </option>
            {cursos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={descargarPDF}
          disabled={!selectedCourseId}
          className={`
            flex items-center text-center justify-center w-full md:w-auto px-6 py-2.5 text-xl rounded-3xl font-semibold shadow-lg mt-2 md:mt-8
            transition-all duration-200
            hover:shadow-xl focus:shadow-xl
            ${!selectedCourseId
              ? isDarkMode
                ? "bg-gray-900 text-gray-100 opacity-20 cursor-not-allowed"
                : "bg-gray-900 text-gray-100 opacity-20 cursor-not-allowed"
              : isDarkMode
                ? "bg-red-700 text-white hover:bg-red-800 shadow-gray-800"
                : "bg-red-600 text-white hover:bg-red-700 shadow-gray-500"
            }
          `}
        >
          <ArrowDownTrayIcon className="w-7 h-7 mr-2" />
          Descargar PDF
        </button>
      </div>

      {/* Gráficos principales */}
      {mostrarEvaluaciones && evaluaciones.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Contenedor 1: Aspectos del Curso */}

            <div
              className={`rounded-3xl p-4 h-[350px] flex justify-center items-center overflow-hidden transition-all duration-300 hover:scale-105 focus:scale-105 bg-gradient-to-br from-blue-200 via-white to-blue-200
          border border-blue-300 shadow-blue-200 shadow-lg
            ${isDarkMode
                  ? "bg-gray-900 border-blue-500 text-blue-900"
                  : "text-blue-900"
                }
          `}
            >
              <div className="flex flex-col items-center justify-center w-full hover:scale-105 focus:scale-105 duration-300">
                <h3 className="mt-4 mb-1 text-2xl font-semibold text-center md:text-2xl ">
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

            <div
              className={`rounded-3xl p-4 h-[350px] flex justify-center items-center overflow-hidden transition-all hover:scale-105 focus:scale-105 duration-300 bg-gradient-to-br from-blue-200 via-white to-blue-200
        border border-blue-300 shadow-blue-200 shadow-lg
            ${isDarkMode
                  ? "bg-gray-900 border-blue-500 text-blue-900"
                  : "text-blue-900"
                }
        `}
            >
              <div className="flex flex-col items-center justify-center w-full hover:scale-105 focus:scale-105 duration-300">
                <h3 className="mt-4 mb-1 text-2xl font-semibold text-center md:text-2xl ">
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
            <div
              className={`bg-white rounded-3xl p-4 h-[350px] flex justify-center items-center overflow-hidden hover:scale-105 focus:scale-105 duration-300
          bg-gradient-to-br from-blue-200 via-white to-blue-200
          border border-blue-300 shadow-blue-200 shadow-lg
            ${isDarkMode
                  ? "bg-gray-900 border-blue-500 text-blue-900"
                  : "text-blue-900"
                }
          `}
            >
              <div className="w-full hover:scale-105 focus:scale-105 duration-300">
                <div>
                  <h3 className="mt-2 mb-0 text-2xl font-semibold text-center md:text-2xl ">
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
          {mostrarEvaluaciones && evaluaciones.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 ">
                {/* Gráfica de sentimientos del docente */}
                <div
                  className={`bg-white rounded-3xl p-4 h-[400px] flex flex-col justify-center items-center overflow-hidden hover:scale-105 focus:scale-105 duration-300
          bg-gradient-to-br from-blue-200 via-white to-blue-200
          border border-blue-300 shadow-blue-200 shadow-lg
            ${isDarkMode
                      ? "bg-gray-900 border-blue-500 text-blue-900"
                      : "text-blue-900"
                    }
          `}
                >
                  <h4 className="mt-3 mb-1 text-2xl font-semibold text-center md:text-2xl ">
                    Sentimientos Comentarios al Docente
                  </h4>
                  <div className="w-[110%] h-[250px] md:h-[300px]">
                    <Pie
                      data={pieDataDocente}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false, // Permite que la gráfica se adapte al contenedor
                        plugins: { legend: { position: "bottom" } },
                      }}
                    />
                  </div>
                  <div className="w-[100%] h-[200px] md:h-[250px] mt-4">
                    <Bar
                      data={barDataDocente}
                      options={{
                        indexAxis: "y",
                        maintainAspectRatio: false, // Permite que la gráfica se adapte al contenedor
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
                <div
                  className={`bg-white rounded-3xl p-4 h-[400px] flex flex-col justify-center items-center overflow-hidden hover:scale-105 focus:scale-105 duration-300
          bg-gradient-to-br from-blue-200 via-white to-blue-200
          border border-blue-300 shadow-blue-200 shadow-lg
            ${isDarkMode
                      ? "bg-gray-900 border-blue-500 text-blue-900"
                      : "text-blue-900"
                    }
          `}
                >
                  <h4 className="mt-4 mb-1 text-2xl font-semibold text-center md:text-2xl ">
                    Sentimientos Comentarios del Curso
                  </h4>
                  <div className="w-[110%] h-[250px] md:h-[300px]">
                    <Pie
                      data={pieDataCurso}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false, // Permite que la gráfica se adapte al contenedor
                        plugins: { legend: { position: "bottom" } },
                      }}
                    />
                  </div>
                  <div className="w-[100%] h-[200px] md:h-[250px] mt-4">
                    <Bar
                      data={barDataCurso}
                      options={{
                        indexAxis: "y",
                        maintainAspectRatio: false, // Permite que la gráfica se adapte al contenedor
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
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Contenedor independiente para Comentarios del Docente */}
                <div className="group-docente hover:scale-105 focus:scale-105 duration-300">
                  <div
                    className={`p-4 transition-all duration-300 bg-white dark:white rounded-3xl animate-fade-in-docente
            bg-gradient-to-br from-blue-200 via-white to-blue-200
          border border-blue-300 shadow-blue-200 shadow-lg
            ${isDarkMode
                        ? "bg-gray-900 border-blue-500 text-blue-900"
                        : "text-blue-900"
                      }
          `}
                  >
                    <div className="flex justify-between mb-2">
                      <h5 className="text-2xl font-semibold">
                        Comentarios del Docente
                      </h5>
                      <select
                        className={`
                border rounded-2xl px-2 py-2 font-medium cursor-pointer
                transition-all duration-200
                hover:scale-110 focus:scale-110 hover:shadow-lg focus:shadow-lg
                ${isDarkMode
                            ? "bg-gray-700 border-blue-400 text-white"
                            : "bg-white border-blue-300 text-blue-600"
                          }
              `}
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
                    <div className="space-y-3 overflow-auto max-h-72 text-lg">
                      {filtrarComentarios("docente", filtroDocente).map(
                        (com, i) => (
                          <div
                            key={i}
                            className={`p-3 rounded-3xl ${com.sentimiento === "positivo"
                              ? "bg-green-50"
                              : com.sentimiento === "neutral"
                                ? "bg-yellow-50"
                                : "bg-red-50"
                              }`}
                          >
                            <p>{com.texto}</p>
                            <small className="text-gray-600 text-base">
                              Sentimiento: {com.sentimiento}
                            </small>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Contenedor independiente para Comentarios del Curso */}
                <div className="group-curso hover:scale-105 focus:scale-105 duration-300">
                  <div
                    className={`p-4 transition-all duration-300 bg-white dark:bg-white rounded-3xl animate-fade-in-curso
            bg-gradient-to-br from-blue-200 via-white to-blue-200
          border border-blue-300 shadow-blue-200 shadow-lg
            ${isDarkMode
                        ? "bg-gray-900 border-blue-500 text-blue-900"
                        : "text-blue-900"
                      }
          `}
                  >
                    <div className="flex justify-between mb-2">
                      <h5 className="text-2xl font-semibold">
                        Comentarios del Curso
                      </h5>
                      <select
                        className={`
                border rounded-2xl px-2 py-2 font-medium cursor-pointer
                transition-all duration-200
                hover:scale-110 focus:scale-110 hover:shadow-lg focus:shadow-lg
                ${isDarkMode
                            ? "bg-gray-700 border-blue-400 text-white"
                            : "bg-white border-blue-300 text-blue-600"
                          }
              `}
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
                    <div className="space-y-3 overflow-auto max-h-72 text-lg">
                      {filtrarComentarios("curso", filtroCurso).map(
                        (com, i) => (
                          <div
                            key={i}
                            className={`p-3 rounded-3xl ${com.sentimiento === "positivo"
                              ? "bg-green-50"
                              : com.sentimiento === "neutral"
                                ? "bg-yellow-50"
                                : "bg-red-50"
                              }`}
                          >
                            <p>{com.texto}</p>
                            <small className="text-gray-600 text-base">
                              Sentimiento: {com.sentimiento}
                            </small>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}