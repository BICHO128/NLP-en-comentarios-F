import React, { useState } from 'react';
import { FileUp, Send } from 'lucide-react';

const StudentSection = () => {
  const [comment, setComment] = useState('');
  const [selectedTeacher] = useState('ANA MARIA CAVIEDES CASTILLO');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Handle file upload logic here
      console.log('File uploaded:', file.name);
    }
  };

  const handleSubmitComment = () => {
    if (comment.trim()) {
      // Handle comment submission logic here
      console.log('Comment submitted:', comment);
      setComment('');
    }
  };

  return (
    <div className="space-y-8">
      {/* Questionnaire Import Section */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-center mb-4">Importar Cuestionario</h2>
        <div className="flex items-center space-x-4">
          <label className="flex-1">
            <input
              type="file"
              className="hidden"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
            />
            <div className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
              <FileUp className="h-5 w-5 mr-2 text-gray-500" />
              <span>Seleccionar archivo</span>
            </div>
          </label>
        </div>
      </section>

      {/* Teacher List Section */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-center mb-4">Docentes Matriculados</h2>
        <div className="border rounded-md p-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">{selectedTeacher}</span>
            <span className="text-sm text-gray-500">Docente Activo</span>
          </div>
        </div>
      </section>

      {/* Comment Section */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-center mb-4">Evaluación al Docente</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="teacher" className="block text-sm font-medium text-gray-700 mb-1">
              Docente
            </label>
            <input
              type="text"
              id="teacher"
              value={selectedTeacher}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
              Tu comentario de libre expresión
            </label>
            <textarea
              id="comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Comparte que tu opinión sobre el docente..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleSubmitComment}
            className="flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
          >
            <Send className="h-4 w-4 mr-2" />
            Enviar Comentario
          </button>
          <p className="text-sm text-gray-500 text-center">
            Tu comentario será enviado de forma anónima.
          </p>
        </div>
      </section>
    </div>
  );
};

export default StudentSection;