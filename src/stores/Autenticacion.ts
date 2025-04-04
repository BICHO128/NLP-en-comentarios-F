import { create } from 'zustand';

type UserRole = 'student' | 'teacher' | 'admin';

interface User {
  username: string;
  role: UserRole;
}

interface AuthState {
  isAuthenticated: boolean;
  userRole: UserRole | null;
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Mock user data - In a real app, this would come from your backend
const mockUsers = {
  'urrutia': { password: '123', role: 'student' },
  'ana maria': { password: '123', role: 'teacher' },
  'admin': { password: '123', role: 'admin' },
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  userRole: null,
  user: null,
  login: async (username: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = mockUsers[username as keyof typeof mockUsers];
    
    if (user && user.password === password) {
      set({ 
        isAuthenticated: true, 
        userRole: user.role as UserRole,
        user: { username, role: user.role as UserRole }
      });
      return true;
    }
    
    return false;
  },
  logout: () => {
    set({ 
      isAuthenticated: false, 
      userRole: null,
      user: null
    });
  },
}));