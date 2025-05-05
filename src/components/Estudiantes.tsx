import { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import axios from 'axios';
import { useDarkMode } from '../hooks/useDarkMode';
import { useAuthStore } from '../stores/Autenticacion'; // Importa el hook de autenticación

// Define interfaces para mejor seguridad de tipos
interface Teacher {
  id: number;
  nombre: string;
  username?: string;
}

interface Course {
  id: number;
  nombre: string;
  username?: string;
}

// --- NUEVO: Interfaz para las preguntas con criterio_id ---
interface Question {
  id: string; // ID usado en el estado formData (e.g., 'satisfaccion_general')
  label: string;
  criterio_id: number; // ID del criterio correspondiente en el backend
}

const Estudiantes = () => {
  const { user } = useAuthStore();                // Obtiene el objeto user del store de autenticación
  const estudiante_id = user?.id ?? null;         // Obtiene el ID del estudiante logueado, o null si no hay usuario
  const [comment, setComment] = useState('');
  const [courseComment, setCourseComment] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const { isDarkMode } = useDarkMode();

  const [formData, setFormData] = useState<Record<string, string>>({ // Usar Record<string, string>
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
    course?: string;
    questions?: string[];
    comment?: string;
    courseComment?: string;
    studentId?: string; // Para errores relacionados con el ID del estudiante
  }>({});

  // --- NUEVO: Mapeo de valores de evaluación a números ---
  const evaluationValueMap: { [key: string]: number } = {
    excelente: 5,
    bueno: 4,
    regular: 3,
    malo: 2,
    pesimo: 1
  };

  // --- ACTUALIZADO: Preguntas con criterio_id ---
  // Asegúrate que estos criterio_id coincidan con tu base de datos
  const questions: Question[] = [
    { id: 'satisfaccion_general', label: 'Satisfacción General con el Docente', criterio_id: 1 },
    { id: 'metodologia', label: 'Metodología de Enseñanza', criterio_id: 2 },
    { id: 'comunicacion', label: 'Comunicación con los Estudiantes', criterio_id: 3 },
    { id: 'material_didactico', label: 'Calidad del Material Didáctico', criterio_id: 4 },
    { id: 'puntualidad', label: 'Puntualidad y Cumplimiento de Horarios', criterio_id: 5 },
    { id: 'respeto', label: 'Respeto y Trato hacia los Estudiantes', criterio_id: 6 },
    { id: 'organizacion', label: 'Organización y Estructura de las Clases', criterio_id: 7 },
    { id: 'claridad', label: 'Claridad en las Explicaciones', criterio_id: 8 },
    { id: 'retroalimentacion', label: 'Calidad de la Retroalimentación', criterio_id: 9 },
    { id: 'disponibilidad', label: 'Disponibilidad para Consultas', criterio_id: 10 }
  ];

  // Obtener lista de docentes
  useEffect(() => {
    axios.get("http://localhost:5000/api/docentes")
      .then(res => setTeachers(res.data))
      .catch(error => {
        console.error("Error al obtener docentes:", error);
        alert("Error al cargar la lista de docentes.");
      });
  }, []);

  // Obtener cursos del docente seleccionado
  useEffect(() => {
    if (selectedTeacherId !== null) {
      setIsLoadingCourses(true);
      setCourses([]);
      setSelectedCourseId(null);
      setFormErrors(prev => ({ ...prev, course: undefined }));
      axios.get(`http://localhost:5000/api/docentes/${selectedTeacherId}/cursos`)
        .then(res => setCourses(res.data))
        .catch(error => {
          console.error(`Error al obtener cursos para el docente ${selectedTeacherId}:`, error);
          setCourses([]);
          alert(`Error al cargar los cursos.`);
        })
        .finally(() => setIsLoadingCourses(false));
    } else {
      setCourses([]);
      setSelectedCourseId(null);
      setIsLoadingCourses(false);
    }
  }, [selectedTeacherId]);

  const evaluationOptions = [
    { value: 'excelente', label: 'Excelente' },
    { value: 'bueno', label: 'Bueno' },
    { value: 'regular', label: 'Regular' },
    { value: 'malo', label: 'Malo' },
    { value: 'pesimo', label: 'Pésimo' }
  ];

  const handleInputChange = (questionId: string, value: string) => {
    setFormData(prev => ({ ...prev, [questionId]: value }));
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
    const errors: typeof formErrors = {};

    // Validar si se pudo obtener el ID del estudiante (desde el hook useAuthStore)
    if (!estudiante_id) {
      errors.studentId = 'No se pudo identificar al estudiante. Asegúrate de haber iniciado sesión.';
    }

    if (!selectedTeacherId) errors.teacher = 'Por favor seleccione un docente';
    if (!selectedCourseId) errors.course = 'Por favor seleccione un curso';

    const unansweredQuestions = questions
      .filter(q => !formData[q.id])
      .map(q => q.id);
    if (unansweredQuestions.length > 0) errors.questions = unansweredQuestions;

    const commentText = comment.trim();
    const commentLength = commentText.length;
    const commentWordCount = getWordCount(commentText);
    if (commentLength === 0) errors.comment = 'Por favor ingrese un comentario sobre el docente';
    else if (commentLength < 77) errors.comment = `Comentario docente: Mínimo 77 caracteres (${commentLength})`;
    else if (commentWordCount < 10) errors.comment = `Comentario docente: Mínimo 10 palabras (${commentWordCount})`;

    const courseCommentText = courseComment.trim();
    const courseCommentLength = courseCommentText.length;
    const courseWordCount = getWordCount(courseCommentText);
    if (courseCommentLength === 0) errors.courseComment = 'Por favor ingrese un comentario sobre el curso';
    else if (courseCommentLength < 77) errors.courseComment = `Comentario curso: Mínimo 77 caracteres (${courseCommentLength})`;
    else if (courseWordCount < 10) errors.courseComment = `Comentario curso: Mínimo 10 palabras (${courseWordCount})`;

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // --- FUNCIÓN handleSubmit ACTUALIZADA con ID de estudiante desde useAuthStore ---
  const handleSubmit = async () => {
    // Primero, validar si tenemos el ID del estudiante ANTES de validar el resto del formulario
    if (!estudiante_id) {
      alert("Error: No se pudo identificar al estudiante. Asegúrate de haber iniciado sesión.");
      setFormErrors(prev => ({ ...prev, studentId: 'ID de estudiante no encontrado. Inicia sesión.' }));
      return; // Detener el envío si no hay ID
    }
    // Limpiar el error de studentId si ahora sí lo tenemos
    if (formErrors.studentId) {
      setFormErrors(prev => ({ ...prev, studentId: undefined }));
    }


    if (validateForm()) { // Ahora sí, validar el resto del formulario

      // Construir el payload según la estructura del backend
      const payload = {
        estudiante_id: estudiante_id, // Usar el ID obtenido del store
        docente_id: selectedTeacherId,
        curso_id: selectedCourseId,
        calificaciones: questions
          .map(q => ({
            criterio_id: q.criterio_id,
            valor: evaluationValueMap[formData[q.id]] || null
          }))
          .filter(c => c.valor !== null),
        comentarios: [
          { tipo: 'docente', texto: comment.trim() },
          { tipo: 'curso', texto: courseComment.trim() }
        ].filter(c => c.texto.length > 0) // Filtrar comentarios vacíos
      };

      console.log("Enviando payload:", JSON.stringify(payload, null, 2));

      try {
        const response = await axios.post('http://localhost:5000/api/evaluaciones', payload);

        console.log('✅ Evaluación enviada:', response.data);

        // Limpiar formulario y estados
        setFormData({
          satisfaccion_general: '', metodologia: '', comunicacion: '',
          material_didactico: '', puntualidad: '', respeto: '',
          organizacion: '', claridad: '', retroalimentacion: '',
          disponibilidad: ''
        });
        setComment('');
        setCourseComment('');
        setSelectedTeacherId(null);
        setFormErrors({});
        alert('✅ Evaluación enviada con éxito');

      } catch (error) {
        console.error('❌ Error al enviar evaluación:', error);
        let errorMsg = 'Hubo un error al enviar la evaluación.';
        if (axios.isAxiosError(error) && error.response?.data?.error) {
          errorMsg += ` Detalle: ${error.response.data.error}`;
        } else if (axios.isAxiosError(error) && error.response?.data?.message) { // A veces Flask envía 'message'
          errorMsg += ` Detalle: ${error.response.data.message}`;
        }
        alert(errorMsg + ' Por favor, inténtalo más tarde.');
      }
    } else {
      console.log("Errores de validación:", formErrors);
      // Si el único error es el studentId (que ya se mostró), no mostrar la alerta genérica.
      if (!formErrors.studentId || Object.keys(formErrors).length > 1) {
        alert("Por favor, corrija los errores marcados en el formulario.");
      }
    }
  };

  const wordCount = getWordCount(comment);
  const characterCount = comment.trim().length;
  const courseWordCount = getWordCount(courseComment);
  const courseCharacterCount = courseComment.trim().length;

  return (
    <div className={`space-y-8 max-w-4xl mx-auto p-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>
      {/* Mensaje de error si no se encuentra el ID del estudiante */}
      {formErrors.studentId && (
        <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 text-center" role="alert">
          <span className="font-medium">Error de Autenticación:</span> {formErrors.studentId}
        </div>
      )}

      {/* Selección de Docente */}
      <div className="mt-6 max-w-xl mx-auto">
        <label htmlFor="teacherSelect" className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
          Seleccione un Docente:
        </label>
        <select
          id="teacherSelect"
          value={selectedTeacherId ?? ''}
          onChange={(e) => {
            const id = e.target.value ? parseInt(e.target.value) : null;
            setSelectedTeacherId(id);
            if (formErrors.teacher) {
              setFormErrors(prev => ({ ...prev, teacher: undefined }));
            }
          }}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} ${formErrors.teacher ? 'border-red-500 ring-red-500' : isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}
        >
          <option value="">-- Seleccione un docente --</option>
          {teachers.map((doc) => (
            <option key={doc.id} value={doc.id}>{doc.nombre}</option>
          ))}
        </select>
        {formErrors.teacher && (
          <p className="mt-1 text-sm text-red-500">{formErrors.teacher}</p>
        )}
      </div>

      {/* Selección de Curso */}
      {selectedTeacherId && (
        <div className="mt-6 max-w-xl mx-auto">
          <label htmlFor="courseSelect" className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
            Seleccione un Curso:
          </label>
          {isLoadingCourses ? (
            <div className={`text-center p-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cargando cursos...</div>
          ) : courses.length > 0 ? (
            <select
              id="courseSelect"
              value={selectedCourseId ?? ''}
              onChange={(e) => {
                const courseId = e.target.value ? parseInt(e.target.value) : null;
                setSelectedCourseId(courseId);
                if (formErrors.course) {
                  setFormErrors(prev => ({ ...prev, course: undefined }));
                }
              }}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} ${formErrors.course ? 'border-red-500 ring-red-500' : isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}
            >
              <option value="">-- Seleccione un curso --</option>
              {courses.map((curso) => (
                <option key={curso.id} value={curso.id}>
                  {curso.nombre}
                </option>
              ))}
            </select>
          ) : (
            <div className={`text-center p-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Este docente no tiene cursos asignados.</div>
          )}
          {formErrors.course && !isLoadingCourses && (
            <p className="mt-1 text-sm text-red-500">{formErrors.course}</p>
          )}
        </div>
      )}

      {/* Renderizar secciones de evaluación */}
      {selectedTeacherId && selectedCourseId && (
        <>
          {/* Cuestionario */}
          <section className={`rounded-lg shadow-md p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-xl font-semibold text-center mb-6">Cuestionario de Evaluación</h2>
            <div className="space-y-6">
              {questions.map((question) => (
                <div key={question.id} className={`border-b pb-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {question.label}
                    {formErrors.questions?.includes(question.id) && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {evaluationOptions.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center justify-center text-center p-3 border rounded-md cursor-pointer transition-all text-sm
                          ${formData[question.id] === option.value
                            ? "bg-blue-600 border-blue-700 text-white font-medium"
                            : formErrors.questions?.includes(question.id)
                              ? `${isDarkMode ? 'border-red-400 bg-gray-700 hover:bg-red-900/50' : 'border-red-300 bg-white hover:bg-red-50'}`
                              : `${isDarkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-white border-gray-300 hover:bg-gray-100'}`
                          }`}
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={option.value}
                          checked={formData[question.id] === option.value}
                          onChange={(e) => handleInputChange(question.id, e.target.value)}
                          className="hidden"
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                  {formErrors.questions?.includes(question.id) && (
                    <p className="mt-1 text-xs text-red-500">Selección requerida</p>
                  )}
                </div>
              ))}
            </div>
            {formErrors.questions && formErrors.questions.length > 0 && (
              <p className="mt-4 text-sm text-red-500 text-center">
                Por favor responda todas las preguntas marcadas con *
              </p>
            )}
          </section>

          {/* Comentarios */}
          <section className={`rounded-lg shadow-md p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            {/* Comentario Curso */}
            <h2 className="text-xl font-semibold text-center mb-4">Comentario sobre el Curso</h2>
            <div>
              <textarea
                value={courseComment}
                onChange={(e) => {
                  setCourseComment(e.target.value);
                  if (formErrors.courseComment) {
                    setFormErrors((prev) => ({ ...prev, courseComment: undefined }));
                  }
                }}
                placeholder="Comparte tu opinión sobre el curso (mínimo 77 caracteres y 10 palabras)..."
                className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${isDarkMode ? 'bg-gray-700 border-gray-600 placeholder-gray-400' : 'bg-white border-gray-300 placeholder-gray-500'}
                  ${formErrors.courseComment ? "border-red-500 ring-red-500" : isDarkMode ? "border-gray-600" : "border-gray-300"}
                  `}
                rows={4}
                aria-label="Comentario sobre el curso"
              />
              <div className="flex justify-between text-xs mt-2">
                <span className={courseCharacterCount < 77 ? "text-red-500" : "text-green-500"}>
                  Caracteres: {courseCharacterCount}/77 mín.
                </span>
                <span className={courseWordCount < 10 ? "text-red-500" : "text-green-500"}>
                  Palabras: {courseWordCount}/10 mín.
                </span>
              </div>
              {formErrors.courseComment && (
                <p className="text-sm text-red-500 mt-1">{formErrors.courseComment}</p>
              )}
            </div>

            {/* Comentario Docente */}
            <h2 className="text-xl font-semibold text-center mt-6 mb-4">Comentario sobre el Docente</h2>
            <div>
              <textarea
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                  if (formErrors.comment) {
                    setFormErrors((prev) => ({ ...prev, comment: undefined }));
                  }
                }}
                placeholder="Comparte tu experiencia con el docente (mínimo 77 caracteres y 10 palabras)..."
                className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                   ${isDarkMode ? 'bg-gray-700 border-gray-600 placeholder-gray-400' : 'bg-white border-gray-300 placeholder-gray-500'}
                   ${formErrors.comment ? "border-red-500 ring-red-500" : isDarkMode ? "border-gray-600" : "border-gray-300"}
                   `}
                rows={4}
                aria-label="Comentario sobre el docente"
              />
              <div className="flex justify-between text-xs mt-2">
                <span className={` ${characterCount < 77 ? "text-red-500" : "text-green-500"}`}>
                  Caracteres: {characterCount}/77 mín.
                </span>
                <span className={` ${wordCount < 10 ? "text-red-500" : "text-green-500"}`}>
                  Palabras: {wordCount}/10 mín.
                </span>
              </div>
              {formErrors.comment && (
                <p className="text-sm text-red-500 mt-1">{formErrors.comment}</p>
              )}
            </div>
            <p className={`text-sm text-center mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Tu evaluación será procesada de forma anónima.
            </p>
          </section>

          {/* Botón de Envío */}
          <section className="flex justify-center sticky bottom-4 z-10 px-4">
            <button
              onClick={handleSubmit}
              // Deshabilitar si no hay ID de estudiante o si hay otros errores
              disabled={!estudiante_id || (Object.keys(formErrors).length > 0 && Object.keys(formErrors).some(k => formErrors[k as keyof typeof formErrors] !== undefined))}
              className={`flex items-center justify-center w-full max-w-xs px-6 py-3 rounded-md font-medium shadow-lg transition duration-200 ease-in-out
                ${isDarkMode
                  ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:bg-blue-800 disabled:text-gray-400'
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-500 disabled:bg-blue-300 disabled:text-gray-500'
                }
                disabled:cursor-not-allowed disabled:opacity-70`}
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
