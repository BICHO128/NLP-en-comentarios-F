import { useState, useEffect } from 'react';
import { Line, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);






const Docentes = () => {


  interface Curso {
    id: number;
    nombre: string;
  }

  interface Docente {
    id: number;
    nombre: string;
  }


  const [docente, setDocente] = useState<Docente | null>(null);
  const [curso, setCurso] = useState<Curso | null>(null);

  useEffect(() => {
    // Simulación de datos del docente y su curso (reemplaza con API real si lo deseas)
    setDocente({ id: 4, nombre: 'Diego Fernando Prado' });
    setCurso({ id: 6, nombre: 'Complejidad Algorítmica' });
  }, []);


  const [selectedCommentType, setSelectedCommentType] = useState('all');

  // Data for the top three charts
  const lineChartData1 = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Satisfacción General',
        data: [65, 75, 70, 80, 75, 85],
        fill: true,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        tension: 0.4,
      },
    ],
  };

  const lineChartData2 = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Participación Estudiantil',
        data: [40, 60, 55, 75, 65, 70],
        fill: true,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        tension: 0.4,
      },
    ],
  };

  const lineChartData3 = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Calidad del Material',
        data: [55, 65, 60, 70, 75, 80],
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.4,
      },
    ],
  };

  // Data for the aspects pie chart
  const pieChartData = {
    labels: ['Metodología', 'Comunicación', 'Material', 'Puntualidad'],
    datasets: [
      {
        data: [40, 25, 20, 15],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Data for the comments distribution donut chart
  const commentsDistributionData = {
    labels: ['Positivos', 'Neutrales', 'Negativos'],
    datasets: [
      {
        data: [65, 25, 10],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(234, 179, 8)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Data for the progress bars
  const progressData = [
    { label: 'Satisfacción General', value: 85, color: 'bg-blue-500' },
    { label: 'Participación', value: 70, color: 'bg-green-500' },
    { label: 'Material Didáctico', value: 90, color: 'bg-purple-500' },
  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
    cutout: '70%',
  };

  // Sample comments data
  const allComments = {
    positive: [
      { text: "Excelente metodología y material didáctico", date: "15/03/2024" },
      { text: "Las explicaciones son muy claras y precisas", date: "14/03/2024" },
    ],
    neutral: [
      { text: "Buena comunicación pero el ritmo es algo rápido", date: "14/03/2024" },
      { text: "El contenido es bueno pero algunos temas son complejos", date: "13/03/2024" },
    ],
    negative: [
      { text: "Se necesitan más ejemplos prácticos", date: "13/03/2024" },
      { text: "La comunicación podría mejorar en algunos aspectos", date: "12/03/2024" },
    ],
  };

  const getFilteredComments = () => {
    if (selectedCommentType === 'all') {
      return [
        ...allComments.positive.map(c => ({ ...c, type: 'positive' })),
        ...allComments.neutral.map(c => ({ ...c, type: 'neutral' })),
        ...allComments.negative.map(c => ({ ...c, type: 'negative' })),
      ];
    }
    return allComments[selectedCommentType as keyof typeof allComments].map(c => ({
      ...c,
      type: selectedCommentType,
    }));
  };


  const descargarPDF = async (docenteId: number, cursoId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/reportes/docente/${docenteId}/curso/${cursoId}/pdf`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte_${docenteId}_${cursoId}.pdf`;
      a.click();
      a.remove();
    } catch (error) {
      console.error("Error al descargar el PDF:", error);
    }
  };

  const descargarExcel = async (docenteId: number, cursoId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/reportes/docente/${docenteId}/curso/${cursoId}/excel`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte_${docenteId}_${cursoId}.xlsx`;
      a.click();
      a.remove();
    } catch (error) {
      console.error("Error al descargar el Excel:", error);
    }
  };



  return (
    <div className="grid grid-cols-12 gap-6 p-6 bg-gray-100">
      {/* Top row - Three line charts */}
      <div className="col-span-4 bg-white rounded-lg shadow p-8 h-[200px]">
        <h3 className="text-lg font-semibold mb-1 text-center">
          Satisfacción General
        </h3>
        <Line data={lineChartData1} options={chartOptions} />
      </div>


      {docente && curso && (
        <div className="col-span-12 flex justify-center mb-4">
          <button
            onClick={() => descargarPDF(docente.id, curso.id)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 m-2"
          >
            Descargar PDF
          </button>
          <button
            onClick={() => descargarExcel(docente.id, curso.id)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 m-2"
          >
            Descargar Excel
          </button>
        </div>
      )}



      <div className="col-span-4 bg-white rounded-lg shadow p-8 h-[200px]">
        <h3 className="text-lg font-semibold mb-1 text-center">
          Participación Estudiantil
        </h3>
        <Line data={lineChartData2} options={chartOptions} />
      </div>
      <div className="col-span-4 bg-white rounded-lg shadow p-8 h-[200px]">
        <h3 className="text-lg font-semibold mb-1 text-center">
          Calidad del Material
        </h3>
        <Line data={lineChartData3} options={chartOptions} />
      </div>

      {/* Middle row - Pie chart and progress bars */}
      <div className="col-span-6 bg-white rounded-lg shadow p-4 h-[300px]">
        <h3 className="text-lg font-semibold mb-4 text-center">
          Distribución de Aspectos Evaluados
        </h3>
        <div className="h-[220px] flex items-center justify-center">
          <Pie data={pieChartData} options={pieOptions} />
        </div>
      </div>
      <div className="col-span-6 bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Indicadores de Desempeño</h3>
        <div className="space-y-4">
          {progressData.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{item.label}</span>
                <span className="text-sm font-medium">{item.value}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`${item.color} h-2.5 rounded-full`}
                  style={{ width: `${item.value}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom row - Comments distribution and filtered comments */}
      <div className="col-span-6 bg-white rounded-lg shadow p-4 h-[420px]">
        <h3 className="text-lg font-semibold mb-2 text-center">
          Distribución de Comentarios
        </h3>
        <div className="h-[350px] flex items-center justify-center">
          <Doughnut data={commentsDistributionData} options={donutOptions} />
        </div>
      </div>

      {/* Comments section with filter */}
      <div className="col-span-6 bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Comentarios</h3>
          <select
            value={selectedCommentType}
            onChange={(e) => setSelectedCommentType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Todos</option>
            <option value="positive">Positivos</option>
            <option value="neutral">Neutrales</option>
            <option value="negative">Negativos</option>
          </select>
        </div>
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {getFilteredComments().map((comment, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${comment.type === "positive"
                ? "bg-green-50 border border-green-200"
                : comment.type === "neutral"
                  ? "bg-yellow-50 border border-yellow-200"
                  : "bg-red-50 border border-red-200"
                }`}
            >
              <p className="text-gray-800">{comment.text}</p>
              <div className="mt-2 flex items-center">
                <span className="text-sm text-gray-500">{comment.date}</span>
                <span className="mx-2 text-gray-300">|</span>
                <span
                  className={`text-sm font-medium ${comment.type === "positive"
                    ? "text-green-600"
                    : comment.type === "neutral"
                      ? "text-yellow-600"
                      : "text-red-600"
                    }`}
                >
                  {comment.type === "positive"
                    ? "Positivo"
                    : comment.type === "neutral"
                      ? "Neutral"
                      : "Negativo"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Docentes;