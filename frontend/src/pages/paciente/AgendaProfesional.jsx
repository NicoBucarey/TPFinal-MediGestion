import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { CalendarIcon, ClockIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

const API = import.meta.env.VITE_API_URL;

const AgendaProfesional = () => {
  const { profesionalId } = useParams();
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token) || localStorage.getItem('token');
  const user = useAuthStore((s) => s.user);

  const [profesional, setProfesional] = useState(null);
  const [disponibilidad, setDisponibilidad] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [motivoConsulta, setMotivoConsulta] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (profesionalId) {
      fetchProfesional();
      fetchDisponibilidad();
      fetchTurnos();
    }
  }, [profesionalId]);

  const fetchProfesional = async () => {
    try {
      const res = await axios.get(`${API}/profesionales`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const prof = res.data.find(p => p.id_usuario === Number(profesionalId));
      setProfesional(prof);
    } catch (e) {
      console.error('Error fetching profesional:', e);
    }
  };

  const fetchDisponibilidad = async () => {
    try {
      const res = await axios.get(`${API}/turnos/profesionales/${profesionalId}/horarios`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data;
      setDisponibilidad(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error fetching disponibilidad:', e);
      setDisponibilidad([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTurnos = async () => {
    const hoy = new Date().toISOString().split('T')[0];
    const futuro = new Date();
    futuro.setDate(futuro.getDate() + 60);
    const hasta = futuro.toISOString().split('T')[0];
    
    try {
      const res = await axios.get(`${API}/turnos/profesional/${profesionalId}`, {
        params: { fechaDesde: hoy, fechaHasta: hasta },
        headers: { Authorization: `Bearer ${token}` }
      });
      setTurnos(res.data || []);
    } catch (e) {
      console.error('Error fetching turnos:', e);
      setTurnos([]);
    }
  };

  const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

  const getDisponibilidadDia = (fecha) => {
    if (!Array.isArray(disponibilidad)) return [];
    const date = new Date(fecha + 'T12:00:00');
    const diaNombre = diasSemana[date.getDay()];
    return disponibilidad.filter(d => d.dia_semana === diaNombre);
  };

  const getTurnosOcupados = (fecha) => {
    if (!Array.isArray(turnos)) return [];
    return turnos.filter(t => t.fecha === fecha);
  };

  const isSlotAvailable = (fecha, hora) => {
    const ocupados = getTurnosOcupados(fecha);
    return !ocupados.some(t => t.hora_inicio === hora);
  };

  const generarSlots = () => {
    if (!selectedDate || !Array.isArray(disponibilidad)) return [];
    
    const dispDia = getDisponibilidadDia(selectedDate);
    if (dispDia.length === 0) return [];

    const slots = [];
    dispDia.forEach(d => {
      let current = new Date(`2000-01-01T${d.hora_inicio}`);
      const end = new Date(`2000-01-01T${d.hora_fin}`);
      
      while (current < end) {
        const horaStr = current.toTimeString().slice(0, 5);
        if (isSlotAvailable(selectedDate, horaStr + ':00')) {
          slots.push(horaStr);
        }
        current.setMinutes(current.getMinutes() + 30);
      }
    });
    return slots;
  };

  const handleSolicitarTurno = async () => {
    if (!selectedDate || !selectedTime || !motivoConsulta.trim()) {
      toast.error('Complete todos los campos requeridos');
      return;
    }

    setSubmitting(true);
    try {
      const fechaHora = new Date(`${selectedDate}T${selectedTime}:00`);
      const payload = {
        profesionalId: Number(profesionalId),
        pacienteId: user.id,
        fechaHora: fechaHora.toISOString(),
        motivoConsulta
      };
      
      console.log('Enviando solicitud de turno:', payload);
      
      await axios.post(
        `${API}/turnos`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Turno solicitado exitosamente');
      navigate('/dashboard/paciente/turnos');
    } catch (e) {
      console.error('Error al solicitar turno:', e);
      console.error('Response data:', e.response?.data);
      toast.error(e.response?.data?.error || 'Error al solicitar el turno');
    } finally {
      setSubmitting(false);
    }
  };

  const proximosDias = () => {
    if (!Array.isArray(disponibilidad)) return [];
    
    const dias = [];
    const hoy = new Date();
    for (let i = 0; i < 30; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);
      const fechaStr = fecha.toISOString().split('T')[0];
      const diaNombre = diasSemana[fecha.getDay()];
      const tieneDisp = disponibilidad.some(d => d.dia_semana === diaNombre);
      if (tieneDisp) {
        dias.push({ fecha: fechaStr, nombre: diaNombre });
      }
    }
    return dias;
  };

  const slots = generarSlots();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/dashboard/paciente/buscar-profesional')}
          className="flex items-center gap-2 text-gray-600 hover:text-[#00796B] transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Volver a búsqueda
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 text-[#00796B]" />
              Agenda de {profesional ? `${profesional.nombre} ${profesional.apellido}` : 'Profesional'}
            </h2>
            {profesional?.especialidad && (
              <p className="text-gray-600">{profesional.especialidad}</p>
            )}
          </div>
          <button
            onClick={() => navigate(`/dashboard/paciente/turno-periodico/${profesionalId}`)}
            className="px-4 py-2 border-2 border-[#00796B] text-[#00796B] hover:bg-[#00796B] hover:text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <CalendarIcon className="w-5 h-5" />
            Turno Periódico
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Cargando disponibilidad...</div>
          </div>
        ) : disponibilidad.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-8 text-center">
            <p className="text-gray-500">Este profesional aún no tiene disponibilidad configurada</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Selección de fecha */}
            <div className="lg:col-span-1 bg-white rounded-2xl shadow p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-[#00796B]" />
                Seleccionar Fecha
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {proximosDias().map(({ fecha, nombre }) => (
                  <button
                    key={fecha}
                    onClick={() => { setSelectedDate(fecha); setSelectedTime(''); }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedDate === fecha
                        ? 'bg-[#00796B] text-white'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="font-medium">{new Date(fecha + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                    <div className="text-sm opacity-75 capitalize">{nombre}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selección de horario y solicitud */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow p-6 space-y-6">
              {!selectedDate ? (
                <div className="text-center py-12 text-gray-500">
                  Selecciona una fecha para ver los horarios disponibles
                </div>
              ) : slots.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No hay horarios disponibles para esta fecha
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                      <ClockIcon className="w-5 h-5 text-[#00796B]" />
                      Horarios Disponibles
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {slots.map(hora => (
                        <button
                          key={hora}
                          onClick={() => setSelectedTime(hora)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedTime === hora
                              ? 'bg-[#00796B] text-white'
                              : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                          }`}
                        >
                          {hora}
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedTime && (
                    <div className="space-y-4 pt-4 border-t">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Motivo de consulta *
                        </label>
                        <textarea
                          value={motivoConsulta}
                          onChange={(e) => setMotivoConsulta(e.target.value)}
                          rows={3}
                          placeholder="Describa brevemente el motivo de su consulta"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00796B]"
                        />
                      </div>
                      <button
                        onClick={handleSolicitarTurno}
                        disabled={submitting}
                        className="w-full px-6 py-3 bg-[#00796B] hover:bg-[#00796B]/90 text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        {submitting ? 'Solicitando...' : 'Solicitar Turno'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgendaProfesional;
