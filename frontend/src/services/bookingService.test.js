import axios from 'axios';
import {
  getProfesionales,
  getProfesionalById,
  searchPacientes,
  getProfesionalTurnos,
  createTurno,
} from './bookingService';
import { API_URL } from './api';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('bookingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('getProfesionales devuelve array cuando la API devuelve array directo', async () => {
    axios.get.mockResolvedValueOnce({ data: [{ id_usuario: 1, nombre: 'Ana' }] });

    const result = await getProfesionales();

    expect(result).toEqual([{ id_usuario: 1, nombre: 'Ana' }]);
    expect(axios.get).toHaveBeenCalledWith(`${API_URL}/profesionales`, {
      headers: {},
    });
  });

  it('getProfesionales normaliza cuando la API devuelve { profesionales: [] }', async () => {
    axios.get.mockResolvedValueOnce({ data: { profesionales: [{ id_usuario: 2 }] } });

    const result = await getProfesionales();

    expect(result).toEqual([{ id_usuario: 2 }]);
  });

  it('getProfesionalById busca por id numérico', async () => {
    axios.get.mockResolvedValueOnce({
      data: [{ id_usuario: 10 }, { id_usuario: 20 }],
    });

    const result = await getProfesionalById('20');

    expect(result).toEqual({ id_usuario: 20 });
  });

  it('searchPacientes envía el término por query params', async () => {
    localStorage.setItem('token', 'abc123');
    axios.get.mockResolvedValueOnce({ data: [{ id_usuario: 9, apellido: 'Pérez' }] });

    const result = await searchPacientes('perez');

    expect(result).toEqual([{ id_usuario: 9, apellido: 'Pérez' }]);
    expect(axios.get).toHaveBeenCalledWith(`${API_URL}/pacientes/buscar`, {
      headers: { Authorization: 'Bearer abc123' },
      params: { termino: 'perez' },
    });
  });

  it('getProfesionalTurnos devuelve [] cuando la API responde algo no iterable', async () => {
    axios.get.mockResolvedValueOnce({ data: { mensaje: 'ok' } });

    const result = await getProfesionalTurnos(5, { fechaDesde: '2026-01-01' });

    expect(result).toEqual([]);
  });

  it('createTurno hace POST y retorna response.data', async () => {
    const payload = { pacienteId: 1, profesionalId: 2, fechaHora: '2026-03-11T10:00:00.000Z' };
    axios.post.mockResolvedValueOnce({ data: { ok: true, id_turno: 123 } });

    const result = await createTurno(payload);

    expect(result).toEqual({ ok: true, id_turno: 123 });
    expect(axios.post).toHaveBeenCalledWith(`${API_URL}/turnos`, payload, {
      headers: {},
    });
  });
});
