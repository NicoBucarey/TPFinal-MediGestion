import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const API_URL = import.meta.env.VITE_API_URL; // URL desde variables de entorno

export const useAuth = () => {
  const { login, logout } = useAuthStore();

  const handleLogin = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      const { user, token } = response.data;
      login(user, token);

      // Guardar token en localStorage
      localStorage.setItem('token', token);
      
      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al iniciar sesión'
      };
    }
  };

  const handleRegister = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al registrar usuario'
      };
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('token');
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const response = await axios.get(`${API_URL}/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      login(response.data.user, token);
      return true;
    } catch (error) {
      handleLogout();
      return false;
    }
  };

  return {
    handleLogin,
    handleRegister,
    handleLogout,
    checkAuth,
  };
};

export default useAuth;