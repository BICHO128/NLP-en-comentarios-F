import { useState } from 'react';
import { Send } from 'lucide-react';

const Estudiantes = () => {
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [comment, setComment] = useState('');
  const [formErrors, setFormErrors] = useState<{
    teacher?: string;
    questions?: string[];
    comment?: string;
  }>({});
  const [formData, setFormData] = useState({
    satisfaccionGeneral: '',
    metodologia: '',
    comunicacion: '',
    materialCalidad: '',
    puntualidad: '',
    respeto: '',
    organizacionClase: '',
    claridadExplicaciones: '',
    retroalimentacion: '',
    disponibilidadConsultas: ''
  });

  // Lista de docentes
  const teachers = [
    'ANA MARIA CAVIEDES CASTILLO',
    'MANUEL OBANDO',
    'FERNANDO CONCHA'
  ];

  // Opciones de evaluación
  const evaluationOptions = [
    { value: 'excelente', label: 'Excelente' },
    { value: 'bueno', label: 'Bueno' },
    { value: 'regular', label: 'Regular' },
    { value: 'malo', label: 'Malo' }
  ];

  // Preguntas del cuestionario
  const questions = [
    { id: 'satisfaccionGeneral', label: 'Satisfacción General con el Docente' },
    { id: 'metodologia', label: 'Metodología de Enseñanza' },
    { id: 'comunicacion', label: 'Comunicación con los Estudiantes' },
    { id: 'materialCalidad', label: 'Calidad del Material Didáctico' },
    { id: 'puntualidad', label: 'Puntualidad y Cumplimiento de Horarios' },
    { id: 'respeto', label: 'Respeto y Trato hacia los Estudiantes' },
    { id: 'organizacionClase', label: 'Organización y Estructura de las Clases' },
    { id: 'claridadExplicaciones', label: 'Claridad en las Explicaciones' },
    { id: 'retroalimentacion', label: 'Calidad de la Retroalimentación' },
    { id: 'disponibilidadConsultas', label: 'Disponibilidad para Consultas' }
  ];

  const handleInputChange = (questionId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: value
    }));
    // Limpiar error específico si existe
    if (formErrors.questions?.includes(questionId)) {
      setFormErrors(prev => ({
        ...prev,
        questions: prev.questions?.filter(q => q !== questionId)
      }));
    }
  };

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const validateForm = () => {
    const errors: {
      teacher?: string;
      questions?: string[];
      comment?: string;
    } = {};

    // Validar selección de docente
    if (!selectedTeacher) {
      errors.teacher = 'Por favor seleccione un docente';
    }

    // Validar preguntas sin responder
    const unansweredQuestions = questions
      .filter(q => !formData[q.id as keyof typeof formData])
      .map(q => q.id);
    
    if (unansweredQuestions.length > 0) {
      errors.questions = unansweredQuestions;
    }

    // Validar comentario
    const commentLength = comment.trim().length;
    const wordCount = getWordCount(comment);

    if (commentLength === 0) {
      errors.comment = 'Por favor ingrese un comentario';
    } else if (commentLength < 77) {
      errors.comment = `El comentario debe tener al menos 77 caracteres. Actualmente: ${commentLength} caracteres`;
    } else if (wordCount < 10) {
      errors.comment = `El comentario debe tener al menos 10 palabras. Actualmente: ${wordCount} palabras`;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Aquí se enviaría la información al backend
      console.log('Datos de la evaluación:', {
        docente: selectedTeacher,
        evaluacion: formData,
        comentario: comment
      });

      // Resetear el formulario
      setFormData({
        satisfaccionGeneral: '',
        metodologia: '',
        comunicacion: '',
        materialCalidad: '',
        puntualidad: '',
        respeto: '',
        organizacionClase: '',
        claridadExplicaciones: '',
        retroalimentacion: '',
        disponibilidadConsultas: ''
      });
      setComment('');
      setSelectedTeacher('');
      setFormErrors({});
    }
  };

  const wordCount = getWordCount(comment);
  const characterCount = comment.length;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Selección de Docente */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-center mb-4">Evalua tu Docente</h2>
        <div className="max-w-xl mx-auto">
          <select
            value={selectedTeacher}
            onChange={(e) => {
              setSelectedTeacher(e.target.value);
              if (formErrors.teacher) {
                setFormErrors(prev => ({ ...prev, teacher: undefined }));
              }
            }}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.teacher ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Seleccione un docente</option>
            {teachers.map((teacher) => (
              <option key={teacher} value={teacher}>
                {teacher}
              </option>
            ))}
          </select>
          {formErrors.teacher && (
            <p className="mt-1 text-sm text-red-600">{formErrors.teacher}</p>
          )}
        </div>
      </section>

      {selectedTeacher && (
        <>
          {/* Cuestionario de Evaluación */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-center mb-6">Cuestionario de Evaluación</h2>
            <div className="space-y-6">
              {questions.map((question) => (
                <div key={question.id} className="border-b border-gray-200 pb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {question.label}
                    {formErrors.questions?.includes(question.id) && (
                      <span className="text-red-600 ml-1">*</span>
                    )}
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {evaluationOptions.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center justify-center p-3 border rounded-md cursor-pointer transition-all ${
                          formData[question.id as keyof typeof formData] === option.value
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : formErrors.questions?.includes(question.id)
                            ? 'border-red-300 hover:bg-red-50'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={option.value}
                          checked={formData[question.id as keyof typeof formData] === option.value}
                          onChange={(e) => handleInputChange(question.id, e.target.value)}
                          className="hidden"
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {formErrors.questions && formErrors.questions.length > 0 && (
              <p className="mt-4 text-sm text-red-600 text-center">
                Por favor responda todas las preguntas marcadas con *
              </p>
            )}
          </section>

          {/* Sección de Comentarios */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-center mb-4">Comentario</h2>
            <div className="space-y-4">
              <div>
                <textarea
                  value={comment}
                  onChange={(e) => {
                    setComment(e.target.value);
                    if (formErrors.comment) {
                      setFormErrors(prev => ({ ...prev, comment: undefined }));
                    }
                  }}
                  placeholder="Comparte tu experiencia con el docente (mínimo 77 caracteres y 10 palabras)..."
                  className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.comment ? 'border-red-500' : 'border-gray-300'
                  }`}
                  rows={4}
                />
                <div className="flex flex-col space-y-1 mt-2">
                  <div className="flex justify-between">
                    <p className={`text-sm ${characterCount < 77 ? 'text-red-600' : 'text-green-600'}`}>
                      Caracteres: {characterCount}/77 mínimo
                    </p>
                    <p className={`text-sm ${wordCount < 10 ? 'text-red-600' : 'text-green-600'}`}>
                      Palabras: {wordCount}/10 mínimo
                    </p>
                  </div>
                  {formErrors.comment && (
                    <p className="text-sm text-red-600">{formErrors.comment}</p>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-500 text-center">
                Tu evaluación será procesada de forma anónima.
              </p>
            </div>
          </section>

          {/* Botón de Envío */}
          <section className="flex justify-center">
            <button
              onClick={handleSubmit}
              className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 font-medium"
            >
              <Send className="h-5 w-5 mr-2" />
              Enviar Evaluación
            </button>
          </section>
        </>
      )}
    </div>
  );
};

export default Estudiantes;