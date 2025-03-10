import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TeacherSection = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Sample data for the chart
  const chartData = {
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

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Distribución de Comentarios',
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

  // Sample comments data
  const comments = {
    positive: [
      "Excelente metodología de enseñanza y muy buena disposición para resolver dudas.",
      "Las clases son muy dinámicas y se nota la preparación del material.",
    ],
    neutral: [
      "El contenido es bueno pero a veces va muy rápido.",
      "Las clases son interesantes aunque algunos temas son complejos.",
    ],
    negative: [
      "Falta más ejemplos prácticos en clase.",
      "La comunicación podría mejorar.",
    ],
  };

  return (
    <div className="space-y-8">
      {/* Statistics Chart */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Estadísticas de Comentarios</h2>
        <div className="h-[400px]">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </section>

      {/* Relevant Comments */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Comentarios Relevantes</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-green-600 mb-3">Comentarios Positivos</h3>
            <div className="space-y-2">
              {comments.positive.map((comment, index) => (
                <div key={index} className="p-3 bg-green-50 rounded-md border border-green-100">
                  <p className="text-gray-700">{comment}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-yellow-600 mb-3">Comentarios Neutrales</h3>
            <div className="space-y-2">
              {comments.neutral.map((comment, index) => (
                <div key={index} className="p-3 bg-yellow-50 rounded-md border border-yellow-100">
                  <p className="text-gray-700">{comment}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-red-600 mb-3">Comentarios Negativos</h3>
            <div className="space-y-2">
              {comments.negative.map((comment, index) => (
                <div key={index} className="p-3 bg-red-50 rounded-md border border-red-100">
                  <p className="text-gray-700">{comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* All Comments */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Todos los Comentarios</h2>
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Todos</option>
            <option value="positive">Positivos</option>
            <option value="neutral">Neutrales</option>
            <option value="negative">Negativos</option>
          </select>
        </div>
        <div className="space-y-4">
          {/* Here you would map through all comments based on the selected filter */}
          <div className="p-4 border rounded-md">
            <p className="text-gray-700">
              "Excelente metodología de enseñanza y muy buena disposición para resolver dudas."
            </p>
            <div className="mt-2 flex items-center">
              <span className="text-sm text-gray-500">Fecha: 15/03/2024</span>
              <span className="mx-2 text-gray-300">|</span>
              <span className="text-sm font-medium text-green-600">Positivo</span>
            </div>
          </div>
          {/* Add more comments here */}
          <div className="p-4 border rounded-md">
            <p className="text-gray-700">
              "El contenido es bueno, pero a veces va muy rápido. Las clases son interesantes aunque algunos temas son complejos."
            </p>
            <div className="mt-2 flex items-center">
              <span className="text-sm text-gray-500">Fecha: 15/03/2024</span>
              <span className="mx-2 text-gray-300">|</span>
              <span className="text-sm font-medium text-yellow-600">Neutral</span>
            </div>
          </div>

          <div className="p-4 border rounded-md">
            <p className="text-gray-700">
              "La comunicación del docente podría mejorar. Falta más interacción con los estudiantes y algunos temas son difíciles de entender debido a la falta de ejemplos prácticos en clase."
            </p>
            <div className="mt-2 flex items-center">
              <span className="text-sm text-gray-500">Fecha: 15/03/2024</span>
              <span className="mx-2 text-gray-300">|</span>
              <span className="text-sm font-medium text-red-600">Negativo</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TeacherSection;