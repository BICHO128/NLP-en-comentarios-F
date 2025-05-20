export interface Usuario {
  username: string;
  email: string;
  password?: string;
  first_name: string;
  last_name: string;
}

export interface Estudiante extends Usuario {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  // Campos específicos de estudiante si los hay
}

export interface Docente extends Usuario {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  // Campos específicos de docente si los hay
}

export interface Curso {
  nombre: string;
}

export interface AsignacionCursoDocente {
  docente_id: number;
  cursos_ids: number[];
}
