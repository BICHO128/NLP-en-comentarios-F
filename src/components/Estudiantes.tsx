import { useState, useEffect } from 'react';
import { Send, Loader } from 'lucide-react';
import axios from 'axios';
import { useDarkMode } from '../hooks/useDarkMode';
import { useAuthStore } from '../stores/Autenticacion'; // Importa el hook de autenticación
import { toast } from 'react-toastify'; // Importar react-toastify
import 'react-toastify/dist/ReactToastify.css'; // Importar estilos de react-toastify

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
  const [isSubmitting, setIsSubmitting] = useState(false); // Nuevo estado para manejar el envío
  const { isDarkMode } = useDarkMode();
  const [isCheckingGrammar, setIsCheckingGrammar] = useState(false); // Estado para manejar la validación gramatical
  const [grammarErrors, setGrammarErrors] = useState<{ comment?: boolean; courseComment?: boolean }>({});

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

  // Permite letras, espacios, comas, puntos, signos de exclamación/interrogación y tildes
  const sanitizeComment = (text: string) =>
    text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ ,;".!¡]/g, '');

  // Función para validar ortografía y gramática usando una API externa
  const validateGrammar = async (text: string): Promise<string | null> => {
    try {
      const params = new URLSearchParams();
      params.append('text', text);
      params.append('language', 'es');

      const response = await fetch('https://api.languagetool.org/v2/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
      });

      if (!response.ok) {
        return 'No se pudo validar la gramática. Intenta nuevamente.';
      }

      const data = await response.json();
      if (data.matches && data.matches.length > 0) {
        return 'El texto contiene errores gramáticales o de ortografía. Por favor, corrige los errores.';
      }
      return null;
    } catch {
      return 'No se pudo validar la gramática. Intenta nuevamente.';
    }
  };

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
        toast.error("Error al obtener docentes: " + (error?.message || "Error desconocido"));
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
        .catch(() => {
          toast.error("Error al cargar los cursos del docente. Inténtalo más tarde.");
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
    { value: 'pesimo', label: 'Muy malo' }
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
    if (!estudiante_id) {
      toast.error("Error: No se pudo identificar al estudiante. Asegúrate de haber iniciado sesión.");
      setFormErrors(prev => ({ ...prev, studentId: 'ID de estudiante no encontrado. Inicia sesión.' }));
      return;
    }

    if (validateForm()) {
      setIsCheckingGrammar(true);

      // Validar gramática de los comentarios
      const commentError = await validateGrammar(comment.trim());
      const courseCommentError = await validateGrammar(courseComment.trim());

      setIsCheckingGrammar(false);

      // Consolidar errores en un solo mensaje
      if (commentError || courseCommentError) {
        setGrammarErrors({
          comment: !!commentError,
          courseComment: !!courseCommentError
        });
        let errorMessage =
          "Por favor , corrige tú ortagrafía o gramática en el comentario \n";
        if (commentError && courseCommentError) {
          errorMessage += '\ndel "Docente" y \n del "Curso".\n';
        } else if (commentError) {
          errorMessage += 'del "Docente"';
        } else if (courseCommentError) {
          errorMessage += 'del "Curso."';
        }
        toast.error(errorMessage.trim());
        return; // Detener el envío si hay errores
      } else {
        setGrammarErrors({});
      }

      // Si no hay errores, proceder con el envío
      setIsSubmitting(true);
      const payload = {
        estudiante_id,
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
        ].filter(c => c.texto.length > 0)
      };

      try {
        await axios.post('http://localhost:5000/api/evaluaciones', payload);

        toast.success("Evaluación enviada con éxito.", {
          className: "bg-green-100 text-green-800 font-medium rounded-lg shadow-md text-sm",
          progressClassName: "bg-green-500",
          position: "top-right", // Posiciona el mensaje en la esquina superior derecha
          style: { marginTop: "4rem" }, // Agrega un margen superior para evitar que tape el header
        });
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
        setSelectedCourseId(null);
        setFormErrors({});
      } catch {
        toast.error("Hubo un error al enviar la evaluación. Inténtalo más tarde.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      toast.error(
        "Por favor, corrige los errores marcados en el formulario. Debes completar todos los campos."
      );
    }
  };

  const isFormValid = () => {
    if (!estudiante_id || !selectedTeacherId || !selectedCourseId) return false;

    const allQuestionsAnswered = questions.every(q => formData[q.id]);
    const isCommentValid = comment.trim().length >= 77 && getWordCount(comment) >= 10;
    const isCourseCommentValid = courseComment.trim().length >= 77 && getWordCount(courseComment) >= 10;

    return allQuestionsAnswered && isCommentValid && isCourseCommentValid;
  };

  const wordCount = getWordCount(comment);
  const characterCount = comment.trim().length;
  const courseWordCount = getWordCount(courseComment);
  const courseCharacterCount = courseComment.trim().length;

  return (
    <div
      className={`space-y-8 max-w-4xs mx-auto p-4 ${isDarkMode ? "text-white" : "text-black"
        }`}
    >


      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-lg">
            <Loader className="w-8 h-8 mb-4 text-blue-600 animate-spin" />
            <p className="text-lg font-medium text-gray-700">
              Un momentico, se está enviando la evaluación...
            </p>
          </div>
        </div>
      )}

      {/* Mensaje de error si no se encuentra el ID del estudiante */}
      {formErrors.studentId && (
        <div
          className="p-4 mb-4 text-sm text-center text-red-800 rounded-2xl bg-red-50 dark:bg-gray-800 dark:text-red-400"
          role="alert"
        >
          <span className="font-medium">Error de Autenticación:</span>{" "}
          {formErrors.studentId}
        </div>
      )}

      <div
        className={`
          flex flex-col md:flex-row items-stretch justify-center gap-4
          bg-gradient-to-br from-blue-100 via-white to-blue-50
          border border-blue-200 rounded-3xl shadow-lg p-4 mb-8
          transition-all duration-300 hover:shadow-blue-200 hover:scale-[1.01] animate-fade-in
          ${isDarkMode ? "bg-gray-800 border-gray-700 shadow-gray-900" : ""}
        `}
      >
        {/* Selección de Docente */}
        <div className="flex flex-col justify-center flex-1 px-2 my-auto animate-fade-in">
          <label
            htmlFor="teacherSelect"
            className={`block text-base md:text-lg font-medium mb-1 ${isDarkMode ? "text-black" : "text-black"
              }`}
          >
            Seleccione un Docente:
          </label>
          <select
            id="teacherSelect"
            value={selectedTeacherId ?? ""}
            onChange={(e) => {
              const id = e.target.value ? parseInt(e.target.value) : null;
              setSelectedTeacherId(id);
              if (formErrors.teacher) {
                setFormErrors((prev) => ({ ...prev, teacher: undefined }));
              }
            }}
            className={`
                  w-full px-4 py-2 border rounded-2xl font-medium cursor-pointer text-xl
                  hover:scale-105 focus:scale-105 hover:z-10 focus:z-10 hover:shadow-lg focus:shadow-lg transition-all duration-200 
                  ${formErrors.teacher
                ? isDarkMode
                  ? "border-red-400 bg-gray-500 hover:bg-red-900/50 text-white "
                  : "border-red-300 bg-white hover:bg-red-50 text-red-700"
                : selectedTeacherId
                  ? isDarkMode
                    ? "bg-gray-800 border-white text-white placeholder-gray-400 shadow-gray-800 shadow-lg"
                    : "bg-white border-blue-300 text-blue-900 placeholder-gray-500 shadow-blue-400 shadow-lg"
                  : isDarkMode
                    ? "bg-gray-800 border-white text-white placeholder-gray-400 shadow-gray-800 shadow-lg"
                    : "bg-white border-blue-300 text-blue-900 placeholder-gray-500 shadow-blue-400 shadow-lg"
              }
                `}
          >
            <option value="">-- Seleccione un docente --</option>
            {teachers.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.nombre}
              </option>
            ))}
          </select>
          {formErrors.teacher && (
            <p className="mt-1 text-sm text-red-500">{formErrors.teacher}</p>
          )}
        </div>

        {/* Selección de Curso */}
        <div className="flex flex-col justify-center flex-1 px-2 my-auto animate-fade-in">
          <label
            htmlFor="courseSelect"
            className={`block text-base md:text-lg font-medium mb-1 ${isDarkMode ? "text-black" : "text-black"
              }`}
          >
            Seleccione un Curso:
          </label>
          {isLoadingCourses ? (
            <div
              className={`text-center p-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
            >
              Cargando cursos...
            </div>
          ) : courses.length > 0 ? (
            <select
              id="courseSelect"
              value={selectedCourseId ?? ""}
              onChange={(e) => {
                const courseId = e.target.value
                  ? parseInt(e.target.value)
                  : null;
                setSelectedCourseId(courseId);
                if (formErrors.course) {
                  setFormErrors((prev) => ({ ...prev, course: undefined }));
                }
              }}
              className={`
                  w-full px-3 py-2 border rounded-2xl font-medium cursor-pointer text-xl
                  hover:scale-105 focus:scale-105 hover:z-10 focus:z-10 hover:shadow-lg focus:shadow-lg transition-all duration-200 
                  ${formErrors.course
                  ? isDarkMode
                    ? "border-red-400 bg-gray-500 hover:bg-red-900/50 text-white "
                    : "border-red-300 bg-white hover:bg-red-50 text-red-700"
                  : selectedCourseId
                    ? isDarkMode
                      ? "bg-gray-800 border-white text-white placeholder-gray-400 shadow-gray-800 shadow-lg"
                      : "bg-white border-blue-300 text-blue-900 placeholder-gray-500 shadow-blue-400 shadow-lg"
                    : isDarkMode
                      ? "bg-gray-800 border-white text-white placeholder-gray-400 shadow-gray-800 shadow-lg"
                      : "bg-white border-blue-300 text-blue-900 placeholder-gray-500 shadow-blue-400 shadow-lg"
                }
                `}
            >
              <option value="">-- Seleccione un curso --</option>
              {courses.map((curso) => (
                <option key={curso.id} value={curso.id}>
                  {curso.nombre}
                </option>
              ))}
            </select>
          ) : (
            <div
              className={`text-center p-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
            >
              Este docente no tiene cursos asignados.
            </div>
          )}
          {formErrors.course && !isLoadingCourses && (
            <p className="mt-1 text-sm text-red-500">{formErrors.course}</p>
          )}
        </div>
      </div>

      {/* Renderizar secciones de evaluación */}
      {selectedTeacherId && selectedCourseId && (
        <>
          {/* Cuestionario */}
          <section
            className={`
                rounded-3xl shadow-xl p-6 mb-6 border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-blue-100
                transition-all duration-500 hover:shadow-blue-200 hover:scale-[1.015] hover:border-blue-300
                animate-fade-in
                ${isDarkMode
                ? "bg-blue-800 border-blue-700 shadow-blue-400"
                : ""
              }
              `}
          >
            <h2
              className={`text-2xl font-semibold text-center mb-6 ${isDarkMode ? "text-gray-700" : "text-gray-700"
                }`}
            >
              Cuestionario de Evaluación
            </h2>
            <div className="space-y-6">
              {questions.map((question) => (
                <div
                  key={question.id}
                  className={`border-b pb-4 ${isDarkMode ? "border-blue-400" : "border-blue-400"
                    }`}
                >
                  <label
                    className={`block text-lg font-medium mb-2 ${isDarkMode ? "text-gray-800" : "text-gray-700"
                      }`}
                  >
                    {question.label}
                    {formErrors.questions?.includes(question.id) && (
                      <span className="ml-1 text-red-500">*</span>
                    )}
                  </label>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                    {evaluationOptions.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center justify-center text-center p-3 border rounded-2xl cursor-pointer text-sm
                        hover:scale-125 focus-within:scale-105 hover:z-10 focus-within:z-10 hover:shadow-lg focus-within:shadow-lg transition-all duration-200
                        ${formData[question.id] === option.value
                            ? "bg-blue-300 border-blue-700 text-blue-700 font-medium shadow-blue-400 shadow-lg"
                            : formErrors.questions?.includes(question.id)
                              ? `${isDarkMode
                                ? "border-red-400 bg-blue-700 hover:bg-red-900/50"
                                : "border-red-300 bg-white hover:bg-red-50"
                              }`
                              : `${isDarkMode
                                ? "bg-white border-blue-700 hover:bg-blue-100 shadow-blue-300 shadow-md text-blue-700"
                                : "bg-white border-blue-700 hover:bg-blue-100 shadow-blue-300 shadow-md text-blue-700"
                              }`
                          }`}
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={option.value}
                          checked={formData[question.id] === option.value}
                          onChange={(e) =>
                            handleInputChange(question.id, e.target.value)
                          }
                          className="hidden"
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                  {formErrors.questions?.includes(question.id) && (
                    <p className="mt-1 text-xs text-red-500">
                      Selección requerida
                    </p>
                  )}
                </div>
              ))}
            </div>
            {formErrors.questions && formErrors.questions.length > 0 && (
              <p className="mt-4 text-sm text-center text-red-500">
                Por favor responda todas las preguntas marcadas con *
              </p>
            )}
          </section>

          {/* Comentario Curso */}
          <section
            className={`
                rounded-3xl shadow-xl p-6 mb-6 border border-blue-100 bg-gradient-to-br from-blue-100 via-white to-blue-50 
                transition-all duration-500 hover:shadow-blue-200 hover:scale-[1.015] hover:border-blue-300
                animate-fade-in
                ${isDarkMode
                ? "bg-white border-blue-400"
                : ""
              }
              `}
          >
            <h2
              className={`text-2xl font-semibold text-center mb-4 ${isDarkMode ? "text-gray-700" : "text-gray-700"
                }`}
            >
              Comentario sobre el Curso
            </h2>
            <div>
              {/* // Modificar el evento onChange de los comentarios para eliminar mensajes dinámicamente */}
              <textarea
                value={courseComment}
                onChange={(e) =>
                  setCourseComment(sanitizeComment(e.target.value))
                } // Solo actualiza el estado
                placeholder="Comparte tu opinión sobre el curso (mínimo 77 caracteres y 10 palabras)..."
                className={`w-full px-4 py-3 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500transition-all duration-200  hover:scale-105 focus:scale-105 hover:shadow-lg focus:shadow-lg
                    ${isDarkMode
                    ? "bg-white border-blue-400 placeholder-gray-500 text-black text-lg"
                    : "bg-white border-blue-400 placeholder-gray-500 text-black text-lg"
                  }
                    ${formErrors.courseComment
                    ? "border-red-500 ring-red-500"
                    : isDarkMode
                      ? "border-blue-400"
                      : "border-blue-400"
                  }
                  `}
                rows={4}
                aria-label="Comentario sobre el curso"
              />
              <div className="flex justify-between mt-2 text-lg">
                <span
                  className={
                    courseCharacterCount < 77
                      ? "text-red-500"
                      : "text-green-500"
                  }
                >
                  Caracteres: {courseCharacterCount}/77 mín.
                </span>
                <span
                  className={
                    courseWordCount < 10 ? "text-red-500" : "text-green-500"
                  }
                >
                  Palabras: {courseWordCount}/10 mín.
                </span>

              </div>
              {grammarErrors.courseComment && (
                <div className="mt-1 text-lg text-start text-red-500">
                  Verifica que el autocorrector del navegador esté activado y
                  corrige los errores gramaticales. 🧐
                </div>
              )}
            </div>
          </section>

          {/* Comentario Docente */}
          <section
            className={`
                rounded-3xl shadow-xl p-6 border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-blue-100
                transition-all duration-500 hover:shadow-blue-200 hover:scale-[1.015] hover:border-blue-300
                animate-fade-in
                ${isDarkMode
                ? "bg-white border-blue-400"
                : ""
              }
              `}
          >
            <h2
              className={`text-2xl font-semibold text-center mb-4 ${isDarkMode ? "text-gray-700" : "text-gray-700"
                }`}
            >
              Comentario sobre el Docente
            </h2>
            <div>
              <textarea
                value={comment}
                onChange={(e) => setComment(sanitizeComment(e.target.value))} // Solo actualiza el estado
                placeholder="Comparte tu experiencia con el docente (mínimo 77 caracteres y 10 palabras)..."
                className={`w-full px-4 py-3 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200  hover:scale-105 focus:scale-105 hover:shadow-lg focus:shadow-lg
                  ${isDarkMode
                    ? "bg-white border-gray-400 placeholder-gray-500 text-lg text-black"
                    : "bg-white border-gray-400 placeholder-gray-500 text-lg"
                  }
                  ${formErrors.comment
                    ? "border-red-500 ring-red-500"
                    : isDarkMode
                      ? "border-blue-400"
                      : "border-blue-400"
                  }
                `}
                rows={4}
                aria-label="Comentario sobre el docente"
              />
              <div className="flex justify-between mt-2 text-lg">
                <span
                  className={` ${characterCount < 77 ? "text-red-500" : "text-green-500"
                    }`}
                >
                  Caracteres: {characterCount}/77 mín.
                </span>
                <span
                  className={` ${wordCount < 10 ? "text-red-500" : "text-green-500"
                    }`}
                >
                  Palabras: {wordCount}/10 mín.
                </span>

              </div>
              {grammarErrors.comment && (
                <div className="mt-1 text-lg text-start text-red-500">
                  Verifica que el autocorrector del navegador esté activado y
                  corrige los errores gramaticales. 🧐
                </div>
              )}
            </div>
          </section>

          {/* Botón de Envío */}
          <section className="sticky z-10 flex justify-center px-4 bottom-4">
            <button
              onClick={handleSubmit}
              disabled={!isFormValid() || isSubmitting || isCheckingGrammar}
              className={`flex items-center justify-center w-full max-w-xs px-6 py-3 rounded-2xl font-medium shadow-lg
              transition duration-200 ease-in-out
              hover:scale-105 focus:scale-105 hover:shadow-xl focus:shadow-xl
              ${isDarkMode
                  ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-400 disabled:bg-gray-400 disabled:text-white"
                  : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-400 disabled:bg-gray-400 disabled:text-white"
                }
              disabled:cursor-not-allowed disabled:opacity-70`}
            >
              <Send className="w-5 h-5 mr-2" />
              {isSubmitting || isCheckingGrammar
                ? "Validando..."
                : "Enviar Evaluación"}
            </button>
          </section>
        </>
      )}
    </div>
  );
};

export default Estudiantes;
