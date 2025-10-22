import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  // Estado
  user: null,
  isAuthenticated: false,
  token: null,

  // Acciones
  login: (userData, token) => set({
    user: userData,
    isAuthenticated: true,
    token: token
  }),

  logout: () => set({
    user: null,
    isAuthenticated: false,
    token: null
  }),

  updateUser: (userData) => set((state) => ({
    user: { ...state.user, ...userData }
  }))
}));