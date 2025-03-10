import React, { useState } from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { FileDown } from 'lucide-react';
import jsPDF from 'jspdf';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Administrador = () => {
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommentType, setSelectedCommentType] = useState('all');

  // Sample teachers data
  const teachers = [
    'ANA MARIA CAVIEDES CASTILLO',
    'MANUEL OBANDO',
    'FERNANDO CONCHA',
  ];

  // Filtered teachers based on search term
  const filteredTeachers = teachers.filter((teacher) =>
    teacher.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Data for the line charts
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

  // Data for the pie chart
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

  // Data for the comments distribution chart
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


  // Sample comments data
  const allComments = {
    positive: [
      { text: "Excelente metodología de enseñanza, las clases son muy dinámicas y el material es muy completo.", frequency: "Alta" },
      { text: "Las explicaciones son muy claras y precisas.", frequency: "Media" },
    ],
    neutral: [
      { text: "El contenido es bueno pero algunos temas requieren más tiempo de explicación.", frequency: "Media" },
      { text: "Las clases son interesantes aunque algunos temas son complejos.", frequency: "Baja" },
    ],
    negative: [
      { text: "Falta más ejemplos prácticos en clase.", frequency: "Baja" },
      { text: "La comunicación podría mejorar.", frequency: "Baja" },
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && filteredTeachers.length > 0) {
      setSelectedTeacher(filteredTeachers[0]);
    }
  };



  const generatePDFReport = () => {
    const pdf = new jsPDF();
    let yPos = 20;

    // Title
    pdf.setFontSize(16);
    pdf.text('Informe de Evaluación Docente', 20, yPos);
    yPos += 10;

    pdf.setFontSize(14);
    pdf.text(`Docente: ${selectedTeacher}`, 20, yPos);
    yPos += 20;

    // Summary
    pdf.setFontSize(12);
    pdf.text('Resumen:', 20, yPos);
    yPos += 10;

    const summary = [
      'Satisfacción general: 85% (Excelente)',
      'Participación estudiantil: 70% (Bueno)',
      'Calidad del material: 80% (Muy Bueno)',
    ];

    summary.forEach(line => {
      pdf.text(line, 30, yPos);
      yPos += 7;
    });
    yPos += 10;

    // Strengths
    pdf.text('Puntos Fuertes:', 20, yPos);
    yPos += 10;

    const strengths = [
      'Excelente metodología de enseñanza',
      'Material didáctico bien preparado',
      'Buena disposición para resolver dudas',
    ];

    strengths.forEach(line => {
      pdf.text(`• ${line}`, 30, yPos);
      yPos += 7;
    });
    yPos += 10;

    // Areas for Improvement
    pdf.text('Áreas de Mejora:', 20, yPos);
    yPos += 10;

    const improvements = [
      'Incrementar ejemplos prácticos',
      'Ajustar el ritmo de las clases',
      'Mejorar la comunicación en temas complejos',
    ];

    improvements.forEach(line => {
      pdf.text(`• ${line}`, 30, yPos);
      yPos += 7;
    });
    yPos += 10;

    // Conclusions
    pdf.text('Conclusiones:', 20, yPos);
    yPos += 10;

    const conclusions = [
      'El docente muestra un desempeño general muy positivo',
      'Los estudiantes valoran especialmente la metodología',
      'Se recomienda implementar más ejercicios prácticos',
    ];

    conclusions.forEach(line => {
      pdf.text(`• ${line}`, 30, yPos);
      yPos += 7;
    });

    // Add charts
    const charts = document.querySelectorAll('canvas');
    charts.forEach((canvas) => {
      if (yPos > 250) {
        pdf.addPage();
        yPos = 20;
      }
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 20, yPos, 170, 80);
      yPos += 90;
    });

    pdf.save(`informe-${selectedTeacher}.pdf`);
  };

  return (
    <div className="space-y-8">
      {/* Titulo */}
      <div className="text-center">
        <h1 className="text-2xl font-bold">ESTADÍSTICAS DE LA AUTOEVALUACIÓN AL DOCENTE</h1>
        <h2 className="text-lg font-semibold text-gray-500">
          realizado por los estudiantes
        </h2>
      </div>

      {/* Teacher Selection */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Docentes Matriculados</h2>
        <input
          type="text"
          placeholder="Buscar docente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className="mb-4 p-2 border rounded-lg w-full"
        />
        {searchTerm && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTeachers.map((teacher) => (
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
        )}
      </section>

      {selectedTeacher && (
        <>
          {/* Download Report Button */}
          <div className="flex justify-end">
            <button
              onClick={generatePDFReport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <FileDown className="h-5 w-5" />
              Descargar Informe Completo
            </button>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Top row - Three line charts */}
            <div className="col-span-4 bg-white rounded-lg shadow p-4 h-[200px]">
              <h3 className="text-lg font-semibold mb-2">Satisfacción General</h3>
              <Line data={lineChartData1} options={chartOptions} id="satisfaction-chart" />
            </div>
            <div className="col-span-4 bg-white rounded-lg shadow p-4 h-[200px]">
              <h3 className="text-lg font-semibold mb-2">Participación Estudiantil</h3>
              <Line data={lineChartData2} options={chartOptions} id="participation-chart" />
            </div>
            <div className="col-span-4 bg-white rounded-lg shadow p-4 h-[200px]">
              <h3 className="text-lg font-semibold mb-2">Calidad del Material</h3>
              <Line data={lineChartData3} options={chartOptions} id="quality-chart" />
            </div>

            {/* Middle row - Pie charts */}
            <div className="col-span-6 bg-white rounded-lg shadow p-4 h-[300px]">
              <h3 className="text-lg font-semibold mb-2">Distribución de Aspectos Evaluados</h3>
              <Doughnut data={pieChartData} options={pieOptions} id="aspects-chart" />
            </div>
            <div className="col-span-6 bg-white rounded-lg shadow p-4 h-[300px]">
              <h3 className="text-lg font-semibold mb-2">Distribución de Comentarios</h3>
              <Doughnut data={commentsDistributionData} options={donutOptions} id="comments-distribution-chart" />
            </div>

            {/* Comments section with filter */}
            <div className="col-span-12 bg-white rounded-lg shadow p-4">
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
              <div className="space-y-3">
                {getFilteredComments().map((comment, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-md ${
                      comment.type === 'positive'
                        ? 'bg-green-50'
                        : comment.type === 'neutral'
                        ? 'bg-yellow-50'
                        : 'bg-red-50'
                    }`}
                  >
                    <p className="text-gray-700">{comment.text}</p>
                    <div className="mt-2 flex items-center">
                      <span className="text-sm text-gray-500">Frecuencia: {comment.frequency}</span>
                      <span className="mx-2 text-gray-300">|</span>
                      <span className={`text-sm font-medium ${
                        comment.type === 'positive'
                          ? 'text-green-600'
                          : comment.type === 'neutral'
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}>
                        {comment.type === 'positive' ? 'Positivo' : comment.type === 'neutral' ? 'Neutral' : 'Negativo'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Administrador;