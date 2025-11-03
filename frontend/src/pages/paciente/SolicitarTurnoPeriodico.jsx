import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { CalendarDaysIcon, ClockIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

const API = import.meta.env.VITE_API_URL;

const SolicitarTurnoPeriodico = () => {
  const { profesionalId } = useParams();
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token) || localStorage.getItem('token');
  const user = useAuthStore((s) => s.user);

  const [profesional, setProfesional] = useState(null);
  const [disponibilidad, setDisponibilidad] = useState([]);
  const [form, setForm] = useState({
    tipoPeriodicidad: 'semanal',
    diaSemana: '',
    horaInicio: '',
    horaFin: '',
    fechaInicio: '',
    fechaFin: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (profesionalId) {
      fetchProfesional();
      fetchDisponibilidad();
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.diaSemana || !form.horaInicio || !form.fechaInicio || !form.fechaFin) {
      toast.error('Complete todos los campos requeridos');
      return;
    }

    // Validar que fecha fin esté dentro de 2 meses
    const inicio = new Date(form.fechaInicio);
    const fin = new Date(form.fechaFin);
    const dosMeses = new Date(inicio);
    dosMeses.setMonth(dosMeses.getMonth() + 2);

    if (fin > dosMeses) {
      toast.error('La fecha fin no puede exceder 2 meses desde la fecha de inicio');
      return;
    }

    // Calcular hora fin (30 min después)
    const horaInicioDate = new Date(`2000-01-01T${form.horaInicio}:00`);
    horaInicioDate.setMinutes(horaInicioDate.getMinutes() + 30);
    const horaFin = horaInicioDate.toTimeString().slice(0, 5) + ':00';

    setSubmitting(true);
    try {
      await axios.post(
        `${API}/turnos-periodicos`,
        {
          profesionalId: Number(profesionalId),
          pacienteId: user.id,
          tipoPeriodicidad: form.tipoPeriodicidad,
          diaSemana: form.diaSemana,
          horaInicio: form.horaInicio + ':00',
          horaFin,
          fechaInicio: form.fechaInicio,
          fechaFin: form.fechaFin
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Turno periódico solicitado exitosamente');
      navigate('/dashboard/paciente/turnos');
    } catch (e) {
      console.error('Error al solicitar turno periódico:', e);
      toast.error(e.response?.data?.error || 'Error al solicitar el turno periódico');
    } finally {
      setSubmitting(false);
    }
  };

  const diasDisponibles = Array.isArray(disponibilidad) 
    ? Array.from(new Set(disponibilidad.map(d => d.dia_semana)))
    : [];
  
  const horariosDisponibles = (form.diaSemana && Array.isArray(disponibilidad))
    ? disponibilidad.filter(d => d.dia_semana === form.diaSemana)
    : [];

  const generarHorarios = () => {
    const horarios = [];
    horariosDisponibles.forEach(d => {
      let current = new Date(`2000-01-01T${d.hora_inicio}`);
      const end = new Date(`2000-01-01T${d.hora_fin}`);
      
      while (current < end) {
        horarios.push(current.toTimeString().slice(0, 5));
        current.setMinutes(current.getMinutes() + 30);
      }
    });
    return horarios;
  };

  const horarios = generarHorarios();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/dashboard/paciente/buscar-profesional')}
          className="flex items-center gap-2 text-gray-600 hover:text-[#00796B] transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Volver
        </button>

        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <CalendarDaysIcon className="w-8 h-8 text-[#00796B]" />
            Solicitar Turno Periódico
          </h2>
          {profesional && (
            <p className="text-gray-600 mt-1">
              Con {profesional.nombre} {profesional.apellido}
              {profesional.especialidad && ` - ${profesional.especialidad}`}
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          {disponibilidad.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Este profesional aún no tiene disponibilidad configurada
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Periodicidad *
                  </label>
                  <select
                    value={form.tipoPeriodicidad}
                    onChange={(e) => setForm({ ...form, tipoPeriodicidad: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00796B]"
                  >
                    <option value="semanal">Semanal</option>
                    <option value="quincenal">Quincenal</option>
                    <option value="mensual">Mensual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Día de la Semana *
                  </label>
                  <select
                    value={form.diaSemana}
                    onChange={(e) => setForm({ ...form, diaSemana: e.target.value, horaInicio: '' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00796B]"
                  >
                    <option value="">Seleccione un día</option>
                    {diasDisponibles.map(dia => (
                      <option key={dia} value={dia} className="capitalize">{dia}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horario *
                  </label>
                  <select
                    value={form.horaInicio}
                    onChange={(e) => setForm({ ...form, horaInicio: e.target.value })}
                    disabled={!form.diaSemana}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00796B] disabled:bg-gray-100"
                  >
                    <option value="">Seleccione horario</option>
                    {horarios.map(hora => (
                      <option key={hora} value={hora}>{hora}</option>
                    ))}
                  </select>
                  {form.horaInicio && (
                    <p className="text-xs text-gray-500 mt-1">
                      Duración: 30 minutos (hasta {
                        (() => {
                          const h = new Date(`2000-01-01T${form.horaInicio}:00`);
                          h.setMinutes(h.getMinutes() + 30);
                          return h.toTimeString().slice(0, 5);
                        })()
                      })
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Inicio *
                  </label>
                  <input
                    type="date"
                    value={form.fechaInicio}
                    onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00796B]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Fin *
                  </label>
                  <input
                    type="date"
                    value={form.fechaFin}
                    onChange={(e) => setForm({ ...form, fechaFin: e.target.value })}
                    min={form.fechaInicio || new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00796B]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Máximo 2 meses desde la fecha de inicio
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  <ClockIcon className="w-4 h-4 inline mr-1" />
                  Información sobre turnos periódicos
                </h4>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Se generarán turnos automáticamente según la frecuencia seleccionada</li>
                  <li>Los turnos se crearán solo en días donde el profesional tenga disponibilidad</li>
                  <li>La duración del turno periódico no puede exceder 2 meses</li>
                  <li>Cada turno individual tendrá una duración de 30 minutos</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/paciente/buscar-profesional')}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-[#00796B] hover:bg-[#00796B]/90 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Solicitando...' : 'Solicitar Turnos'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SolicitarTurnoPeriodico;
