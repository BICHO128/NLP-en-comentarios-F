import { create } from "zustand";

interface User {
  id: number;
  username: string;
  email: string;
  role_id: number;
  first_name: string;
  last_name: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  // ⬇️ Nuevo tipo de retorno
  login: (
    email: string,
    password: string
  ) => Promise<{ ok: boolean; msg?: string }>;
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

      const data = await response.json();
      // Si NO fue exitoso
      if (!response.ok) {
        return { ok: false, msg: data.msg || "Error desconocido" };
      }

      // Si fue exitoso, actualiza el estado
      const userData = data.user || {};
      set({
        isAuthenticated: true,
        token: data.access_token,
        user: {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          role_id: userData.role_id,
          first_name: userData.first_name || "",
          last_name: userData.last_name || "",
        },
      });
      return { ok: true };
    } catch {
      return { ok: false, msg: "Error de conexión con el servidor" };
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
