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

  // Carga los cursos del docente autenticado
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
        setCursos(data);
      })
      .catch(err => {
        console.error('Error al obtener cursos:', err);
        setCursos([]);
      });
  }, [user, token]);

  // Obtiene evaluaciones para el curso seleccionado
  const obtenerEvaluaciones = () => {
    if (!user || !selectedCourseId) return;
    fetch(
      `http://localhost:5000/api/evaluaciones/docente/${user.id}/curso/${selectedCourseId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar evaluaciones');
        return res.json();
      })
      .then((data: Evaluacion[]) => {
        console.log('RESPUESTA EVALUACIONES:', data);

        setEvaluaciones(data);
        setMostrarEvaluaciones(true);
      })
      .catch(err => {
        console.error('Error al obtener evaluaciones:', err);
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

  const descargarPDF = () => {
    if (!user || !selectedCourseId) return alert('Seleccione un curso primero.');

    fetch(
      `http://localhost:5000/api/reportes/docente/${user.id}/curso/${selectedCourseId}/pdf`,
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
        a.download = `reporte_${user.username}_${selectedCourseId}.pdf`;
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

  return (
    <div className="space-y-6 p-4 rounded-lg ">
      {/* Saludo */}
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <h2 className="text-2xl font-bold text-blue-800 mb-2">
          Bienvenido, {user?.username} 🫡
        </h2>
        <p className="text-gray-700">
          Aquí verá las evaluaciones realizadas por sus estudiantes con gráficos
          y comentarios.
        </p>
      </div>

      {/* Selector de curso */}
      <div>
        <label
          className={`font-semibold mb-1 block ${isDarkMode ? "text-white" : "text-black"
            }`}
        >
          Seleccione un curso:
        </label>
        <select
          className="w-full border rounded px-3 py-2"
          value={selectedCourseId}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => {
            setSelectedCourseId(e.target.value);
            setMostrarEvaluaciones(false);
          }}
        >
          <option value="">Elija un curso 😉</option>
          {cursos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Botones Ver / PDF */}
      {selectedCourseId && (
        <div className="flex gap-4 justify-center">
          <button
            onClick={obtenerEvaluaciones}
            className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
          >
            Ver Evaluaciones
          </button>
          <button
            onClick={descargarPDF}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Descargar PDF
          </button>
        </div>
      )}

      {/* Gráficos principales */}
      {mostrarEvaluaciones && evaluaciones.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Contenedor 1: Aspectos del Curso */}
            <div className="bg-white rounded shadow p-4 h-[350px] flex justify-center items-center overflow-hidden">
              <div className="flex flex-col justify-center items-center w-full">
                <h3 className="text-center font-semibold mb-0 text-xl md:text-xl ">
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
              <div className="flex flex-col justify-center items-center w-full">
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
              <div className=" w-full">
                <div>
                  <h3 className="text-center font-semibold mb-0 text-xl md:text-xl">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gráfica de sentimientos del docente */}
                <div className="bg-white rounded shadow p-4 h-[400px] flex flex-col justify-center items-center overflow-hidden">
                  <h4 className="text-center text-lg md:text-xl font-semibold mb-4">
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
                <div className="bg-white rounded shadow p-4 h-[400px] flex flex-col justify-center items-center overflow-hidden">
                  <h4 className="text-center text-lg md:text-xl font-semibold mb-4">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Comentarios del docente */}
                <div className="bg-blue-50 rounded p-4">
                  <div className="flex justify-between mb-2">
                    <h5 className="font-semibold">Comentarios del Docente</h5>
                    <select
                      className="border rounded px-2 py-1"
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
                  <div className="space-y-3 max-h-64 overflow-auto">
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
                <div className="bg-blue-50 rounded p-4">
                  <div className="flex justify-between mb-2">
                    <h5 className="font-semibold">Comentarios del Curso</h5>
                    <select
                      className="border rounded px-2 py-1"
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
                  <div className="space-y-3 max-h-64 overflow-auto">
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
        </>
      )}
    </div>
  );
}