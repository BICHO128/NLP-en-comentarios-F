import { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import axios from 'axios';


const Estudiantes = () => {
  const [comment, setComment] = useState('');
  const [courseComment, setCourseComment] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [teachersWithCourses, setTeachersWithCourses] = useState<
    { id: number, nombre: string, cursos: { id: number, nombre: string }[] }[]
  >([]);

  const [formData, setFormData] = useState({
    satisfaccion_general: '',
    metodologia: '',
    comunicacion: '',
    material_didactico: '',
    puntualidad: '',
    respeto: '',
    organizacion: '',
    claridad: '',
    retroalimentacion: '',
    disponibilidad: ''
  });

  const [formErrors, setFormErrors] = useState<{
    teacher?: string;
    questions?: string[];
    comment?: string;
    courseComment?: string;
  }>({});


  // Obtener docentes con cursos desde backend
  useEffect(() => {
    axios.get("http://localhost:5000/api/docentes-cursos")
      .then(res => {
        setTeachersWithCourses(res.data);
      });
  }, []);

  // Opciones de evaluación
  const evaluationOptions = [
    { value: 'excelente', label: 'Excelente' },
    { value: 'bueno', label: 'Bueno' },
    { value: 'regular', label: 'Regular' },
    { value: 'malo', label: 'Malo' },
    { value: 'pesimo', label: 'Pésimo' }
  ];

  // Preguntas del cuestionario
  const questions = [
    { id: 'satisfaccion_general', label: 'Satisfacción General con el Docente' },
    { id: 'metodologia', label: 'Metodología de Enseñanza' },
    { id: 'comunicacion', label: 'Comunicación con los Estudiantes' },
    { id: 'material_didactico', label: 'Calidad del Material Didáctico' },
    { id: 'puntualidad', label: 'Puntualidad y Cumplimiento de Horarios' },
    { id: 'respeto', label: 'Respeto y Trato hacia los Estudiantes' },
    { id: 'organizacion', label: 'Organización y Estructura de las Clases' },
    { id: 'claridad', label: 'Claridad en las Explicaciones' },
    { id: 'retroalimentacion', label: 'Calidad de la Retroalimentación' },
    { id: 'disponibilidad', label: 'Disponibilidad para Consultas' }
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
      courseComment?: string;
    } = {};


    // Validar selección de docente
    if (!selectedTeacherId) {
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
    if (courseComment.trim().length < 77) {
      errors.courseComment = `El comentario del curso debe tener al menos 77 caracteres. Actualmente tiene ${courseComment.length}`;
    } else if (getWordCount(courseComment) < 10) {
      errors.courseComment = `El comentario del curso debe tener al menos 10 palabras. Actualmente tiene ${getWordCount(courseComment)}`;
    }


    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        const response = await axios.post('http://localhost:5000/api/evaluaciones', {
          docente_id: selectedTeacherId,
          curso_id: selectedCourseId,
          calificaciones: {
            satisfaccion_general: formData.satisfaccion_general,
            metodologia: formData.metodologia,
            comunicacion: formData.comunicacion,
            material_didactico: formData.material_didactico,
            puntualidad: formData.puntualidad,
            respeto: formData.respeto,
            organizacion: formData.organizacion,
            claridad: formData.claridad,
            retroalimentacion: formData.retroalimentacion,
            disponibilidad: formData.disponibilidad
          },
          comentario_docente: comment,
          comentario_curso: courseComment
        });

        console.log('✅ Evaluación enviada:', response.data);

        // Limpiar formulario
        setFormData({
          satisfaccion_general: '',
          metodologia: '',
          comunicacion: '',
          material_didactico: '',
          puntualidad: '',
          respeto: '',
          organizacion: '',
          claridad: '',
          retroalimentacion: '',
          disponibilidad: ''
        });
        setComment('');
        setCourseComment('');
        setSelectedTeacherId(null);
        setSelectedCourseId(null);
        setFormErrors({});
        alert('✅ Evaluación enviada con éxito');
      } catch (error) {
        console.error('❌ Error al enviar evaluación:', error);
        alert('Hubo un error al enviar la evaluación. Intenta más tarde.');
      }
    }
  };




  const wordCount = getWordCount(comment);
  const characterCount = comment.length;
  const courseWordCount = getWordCount(courseComment);
  const courseCharacterCount = courseComment.length;



  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Selección de Docente */}
      <select
        value={selectedTeacherId ?? ''}
        onChange={(e) => {
          const id = parseInt(e.target.value);
          setSelectedTeacherId(id);
          setSelectedCourseId(null); // Reiniciar curso cuando cambia el docente
        }}
      >
        <option value="">Seleccione un docente</option>
        {teachersWithCourses.map((doc) => (
          <option key={doc.id} value={doc.id}>{doc.nombre}</option>
        ))}
      </select>

      {/* Selección de Curso */}
      {selectedTeacherId && (
        <select
          value={selectedCourseId ?? ''}
          onChange={(e) => setSelectedCourseId(parseInt(e.target.value))}
        >
          <option value="">Seleccione un curso</option>
          {teachersWithCourses.find(d => d.id === selectedTeacherId)?.cursos.map((curso) => (
            <option key={curso.id} value={curso.id}>{curso.nombre}</option>
          ))}
        </select>
      )}

      {selectedTeacherId && (
        <>
          {/* Cuestionario de Evaluación */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-center mb-6">
              Cuestionario de Evaluación
            </h2>
            <div className="space-y-6">
              {questions.map((question) => (
                <div
                  key={question.id}
                  className="border-b border-gray-200 pb-4"
                >
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
                        className={`flex items-center justify-center p-3 border rounded-md cursor-pointer transition-all ${formData[question.id as keyof typeof formData] ===
                          option.value
                          ? "bg-blue-50 border-blue-500 text-blue-700"
                          : formErrors.questions?.includes(question.id)
                            ? "border-red-300 hover:bg-red-50"
                            : "hover:bg-gray-50"
                          }`}
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={option.value}
                          checked={
                            formData[question.id as keyof typeof formData] ===
                            option.value
                          }
                          onChange={(e) =>
                            handleInputChange(question.id, e.target.value)
                          }
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
            <h2 className="text-xl font-semibold text-center mb-4">
              Comentario sobre el Curso
            </h2>
            <div>
              <textarea
                value={courseComment}
                onChange={(e) => {
                  setCourseComment(e.target.value);
                  if (formErrors.courseComment) {
                    setFormErrors((prev) => ({
                      ...prev,
                      courseComment: undefined,
                    }));
                  }
                }}
                placeholder="Comparte tu opinión sobre el curso (mínimo 77 caracteres y 10 palabras)..."
                className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.courseComment
                  ? "border-red-500"
                  : "border-gray-300"
                  }`}
                rows={4}
              />
              <div className="flex justify-between text-sm mt-2">
                <span
                  className={
                    courseCharacterCount < 77
                      ? "text-red-600"
                      : "text-green-600"
                  }
                >
                  Caracteres: {courseCharacterCount}/77 mínimo
                </span>
                <span
                  className={
                    courseWordCount < 10 ? "text-red-600" : "text-green-600"
                  }
                >
                  Palabras: {courseWordCount}/10 mínimo
                </span>
              </div>
              {formErrors.courseComment && (
                <p className="text-sm text-red-600">
                  {formErrors.courseComment}
                </p>
              )}
            </div>

            {/* Sección de Comentarios del Docente */}
            <h2 className="text-xl font-semibold text-center mb-4">
              Comentario sobre el Docente
            </h2>
            <div className="space-y-4">
              <div>
                <textarea
                  value={comment}
                  onChange={(e) => {
                    setComment(e.target.value);
                    if (formErrors.comment) {
                      setFormErrors((prev) => ({
                        ...prev,
                        comment: undefined,
                      }));
                    }
                  }}
                  placeholder="Comparte tu experiencia con el docente (mínimo 77 caracteres y 10 palabras)..."
                  className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.comment ? "border-red-500" : "border-gray-300"
                    }`}
                  rows={4}
                />
                <div className="flex flex-col space-y-1 mt-2">
                  <div className="flex justify-between">
                    <p
                      className={`text-sm ${characterCount < 77 ? "text-red-600" : "text-green-600"
                        }`}
                    >
                      Caracteres: {characterCount}/77 mínimo
                    </p>
                    <p
                      className={`text-sm ${wordCount < 10 ? "text-red-600" : "text-green-600"
                        }`}
                    >
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