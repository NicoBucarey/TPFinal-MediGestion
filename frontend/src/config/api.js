/**
 * Configuración centralizada de la API
 * La URL base se toma de las variables de entorno o usa un valor por defecto
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Función auxiliar para construir URLs de la API
export const apiUrl = (path) => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;