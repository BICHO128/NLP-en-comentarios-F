import { toast } from "react-toastify";
import { create } from "zustand";

interface User {
  id: number;
  username: string;
  email: string;
  role_id: number; //  toca hacer el cambio por el rol de usuario
  first_name: string;
  last_name: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  token: null,

  login: async (email: string, password: string) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      console.log("Datos recibidos del backend:", data);

      // Verifica y maneja posibles valores faltantes
      const userData = data.user || {};

      set({
        isAuthenticated: true,
        token: data.access_token,
        user: {
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
          role_id: data.user.role_id,
          first_name: userData.first_name || "",
          last_name: userData.last_name || "",
        },
      });
      console.log("Estado actualizado del store:", useAuthStore.getState());

      return true;
    } catch {
      toast.error("Error en login:");
      return false;
    }
  },

  logout: () => {
    set({
      isAuthenticated: false,
      user: null,
      token: null,
    });
  },
}));
