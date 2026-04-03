import axios from 'axios';
import { API_URL, getAuthHeaders } from './api';

const normalizeProfesionales = (data) => {
	if (Array.isArray(data)) {
		return data;
	}

	if (Array.isArray(data?.profesionales)) {
		return data.profesionales;
	}

	return [];
};

export const getProfesionales = async () => {
	const response = await axios.get(`${API_URL}/profesionales`, {
		headers: getAuthHeaders()
	});

	return normalizeProfesionales(response.data);
};

export const getProfesionalById = async (profesionalId) => {
	const profesionales = await getProfesionales();
	return profesionales.find((profesional) => profesional.id_usuario === Number(profesionalId)) || null;
};

export const searchPacientes = async (termino) => {
	const response = await axios.get(`${API_URL}/pacientes/buscar`, {
		headers: getAuthHeaders(),
		params: { termino }
	});

	return Array.isArray(response.data) ? response.data : [];
};

export const getProfesionalDisponibilidad = async (profesionalId) => {
	const response = await axios.get(`${API_URL}/turnos/profesionales/${profesionalId}/horarios`, {
		headers: getAuthHeaders()
	});

	return Array.isArray(response.data) ? response.data : [];
};

export const getCalendarioDisponibilidad = async (profesionalId) => {
	const response = await axios.get(`${API_URL}/disponibilidad/horarios/${profesionalId}`, {
		headers: getAuthHeaders()
	});

	return response.data;
};

export const getProfesionalTurnos = async (profesionalId, params = {}) => {
	const response = await axios.get(`${API_URL}/turnos/profesional/${profesionalId}`, {
		headers: getAuthHeaders(),
		params
	});

	return Array.isArray(response.data) ? response.data : [];
};

export const createTurno = async (payload) => {
	const response = await axios.post(`${API_URL}/turnos`, payload, {
		headers: getAuthHeaders()
	});

	return response.data;
};

export const createTurnoPeriodico = async (payload) => {
	const response = await axios.post(`${API_URL}/turnos-periodicos`, payload, {
		headers: getAuthHeaders()
	});

	return response.data;
};

export const createTeleconsulta = async (payload) => {
	const response = await axios.post(`${API_URL}/teleconsultas`, payload, {
		headers: getAuthHeaders()
	});

	return response.data;
};