import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'sonner';
import { ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

const API = import.meta.env.VITE_API_URL;

const ProgramarSeguimiento = () => {
  const { turnoId } = useParams();
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token) || localStorage.getItem('token');
  const user = useAuthStore((s) => s.user);

  const [turno, setTurno] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    fechaInicio: '',
    frecuenciaTipo: 'unica',
    intervaloDias: 0,
    repeticiones: 1,
    fechaFin: '',
    instrucciones: '',
    tipoSeguimiento: 'texto'
  });

  useEffect(() => {
    const fetchTurno = async () => {
      try {
        const res = await axios.get(`${API}/clinica/turno/${turnoId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTurno(res.data);
      } catch (e) {
        toast.error('Error al cargar el turno');
      } finally {
        setLoading(false);
      }
    };
    fetchTurno();
  }, [turnoId, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fechaInicio || !formData.instrucciones.trim()) {
      toast.error('Fecha de inicio e instrucciones son obligatorias');
      return;
    }
    setSaving(true);
    try {
      await axios.post(
        `${API}/seguimiento`,
        {
          turnoId,
          pacienteId: turno.id_paciente,
          ...formData
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Seguimiento programado correctamente');
      navigate(`/dashboard/profesional/seguimientos`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error al programar seguimiento');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="h-40 bg-white rounded-2xl shadow animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#00796B] rounded-2xl shadow-lg mb-6">
            <ClipboardDocumentCheckIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Programar Seguimiento</h2>
          <p className="text-gray-600">Configura el seguimiento post-consulta</p>
        </div>

        {/* Datos del turno */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Fecha turno</p>
              <p className="font-semibold">{turno?.fecha}</p>
            </div>
            <div>
              <p className="text-gray-500">Paciente</p>
              <p className="font-semibold">{turno?.pac_nombre ? `${turno.pac_nombre} ${turno.pac_apellido}` : '—'}</p>
            </div>
            <div>
              <p className="text-gray-500">Estado</p>
              <p className="font-semibold">{turno?.estado || '—'}</p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha inicio *</label>
                <input
                  type="date"
                  name="fechaInicio"
                  value={formData.fechaInicio}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00796B]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Frecuencia</label>
                <select
                  name="frecuenciaTipo"
                  value={formData.frecuenciaTipo}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00796B]"
                >
                  <option value="unica">Única</option>
                  <option value="diaria">Diaria</option>
                  <option value="semanal">Semanal</option>
                  <option value="personalizada">Personalizada</option>
                </select>
              </div>
            </div>

            {formData.frecuenciaTipo === 'personalizada' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Intervalo (días)</label>
                <input
                  type="number"
                  name="intervaloDias"
                  value={formData.intervaloDias}
                  onChange={handleChange}
                  min="1"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00796B]"
                />
              </div>
            )}

            {formData.frecuenciaTipo !== 'unica' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Repeticiones</label>
                  <input
                    type="number"
                    name="repeticiones"
                    value={formData.repeticiones}
                    onChange={handleChange}
                    min="1"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00796B]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha fin</label>
                  <input
                    type="date"
                    name="fechaFin"
                    value={formData.fechaFin}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00796B]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de seguimiento</label>
              <select
                name="tipoSeguimiento"
                value={formData.tipoSeguimiento}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00796B]"
              >
                <option value="texto">Texto libre</option>
                <option value="checklist">Checklist</option>
                <option value="sintomas">Control de síntomas</option>
                <option value="archivos">Adjuntar archivos</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Instrucciones para el paciente *</label>
              <textarea
                name="instrucciones"
                value={formData.instrucciones}
                onChange={handleChange}
                rows={5}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00796B]"
                placeholder="Descripción detallada de las indicaciones, qué debe registrar el paciente, etc."
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-lg bg-[#00796B] hover:bg-[#00695c] text-white font-semibold shadow-md disabled:opacity-60"
              >
                {saving ? 'Guardando...' : 'Programar seguimiento'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProgramarSeguimiento;
