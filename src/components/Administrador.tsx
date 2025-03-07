import { useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Download, Maximize2 } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AdminSection = () => {
  const [selectedTeacher, setSelectedTeacher] = useState('ANA MARIA CAVIEDES CASTILLO');
  
  // Sample teachers data
  const teachers = [
    'ANA MARIA CAVIEDES CASTILLO',
    'JUAN CARLOS MARTINEZ',
    'MARIA FERNANDA LOPEZ',
  ];

  // Sample data for charts
  const barChartData = {
    labels: ['Positivos', 'Neutrales', 'Negativos'],
    datasets: [
      {
        label: 'Porcentaje de Comentarios',
        data: [65, 25, 10],
        backgroundColor: [
          'rgba(34, 197, 94, 0.5)',
          'rgba(234, 179, 8, 0.5)',
          'rgba(239, 68, 68, 0.5)',
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

  const doughnutData = {
    labels: ['Metodología', 'Comunicación', 'Material', 'Puntualidad', 'Otros'],
    datasets: [
      {
        data: [30, 25, 20, 15, 10],
        backgroundColor: [
          'rgba(59, 130, 246, 0.5)',
          'rgba(16, 185, 129, 0.5)',
          'rgba(249, 115, 22, 0.5)',
          'rgba(139, 92, 246, 0.5)',
          'rgba(156, 163, 175, 0.5)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(249, 115, 22)',
          'rgb(139, 92, 246)',
          'rgb(156, 163, 175)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const lineChartData = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
    datasets: [
      {
        label: 'Tendencia de Satisfacción',
        data: [75, 78, 72, 80, 82, 85],
        borderColor: 'rgb(59, 130, 246)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Evaluación del Docente',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function (tickValue: string | number) {
            return `${tickValue}%`;
          },
        },
      },
    },
  };

  const handleDownload = (chartId: string) => {
    const canvas = document.querySelector(`#${chartId}`) as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `${chartId}-${selectedTeacher}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const handleFullscreen = (chartId: string) => {
    const element = document.querySelector(`#${chartId}-container`) as HTMLElement;
    if (element && document.fullscreenEnabled) {
      if (!document.fullscreenElement) {
        element.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Teacher Selection */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Docentes Matriculados</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher) => (
            <button
              key={teacher}
              onClick={() => setSelectedTeacher(teacher)}
              className={`p-4 rounded-lg border transition-all ${
                selectedTeacher === teacher
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <h3 className="font-medium">{teacher}</h3>
              <p className="text-sm text-gray-500 mt-1">Ver estadísticas</p>
            </button>
          ))}
        </div>
      </section>

      {/* Distribution Chart */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Distribución de Comentarios</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => handleDownload('distribution-chart')}
              className="p-2 text-gray-600 hover:text-gray-900"
              title="Descargar gráfica"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleFullscreen('distribution-chart')}
              className="p-2 text-gray-600 hover:text-gray-900"
              title="Ver en pantalla completa"
            >
              <Maximize2 className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div id="distribution-chart-container" className="h-[400px]">
          <Bar id="distribution-chart" data={barChartData} options={chartOptions} />
        </div>
      </section>

      {/* Categories Distribution */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Distribución por Categorías</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => handleDownload('categories-chart')}
              className="p-2 text-gray-600 hover:text-gray-900"
              title="Descargar gráfica"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleFullscreen('categories-chart')}
              className="p-2 text-gray-600 hover:text-gray-900"
              title="Ver en pantalla completa"
            >
              <Maximize2 className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div id="categories-chart-container" className="h-[400px] flex justify-center">
          <div className="w-2/3">
            <Doughnut id="categories-chart" data={doughnutData} />
          </div>
        </div>
      </section>

      {/* Satisfaction Trend */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Tendencia de Satisfacción</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => handleDownload('trend-chart')}
              className="p-2 text-gray-600 hover:text-gray-900"
              title="Descargar gráfica"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleFullscreen('trend-chart')}
              className="p-2 text-gray-600 hover:text-gray-900"
              title="Ver en pantalla completa"
            >
              <Maximize2 className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div id="trend-chart-container" className="h-[400px]">
          <Line id="trend-chart" data={lineChartData} options={chartOptions} />
        </div>
      </section>

      {/* Trending Comments */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Comentarios Tendencia</h2>
        <div className="space-y-4">
          <div className="p-4 border rounded-md bg-green-50">
            <p className="text-gray-700">
              "Excelente metodología de enseñanza, las clases son muy dinámicas y el material es muy completo."
            </p>
            <div className="mt-2 flex items-center">
              <span className="text-sm text-gray-500">Frecuencia: Alta</span>
              <span className="mx-2 text-gray-300">|</span>
              <span className="text-sm font-medium text-green-600">Positivo</span>
            </div>
          </div>
          <div className="p-4 border rounded-md bg-yellow-50">
            <p className="text-gray-700">
              "El contenido es bueno pero algunos temas requieren más tiempo de explicación."
            </p>
            <div className="mt-2 flex items-center">
              <span className="text-sm text-gray-500">Frecuencia: Media</span>
              <span className="mx-2 text-gray-300">|</span>
              <span className="text-sm font-medium text-yellow-600">Neutral</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminSection;