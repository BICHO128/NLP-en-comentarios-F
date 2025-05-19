import { useState, useEffect, ChangeEvent, useRef } from 'react';
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
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// Añade esta importación al inicio del archivo
import AdminSidebar from '../components/admin-sidebar';
import { Menu } from 'lucide-react';



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
interface Calificacion {
  criterio: string;
  valor: number;
}

interface DocenteConCursos {
  id: number;
  docente_id: number;
  nombre: string;
  cursos: Curso[];
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
  calificaciones: Calificacion[];
}

interface Docente {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
}

interface CursoSimple {
  id: number;
  nombre: string;
}

const cursoLabels = ['Metodología', 'Material Didáctico', 'Claridad', 'Retroalimentación'];
const cursoKeys = ['metodologia', 'material_didactico', 'claridad', 'retroalimentacion'];

const docenteLabels = ['Satisfacción General', 'Comunicación', 'Puntualidad', 'Respeto', 'Disponibilidad'];
const docenteKeys = ['satisfaccion_general', 'comunicacion', 'puntualidad', 'respeto', 'disponibilidad'];


export default function Administrador() {
  const [docentesConCursos, setDocentesConCursos] = useState<DocenteConCursos[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [mostrarEvaluaciones, setMostrarEvaluaciones] = useState(false);
  const [filtroDocente, setFiltroDocente] = useState<'todos' | 'positivo' | 'neutral' | 'negativo'>('todos');
  const [filtroCurso, setFiltroCurso] = useState<'todos' | 'positivo' | 'neutral' | 'negativo'>('todos');
  const { isDarkMode } = useDarkMode();
  const { token } = useAuthStore();

  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // --- PANEL DE ADMINISTRACIÓN ---
  const API_URL = 'http://127.0.0.1:5000/api/admin';
  const [tab, setTab] = useState<' ' | 'estudiante' | 'docente' | 'asignar' | 'curso'>(' ');
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [cursos, setCursos] = useState<CursoSimple[]>([]);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string | string[]>>({});
  const [loading, setLoading] = useState(false);


  // Función para cerrar el formulario al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node) && activeForm) {
        // Solo cerramos si no es un clic en el sidebar o en un botón que abre el formulario
        const target = event.target as HTMLElement;
        if (!target.closest('[data-sidebar="true"]') && !target.closest('[data-form-trigger="true"]')) {
          setActiveForm(null);
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeForm]);

  // Evitar scroll en el body cuando el sidebar móvil está abierto
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);


  // Función para renderizar el formulario adecuado según la selección
  // Añade esta función dentro de tu componente Administrador
  // Función para renderizar el formulario adecuado según la selección
  function renderActiveForm() {
    if (!activeForm) return null;

    let formContent;

    switch (activeForm) {
      case "crear-estudiante":
        formContent = (
          <>
            <h2 className="mb-6 text-2xl font-bold">Crear Estudiante</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input name="username" placeholder="Usuario" onChange={handleChange} required className="w-full px-4 py-2 transition border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white dark:border-gray-600 input" />
              <input name="email" type="email" placeholder="Email" onChange={handleChange} required className="w-full px-4 py-2 transition border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white dark:border-gray-600 input" />
              <input name="password" type="password" placeholder="Contraseña" onChange={handleChange} required className="w-full px-4 py-2 transition border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white dark:border-gray-600 input" />
              <input name="first_name" placeholder="Nombres" onChange={handleChange} required className="w-full px-4 py-2 transition border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white dark:border-gray-600 input" />
              <input name="last_name" placeholder="Apellidos" onChange={handleChange} required className="w-full px-4 py-2 transition border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white dark:border-gray-600 input" />
              <button type="submit" className="w-full px-4 py-2 transition border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white dark:border-gray-600 btn-primary">Crear Estudiante</button>
            </form>
          </>
        );
        break;
      case "crear-docente":
        formContent = (
          <>
            <h2 className="mb-6 text-2xl font-bold">Crear Docente</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input name="username" placeholder="Usuario" onChange={handleChange} required className="w-full px-4 py-2 transition border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white dark:border-gray-600 input" />
              <input name="email" type="email" placeholder="Email" onChange={handleChange} required className="w-full px-4 py-2 transition border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white dark:border-gray-600 input" />
              <input name="password" type="password" placeholder="Contraseña" onChange={handleChange} required className="w-full px-4 py-2 transition border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white dark:border-gray-600 input" />
              <input name="first_name" placeholder="Nombres" onChange={handleChange} required className="w-full px-4 py-2 transition border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white dark:border-gray-600 input" />
              <input name="last_name" placeholder="Apellidos" onChange={handleChange} required className="w-full px-4 py-2 transition border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white dark:border-gray-600 input" />
              <button type="submit" className="w-full px-4 py-2 transition border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white dark:border-gray-600 btn-primary">Crear Docente</button>
            </form>
          </>
        );
        break;
      case "crear-curso":
        formContent = (
          <>
            <h2 className="mb-6 text-2xl font-bold">Crear Curso</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input name="nombre" placeholder="Nombre del Curso" onChange={handleChange} required className="w-full px-4 py-2 transition border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white dark:border-gray-600 input" />
              <button type="submit" className="w-full px-4 py-2 transition border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white dark:border-gray-600 btn-primary">Crear Curso</button>
            </form>
          </>
        );
        break;
      // Añade los demás casos según necesites

      default:
        return null;
    }

    return (
      <div
        ref={formRef}
        className={`
          bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 
          max-w-md mx-auto w-full mt-6
          transition-all duration-300
          ${isDarkMode ? 'border border-gray-700' : 'border border-gray-200'}
        `}
      >
        {/* Tu contenido de formulario */}
        {formContent}
      </div>
    );
  }

  function DocentesDropdown({ docentes, value, onChange }: { docentes: Docente[]; value: string; onChange: (v: string) => void; }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (ref.current && !ref.current.contains(event.target as Node)) {
          setOpen(false);
        }
      }
      if (open) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [open]);

    const selectedDocente = docentes.find(d => String(d.id) === value);

    return (
      <div className="relative" ref={ref}>
        <button
          type="button"
          className="w-full px-4 py-2 text-left bg-gray-100 border rounded-lg shadow dark:bg-gray-800 focus:outline-none"
          onClick={() => setOpen(!open)}
        >
          {selectedDocente
            ? `${selectedDocente.first_name} ${selectedDocente.last_name}`
            : 'Seleccione Docente'}
        </button>
        {open && (
          <div className="absolute z-10 w-full mt-2 overflow-auto bg-white border rounded-lg shadow-lg dark:bg-gray-900 max-h-60 animate-fade-in">
            {docentes.map(docente => (
              <div
                key={docente.id}
                className={`px-4 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-800 transition
                ${value === String(docente.id) ? 'bg-blue-200 dark:bg-blue-700 text-blue-900 dark:text-white' : ''}`}
                onClick={() => {
                  onChange(String(docente.id));
                  setOpen(false);
                }}
              >
                {docente.first_name} {docente.last_name}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function CursosDropdown({
    cursos,
    value,
    onChange,
  }: {
    cursos: CursoSimple[];
    value: string[];
    onChange: (v: string[]) => void;
  }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (ref.current && !ref.current.contains(event.target as Node)) {
          setOpen(false);
        }
      }
      if (open) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [open]);

    return (
      <div className="relative" ref={ref}>
        <button
          type="button"
          className="w-full px-4 py-2 bg-gray-100 border rounded-lg shadow dark:bg-gray-800 focus:outline-none"
          onClick={() => setOpen(!open)}
        >
          {value.length > 0
            ? cursos.filter(c => value.includes(String(c.id))).map(c => c.nombre).join(', ')
            : 'Seleccione curso(s)'}
        </button>
        {open && (
          <div className="absolute z-10 w-full mt-2 overflow-auto bg-white border rounded-lg shadow-lg dark:bg-gray-900 max-h-60 animate-fade-in">
            {cursos.map(curso => (
              <div
                key={curso.id}
                className={`px-4 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-800 transition
                ${value.includes(String(curso.id)) ? 'bg-blue-200 dark:bg-blue-700 text-blue-900 dark:text-white' : ''}`}
                onClick={() => {
                  if (value.includes(String(curso.id))) {
                    onChange(value.filter(id => id !== String(curso.id)));
                  } else {
                    onChange([...value, String(curso.id)]);
                  }
                }}
              >
                {curso.nombre}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Al inicio del componente
  const adminPanelRef = useRef<HTMLDivElement>(null);

  // Efecto para cerrar el formulario al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        tab &&
        adminPanelRef.current &&
        !adminPanelRef.current.contains(event.target as Node)
      ) {
        setTab(' ');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [tab]);

  useEffect(() => {
    fetch(`${API_URL}/listar-docentes`)
      .then(res => {
        if (!res.ok) throw new Error('No se pudo cargar docentes');
        return res.json();
      })
      .then(setDocentes)
      .catch(() => {
        toast.error("Error al obtener docentes");
      });

    fetch(`${API_URL}/listar-cursos`)
      .then(res => {
        if (!res.ok) throw new Error('No se pudo cargar cursos');
        return res.json();
      })
      .then(setCursos)
      .catch(() => {
        toast.error("Error al obtener cursos");
      });
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({
      ...form,
      [e.target.name]: e.target.type === 'select-multiple'
        ? Array.from((e.target as HTMLSelectElement).selectedOptions).map(opt => opt.value)
        : e.target.value,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMensaje(null);
    setLoading(true);
    try {
      let endpoint = '';
      let body = {};

      if (tab === 'estudiante') {
        endpoint = '/crear-estudiante';
        body = form;
      }
      if (tab === 'curso') {
        endpoint = '/crear-curso';
        body = { nombre: form.nombre };
      }
      if (tab === 'docente') {
        endpoint = '/crear-docente';
        body = form;
      }
      if (tab === 'asignar') {
        endpoint = '/asignar-cursos-docente';
        body = {
          docente_id: Number(form.docente_id),
          cursos_ids: Array.isArray(form.cursos_ids) ? form.cursos_ids.map(Number) : [Number(form.cursos_ids)],
        };
      }

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setMensaje(data.msg || data.error || '¡Acción realizada!');
    }
    catch {
      toast.error("Error al crear usuario o curso");
    } finally {
      setLoading(false);
    }
  }

  function renderForm() {
    if (tab === 'estudiante') {
      return (
        <div ref={adminPanelRef} className={`
            flex flex-col md:flex-row items-stretch justify-center gap-4
            bg-gradient-to-br from-blue-100 via-white to-blue-50
            border border-blue-200 rounded-2xl shadow-lg p-4 mb-8
            transition-all duration-300 hover:shadow-blue-200 hover:scale-[1.01] animate-fade-in
            ${isDarkMode ? "bg-gray-800 border-gray-700 shadow-gray-900" : "bg-gray-600 border-gray-500 shadow-gray-400"}
          `}
        >
          <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center w-full max-w-lg gap-4">
            <input name="username" placeholder="Usuario" onChange={handleChange} required className="w-full px-4 py-2 transition border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white dark:border-gray-600 input" />
            <input name="email" type="email" placeholder="Email" onChange={handleChange} required className="w-full px-4 py-2 transition border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white dark:border-gray-600 input" />
            <input name="password" type="password" placeholder="Contraseña" onChange={handleChange} required className="w-full px-4 py-2 transition border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white dark:border-gray-600 input" />
            <input name="first_name" placeholder="Nombres" onChange={handleChange} required className="w-full px-4 py-2 transition border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white dark:border-gray-600 input" />
            <input name="last_name" placeholder="Apellidos" onChange={handleChange} required className="w-full px-4 py-2 transition border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white dark:border-gray-600 input" />
            <button type="submit" className="w-full px-4 py-2 transition border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white dark:border-gray-600 btn-primary">Crear Estudiante</button>
          </form>
        </div>
      );
    }

    if (tab === 'curso') {
      return (
        <div ref={adminPanelRef} className={`
            flex justify-center items-center min-h-[200px] py-8
            bg-gradient-to-br from-blue-100 via-white to-blue-50
            border border-blue-200 rounded-2xl shadow-lg
            transition-all duration-300 hover:shadow-blue-200 hover:scale-[1.01] animate-fade-in
            ${isDarkMode ? "bg-gray-800 border-gray-700 shadow-gray-900" : ""}
          `}
        >
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center justify-center w-full max-w-lg gap-4"
          >
            <input
              name="nombre"
              placeholder="Nombre del Curso"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 transition border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white dark:border-gray-600"
            />
            <button
              type="submit"
              className="w-full px-4 py-2 transition border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white dark:border-gray-600 btn-primary"
            >
              Crear Curso
            </button>
          </form>
        </div>
      );
    }

    if (tab === 'docente') {
      return (
        <div ref={adminPanelRef} className="p-6 transition-all duration-500 bg-white shadow-xl animate-fade-in dark:bg-blue-200 rounded-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input name="username" placeholder="Usuario" onChange={handleChange} required className="w-full px-4 py-2 transition border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white dark:border-gray-600 input" />
            <input name="email" type="email" placeholder="Email" onChange={handleChange} required className="w-full px-4 py-2 transition border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white dark:border-gray-600 input" />
            <input name="password" type="password" placeholder="Contraseña" onChange={handleChange} required className="w-full px-4 py-2 transition border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white dark:border-gray-600 input" />
            <input name="first_name" placeholder="Nombres" onChange={handleChange} required className="w-full px-4 py-2 transition border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white dark:border-gray-600 input" />
            <input name="last_name" placeholder="Apellidos" onChange={handleChange} required className="w-full px-4 py-2 transition border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white dark:border-gray-600 input" />
            <button type="submit" className="items-center px-4 py-2 transition border border-gray-300 shadow-sm rounded-3xl focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white dark:border-gray-600 btn-primary">Crear Docente</button>
          </form>
        </div>
      );
    }
    if (tab === 'asignar') {
      return (
        <div ref={adminPanelRef} className="p-6 transition-all duration-500 bg-white shadow-xl animate-fade-in dark:bg-gray-900 rounded-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <DocentesDropdown
              docentes={docentes}
              value={form.docente_id ? String(form.docente_id) : ''}
              onChange={v => setForm({ ...form, docente_id: v })}
            />
            <CursosDropdown
              cursos={cursos}
              value={Array.isArray(form.cursos_ids) ? form.cursos_ids as string[] : []}
              onChange={v => setForm({ ...form, cursos_ids: v })}
            />
            <button type="submit" className="w-full px-4 py-2 transition bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 dark:bg-gray-400 dark:text-white dark:border-gray-600 btn-primary">Asignar Curso(s)</button>
          </form>
        </div>
      );
    }
    return null;
  }

  // 1) Traer lista de TODOS los docentes con sus cursos
  useEffect(() => {
    async function fetchDocentesConCursos() {
      try {
        const res = await fetch(
          'http://localhost:5000/api/evaluaciones/docentes-con-cursos',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error('Error al cargar docentes con cursos');
        const data: DocenteConCursos[] = await res.json();
        setDocentesConCursos(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchDocentesConCursos();
  }, [token]);



  const obtenerEvaluaciones = async () => {
    if (!selectedTeacher || !selectedCourse) {
      console.error("Docente o curso no seleccionados");
      return;
    }
    try {
      // Encuentra el docente y curso seleccionados para obtener sus IDs
      const docente = docentesConCursos.find(d => d.nombre === selectedTeacher);
      const curso = docente?.cursos.find(c => c.nombre === selectedCourse);

      // Depuración: Verifica los valores
      console.log("Selected Teacher:", selectedTeacher);
      console.log("Selected Course:", selectedCourse);
      console.log("Docente encontrado:", docente);
      console.log("Curso encontrado:", curso);

      if (!docente || !curso) {
        console.error("Docente o curso no encontrados");
        return;
      }

      // Ajustar la URL a la nueva estructura
      const res = await fetch(
        `http://localhost:5000/api/evaluaciones/docente/${docente.docente_id}/curso/${curso.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error('Error al cargar evaluaciones');
      const data: Evaluacion[] = await res.json();

      console.log("Evaluaciones recibidas:", data);

      setEvaluaciones(data);
      setMostrarEvaluaciones(true);
    } catch (error) {
      console.error("Error al obtener evaluaciones:", error);
      setEvaluaciones([]);
      setMostrarEvaluaciones(false);
    }
  };

  // const calificacionToValor = (valor: string): number => {
  //   switch (valor.toLowerCase()) {
  //     case 'excelente': return 5;
  //     case 'bueno': return 4;
  //     case 'regular': return 3;
  //     case 'malo': return 2;
  //     case 'pesimo': return 1;
  //     default: return 0;
  //   }
  // };

  // 4) Calcular promedios
  const calcularPromedios = (keys: string[]): number[] => {
    if (!evaluaciones.length) return keys.map(() => 0);
    console.log("Evaluaciones recibidas:", evaluaciones);

    return keys.map(key => {
      const suma = evaluaciones.reduce((sum, ev) => {
        const calificacion = ev.calificaciones.find(c => c.criterio === key);
        return sum + (calificacion ? calificacion.valor : 0);
      }, 0);

      return parseFloat((suma / evaluaciones.length).toFixed(1));
    });
  };

  // 5) Filtrar comentarios
  const filtrarComentarios = (tipo: 'docente' | 'curso', filtro: string) =>
    evaluaciones
      .flatMap(ev => ev.comentarios.filter(com => com.tipo === tipo))
      .filter(com => (filtro === 'todos' ? true : com.sentimiento === filtro));
  console.log("Evaluaciones recibidas:", evaluaciones);

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

  const cursoPromedios = calcularPromedios(cursoKeys);
  const docentePromedios = calcularPromedios(docenteKeys);

  const barData = {
    labels: [...cursoLabels, ...docenteLabels],
    datasets: [
      {
        label: 'Promedio',
        data: [...cursoPromedios, ...docentePromedios],
        backgroundColor: 'rgba(54,162,235,0.6)',
        borderColor: 'rgba(54,162,235,1)',
        borderWidth: 1,
      },
    ],
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

  // 6) Descargar Excel global
  const descargarExcelAdmin = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/reportes/admin/excel', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al generar Excel');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reporte_admin_evaluaciones.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('No se pudo descargar el Excel');
    }
  };

  // 7) Descargar PDF específico
  const descargarPDF = () => {
    if (!selectedTeacher || !selectedCourse) {
      return alert('Seleccione un curso primero.');
    }

    // Encuentra el docente y curso seleccionados para obtener sus IDs
    const docente = docentesConCursos.find(d => d.nombre === selectedTeacher);
    const curso = docente?.cursos.find(c => c.nombre === selectedCourse);

    if (!docente || !curso) {
      return alert('Docente o curso no encontrados.');
    }

    fetch(
      `http://localhost:5000/api/reportes/docente/${docente.docente_id}/curso/${curso.id}/pdf`,
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
        a.download = `reporte_docente_${docente.nombre}_curso_${curso.nombre}.pdf`;
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



  return (
    <div className="flex flex-col h-full">
      {/* Header móvil - ahora sin position fixed y con z-index adecuado */}
      <div className="flex items-center justify-between p-4 text-white md:hidden bg-gradient-to-r from-gray-900 to-gray-800">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="text-white transition-colors duration-200 hover:text-blue-300"
          data-sidebar="true"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-bold">Panel del Administrador</h1>
        <div className="w-6"></div> {/* Espaciador para centrar el título */}
      </div>

      {/* Contenedor principal */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AdminSidebar
          setActiveForm={setActiveForm}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-gradient-to-br from-blue-100 to-white dark:from-gray-800 dark:to-gray-900">
          {/* Contenido principal */}
          <div className="p-6">
            {/* Renderiza el formulario activo o el contenido por defecto */}
            {activeForm ? (
              renderActiveForm()
            ) : (
              <div className="flex items-center justify-center h-full">
                <h2 className="text-2xl font-semibold text-gray-500 dark:text-gray-400">Selecciona una opción del menú</h2>
              </div>
            )}


            <div className="p-4 space-y-6 rounded-lg ">
              {/* Introducción */}
              <div className="p-6 text-center bg-white rounded-lg shadow ">
                <h2 className="mb-2 text-4xl font-bold text-blue-800">
                  Evaluaciones Docentes
                </h2>
                <p className="text-xl text-gray-700">
                  Bienvenido al panel de administración del sistema de evaluación
                  docente. Aquí podrá visualizar los resultados de las evaluaciones
                  realizadas por los estudiantes, incluyendo análisis de comentarios y
                  gráficos estadísticos.
                </p>
                <p className="mt-4 text-lg font-semibold text-gray-700">
                  Puede descargar un reporte general con todas las evaluaciones
                  disponibles hasta la fecha.
                </p>

                <button
                  onClick={descargarExcelAdmin}
                  className="px-6 py-3 mt-6 text-white transition bg-green-600 rounded-md shadow hover:bg-green-700"
                >
                  Descargar Excel
                </button>
              </div>

              {/* PANEL DE ADMINISTRACIÓN */}
              <div className="p-6 mb-8 bg-white rounded-lg shadow">

                <div className="flex mb-8 space-x-4">
                  {[
                    { key: 'estudiante', label: 'Crear Estudiante' },
                    { key: 'curso', label: 'Crear Curso' },
                    { key: 'docente', label: 'Crear Docente' },
                    { key: 'asignar', label: 'Asignar Cursos a Docente' }
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setTab(key as typeof tab)}
                      className={`
      px-5 py-2 rounded-lg font-semibold transition-all duration-300 shadow
      ${tab === key
                          ? 'bg-blue-200 text-blue-900 shadow-lg scale-105 dark:bg-blue-700 dark:text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-black dark:bg-gray-400 dark:text-gray-200 dark:hover:bg-gray-500'}
    `}
                      style={{ minWidth: 180 }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {renderForm()}
                {mensaje && <div className="mt-4 text-center ">{mensaje}</div>}
              </div>
              {loading && (
                <div className="flex items-center justify-center mt-4 animate-fade-in">
                  <svg className="w-6 h-6 mr-2 text-blue-500 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  <span className="font-semibold text-blue-700 dark:text-blue-300">Un momentico, procesando...</span>
                </div>
              )}

              {/* Selección de docente y curso */}
              <div>
                <label className={`block font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Docente:
                </label>
                <select
                  value={selectedTeacher}
                  onChange={e => {
                    setSelectedTeacher(e.target.value);
                    setSelectedCourse('');
                    setMostrarEvaluaciones(false);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Seleccione un docente</option>
                  {docentesConCursos.map(docente => (
                    <option key={docente.docente_id} value={docente.nombre}>
                      {docente.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {selectedTeacher && (
                <div>
                  <label className={`block font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                    Curso:
                  </label>
                  <select
                    value={selectedCourse}
                    onChange={e => setSelectedCourse(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Seleccione un curso</option>
                    {docentesConCursos
                      .find(d => d.nombre === selectedTeacher)
                      ?.cursos.map(curso => (
                        <option key={curso.id} value={curso.nombre}>
                          {curso.nombre}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {selectedTeacher && selectedCourse && (
                <div className="flex flex-wrap items-center justify-center gap-4 ">
                  <button
                    onClick={obtenerEvaluaciones}
                    className="px-4 py-2 text-white transition bg-blue-700 rounded-md item-center hover:bg-gray-400 hover:text-blue-700 "
                  >
                    Ver Evaluaciones
                  </button>
                </div>
              )}

              {selectedTeacher && selectedCourse && (
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <button
                    onClick={descargarPDF}
                    className="px-4 py-2 text-white transition bg-red-600 rounded-md hover:bg-red-700"
                  >
                    Descargar PDF
                  </button>
                </div>
              )}

              {/* Gráfico Aspectos dl curso*/}
              {mostrarEvaluaciones && evaluaciones.length > 0 && (
                <>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* Contenedor 1: Aspectos del Curso */}
                    <div className="bg-white rounded shadow p-4 h-[350px] flex justify-center items-center overflow-hidden">
                      <div className="flex flex-col items-center justify-center w-full">
                        <h3 className="mb-0 text-xl font-semibold text-center md:text-xl ">
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
                      <div className="flex flex-col items-center justify-center w-full">
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
                      <div className="w-full ">
                        <div>
                          <h3 className="mb-0 text-xl font-semibold text-center md:text-xl">
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
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Gráfica de sentimientos del docente */}
                        <div className="bg-white rounded shadow p-4 h-[400px] flex flex-col justify-center items-center overflow-hidden">
                          <h4 className="mb-4 text-lg font-semibold text-center md:text-xl">
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
                          <h4 className="mb-4 text-lg font-semibold text-center md:text-xl">
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
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Comentarios del docente */}
                        <div className="p-4 rounded bg-blue-50">
                          <div className="flex justify-between mb-2">
                            <h5 className="font-semibold">Comentarios del Docente</h5>
                            <select
                              className="px-2 py-1 border rounded"
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
                          <div className="space-y-3 overflow-auto max-h-64">
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
                        <div className="p-4 rounded bg-blue-50">
                          <div className="flex justify-between mb-2">
                            <h5 className="font-semibold">Comentarios del Curso</h5>
                            <select
                              className="px-2 py-1 border rounded"
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
                          <div className="space-y-3 overflow-auto max-h-64">
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
              <ToastContainer />
            </div> {/* <-- Cierra max-w-4xl mx-auto */}
          </div>   {/* <-- Cierra flex-1 overflow-auto p-6 */}
        </div>     {/* <-- Cierra flex h-screen overflow-hidden */}
      </div>
    </div>
  );
}


