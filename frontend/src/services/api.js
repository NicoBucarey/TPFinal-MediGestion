export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const getAuthHeaders = () => {
	const token = localStorage.getItem('token');

	return token ? { Authorization: `Bearer ${token}` } : {};
};

export const buildApiUrl = (path) => `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;