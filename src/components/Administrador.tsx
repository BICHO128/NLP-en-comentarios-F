import { useState, useEffect, ChangeEvent, } from 'react';
// import ModalConfirmarClave from '../components/ModalConfirmarClave'; // la ruta según tu estructura
// import { useNavigate } from 'react-router-dom';
import { Doughnut, Bar, Pie } from 'react-chartjs-2';
import { toast } from "react-toastify"; // Asegúrate de importar toast
import "react-toastify/dist/ReactToastify.css";
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

  // const [modalOpen, setModalOpen] = useState(false);
  // const [rutaDestino, setRutaDestino] = useState<string | null>(null);
  // const navigate = useNavigate();

  // function handleIntentarIr(ruta: string) {
  //   setRutaDestino(ruta);
  //   setModalOpen(true);
  // }

  // // Simulación de validación contra backend
  // async function verificarClaveBackend(clave: string): Promise<boolean> {
  //   // Debes tener el token JWT ya disponible en tu store o contexto
  //   try {
  //     const res = await fetch("http://localhost:5000/api/admin/verificar-password", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         "Authorization": `Bearer ${token}`, // Asegúrate de que el token esté definido
  //       },
  //       body: JSON.stringify({ password: clave }),
  //     });
  //     if (res.status === 200) {
  //       setModalOpen(false);
  //       setTimeout(() => {
  //         if (rutaDestino) navigate(rutaDestino);
  //       }, 150);
  //       return true;
  //     }
  //     return false;
  //   } catch {
  //     return false;
  //   }
  // }


  // 1) Traer lista de TODOS los docentes con sus cursos
  // 4. En el useEffect que carga los docentes:
  useEffect(() => {
    let isMounted = true; // Para evitar memory leaks

    async function fetchDocentesConCursos() {
      try {
        const res = await fetch(
          'http://localhost:5000/api/evaluaciones/docentes-con-cursos',
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!isMounted) return; // Evitar actualizaciones si el componente se desmontó

        if (!res.ok) {
          toast.error('Error al cargar la lista de docentes', {
            toastId: 'load-teachers-error' // ID único
          });
          throw new Error('Error al cargar docentes con cursos');
        }

        const data: DocenteConCursos[] = await res.json();

        if (!isMounted) return;

        if (data.length === 0) {
          toast.info('No hay docentes registrados en el sistema', {
            toastId: 'no-teachers-info' // ID único
          });
        } else {
          console.log('Lista de docentes cargada correctamente', {
            toastId: 'teachers-loaded-success' // ID único
          });
        }

        setDocentesConCursos(data);
      } catch (err) {
        if (!isMounted) return;
        console.error(err);
        toast.error('Error de conexión al cargar docentes', {
          toastId: 'connection-error' // ID único
        });
      }
    }

    fetchDocentesConCursos();

    return () => {
      isMounted = false; // Cleanup para evitar memory leaks
    };
  }, [token]);


  // 2. Corregir la función obtenerEvaluaciones
  const obtenerEvaluaciones = async () => {
    if (!selectedTeacher) {
      toast.warning('Por favor seleccione un docente primero', {
        toastId: 'select-teacher-warning' // ID único para evitar duplicados
      });
      return;
    }

    if (!selectedCourse) {
      // toast.warning('Por favor seleccione un cursosss');
      return;
    }

    try {
      const docente = docentesConCursos.find((d) => d.nombre === selectedTeacher);
      const curso = docente?.cursos.find((c) => c.nombre === selectedCourse);

      if (!docente || !curso) {
        toast.error('Docente o curso no encontrados');
        return;
      }

      console.log('Cargando evaluaciones...', { autoClose: 2000 });

      const res = await fetch(
        `http://localhost:5000/api/evaluaciones/docente/${docente.docente_id}/curso/${curso.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) {
        toast.error('Error al cargar evaluaciones');
        throw new Error("Error al cargar evaluaciones");
      }

      const data: Evaluacion[] = await res.json();

      if (data.length === 0) {
        toast.info("No hay evaluaciones disponibles para este curso", {
          autoClose: 3000,
          className: "bg-blue-100 text-blue-800"
        });
        setMostrarEvaluaciones(false);
      } else {
        setEvaluaciones(data);
        setMostrarEvaluaciones(true);
        console.log(`Se cargaron ${data.length} evaluaciones`, {
          autoClose: 2000
        });
      }
    } catch (error) {
      console.error("Error al obtener evaluaciones:", error);
      setEvaluaciones([]);
      setMostrarEvaluaciones(false);
      toast.error("Error al cargar las evaluaciones. Intente nuevamente.");
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



  // 3. Modificación de la función descargarPDF con más feedback
  const descargarPDF = async () => {
    if (!selectedTeacher) {
      toast.warning('Debe seleccionar un docente primero', {
        position: 'top-right',
        toastId: 'select-teacher-pdf' // ID único
      });
      return;
    }

    // Encuentra el docente y curso seleccionados para obtener sus IDs
    const docente = docentesConCursos.find(d => d.nombre === selectedTeacher);
    const curso = docente?.cursos.find(c => c.nombre === selectedCourse);

    if (!docente || !curso) {
      toast.error("Debes seleccionar un curso para descargar el PDF");
      return;
    }

    const loadingToast = toast.loading('Generando PDF, por favor espere...', {
      position: 'top-right'
    });

    try {
      const res = await fetch(
        `http://localhost:5000/api/reportes/docente/${docente.docente_id}/curso/${curso.id}/pdf`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) {
        throw new Error('Error al generar el PDF');
      }

      const blob = await res.blob();

      toast.update(loadingToast, {
        render: 'PDF generado correctamente',
        type: 'success',
        isLoading: false,
        autoClose: 2000
      });

      setTimeout(() => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_${docente.nombre}_${curso.nombre}.pdf`.replace(/\s+/g, '_');
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }, 500);
    } catch (error) {
      toast.update(loadingToast, {
        render: "No se pudo descargar el PDF, no tiene evalaciones",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      console.error('Error al descargar PDF:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">

      {/* Contenido principal */}
      <div className='p-6'>

        {/* Selección de docente */}
        <div
          className={`
          flex flex-col md:flex-1 items-stretch justify-center gap-0
          bg-gradient-to-br from-blue-100 via-white to-blue-100
          border border-blue-200 rounded-3xl shadow-lg p-4 mb-8 mt-12
          transition-all duration-300 hover:shadow-blue-200 hover:scale-105
          ${isDarkMode
              ? "bg-gray-800 border-gray-700 shadow-gray-900"
              : "shadow-blue-200 shadow-lg"
            }
        `}
        >
          <label
            className={`block font-semibold mb-1 text-xl ${isDarkMode ? "text-gray-600" : "text-gray-500"
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
            hover:shadow-lg focus:shadow-lg text-xl
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

        {/* Selección de curso */}
        {selectedTeacher && (
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
            <div className="flex-1 w-full">
              <label
                className={`block font-semibold mb-1 text-xl ${isDarkMode ? "text-gray-600" : "text-gray-500"
                  }`}
              >
                Curso:
              </label>
              <select
                value={selectedCourse}
                onClick={obtenerEvaluaciones}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className={`
                  w-full border rounded-3xl px-3 py-2 font-medium cursor-pointer
                  transition-all duration-200
                  hover:shadow-lg focus:shadow-lg text-xl
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

            <button
              onClick={descargarPDF}
              disabled={!selectedCourse}
              className={`
            flex items-center text-center justify-center w-full md:w-auto px-6 py-2.5 text-xl rounded-3xl font-semibold shadow-lg mt-2 md:mt-8
            transition-all duration-200
            hover:shadow-xl focus:shadow-xl
            ${!selectedCourse
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
        )}

        {/* Gráfico Aspectos dl curso*/}
        {mostrarEvaluaciones && evaluaciones.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-3">
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
                  <h3 className="mt-4 mb-1 text-xl font-semibold text-center md:text-2xl ">
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
                  <h3 className="mt-4 mb-1 text-xl font-semibold text-center md:text-2xl ">
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
                    <h3 className="mt-2 mb-0 text-xl font-semibold text-center md:text-2xl ">
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
                <h4 className="mt-3 mb-1 text-xl font-semibold text-center md:text-2xl ">
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
                <h4 className="mt-3 mb-1 text-lg font-semibold text-center md:text-2xl">
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

              {/* Comentarios del curso */}
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
                    {filtrarComentarios("curso", filtroCurso).map((com, i) => (
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
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
