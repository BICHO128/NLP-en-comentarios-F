import { create } from "zustand";
import { useAuthStore } from "./Autenticacion";

interface Evaluacion {
  id: number;
  curso: string;
  comentario_docente: string;
  comentario_curso: string;
  sentimiento_docente: string;
  sentimiento_curso: string;
  fecha: string;
}

interface EvaluacionState {
  evaluaciones: Evaluacion[];
  cargarEvaluaciones: (docenteId: number) => Promise<void>;
}

export const useEvaluacionesStore = create<EvaluacionState>((set) => ({
  evaluaciones: [],
  cargarEvaluaciones: async (docenteId: number) => {
    const token = useAuthStore.getState().token;
    const response = await fetch(
      `http://localhost:5000/api/evaluaciones/docente/${docenteId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      set({ evaluaciones: data.evaluaciones });
    } else {
      console.error("Error al cargar evaluaciones");
    }
  },
}));
