import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import { toast } from 'sonner';
import { ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

const API = import.meta.env.VITE_API_URL;

const ProgramarSeguimientoPage = () => {
  const { turnoId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const token = useAuthStore((s) => s.token) || localStorage.getItem('token');
  const user = useAuthStore((s) => s.user);

  const pacienteSeleccionado = location.state?.paciente;
  
  const [turno, setTurno] = useState(null);
  const [paciente, setPaciente] = useState(pacienteSeleccionado || null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    fechaInicio: '',
    frecuenciaTipo: 'unica',
    intervaloDias: 0,
    repeticiones: 1,
    fechaFin: '',
    preguntasPersonalizadas: []
  });

  const [nuevaPregunta, setNuevaPregunta] = useState({
    texto: '',
    tipoRespuesta: 'texto',
    opciones: [],
    obligatoria: true
  });

  useEffect(() => {
    if (turnoId) {
      fetchTurno();
    } else if (pacienteSeleccionado) {
      setPaciente(pacienteSeleccionado);
      setLoading(false);
    } else {
      navigate('/dashboard/profesional/seguimiento/seleccionar-paciente');
    }
  }, [turnoId, pacienteSeleccionado, navigate]);

  const fetchTurno = async () => {
    try {
      const res = await axios.get(`${API}/clinica/turno/${turnoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTurno(res.data);
      setPaciente({
        id: res.data.id_paciente,
        nombre: res.data.pac_nombre,
        apellido: res.data.pac_apellido
      });
    } catch (e) {
      toast.error('Error al cargar el turno');
      navigate('/dashboard/profesional/seguimientos');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNuevaPreguntaChange = (e) => {
    const { name, value } = e.target;
    setNuevaPregunta((prev) => ({ ...prev, [name]: value }));
  };

  const agregarPregunta = () => {
    if (!nuevaPregunta.texto.trim()) {
      toast.error('El texto de la pregunta es obligatorio');
      return;
    }
    
    const pregunta = {
      id: Date.now(),
      ...nuevaPregunta
    };
    
    setFormData(prev => ({
      ...prev,
      preguntasPersonalizadas: [...prev.preguntasPersonalizadas, pregunta]
    }));
    
    setNuevaPregunta({
      texto: '',
      tipoRespuesta: 'texto',
      opciones: [],
      obligatoria: true
    });
    
    toast.success('Pregunta agregada correctamente');
  };

  const eliminarPregunta = (id) => {
    setFormData(prev => ({
      ...prev,
      preguntasPersonalizadas: prev.preguntasPersonalizadas.filter(p => p.id !== id)
    }));
    toast.success('Pregunta eliminada');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fechaInicio) {
      toast.error('Fecha de inicio es obligatoria');
      return;
    }
    if (!paciente?.id) {
      toast.error('No se ha seleccionado un paciente válido');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        turnoId: turno?.id_turno || null,
        pacienteId: paciente.id,
        ...formData,
        preguntasPersonalizadas: formData.preguntasPersonalizadas
      };
      
      await axios.post(`${API}/seguimiento`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Seguimiento programado correctamente');
      navigate('/dashboard/profesional/seguimientos');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-6 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#00796B] to-[#004D40] rounded-2xl shadow-lg mb-4">
            <ClipboardDocumentCheckIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Programar Seguimiento</h1>
          <p className="text-sm text-gray-600 max-w-md mx-auto">Configura el seguimiento post-consulta personalizado</p>
        </div>

        <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-4 mb-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-full mb-3">
              <span className="text-lg text-white font-bold">
                {paciente?.nombre ? `${paciente.nombre.charAt(0)}${paciente.apellido?.charAt(0) || ''}` : '👤'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {paciente ? `${paciente.nombre} ${paciente.apellido || ''}` : 'Paciente no especificado'}
            </h2>
            <div className="inline-flex items-center gap-4 text-gray-600 bg-white rounded-full px-4 py-2 shadow-sm text-sm">
              {turno?.fecha ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="font-medium">
                      {new Date(turno.fecha).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric', 
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="w-px h-4 bg-gray-300"></div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="font-medium text-green-700 bg-green-50 px-2 py-1 rounded">
                      {turno.estado}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="font-medium">Seguimiento directo</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[#00796B] to-[#004D40] p-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-xs">📅</span>
              </div>
              Configuración de Seguimiento
            </h3>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Fecha inicio *</label>
                  <input
                    type="date"
                    name="fechaInicio"
                    value={formData.fechaInicio}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00796B] text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Fecha fin</label>
                  <input
                    type="date"
                    name="fechaFin"
                    value={formData.fechaFin}
                    onChange={handleChange}
                    min={formData.fechaInicio}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00796B] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Frecuencia</label>
                  <select
                    name="frecuenciaTipo"
                    value={formData.frecuenciaTipo}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00796B] text-sm"
                  >
                    <option value="unica">Única</option>
                    <option value="diaria">Diaria</option>
                    <option value="semanal">Semanal</option>
                    <option value="personalizada">Personalizada</option>
                  </select>
                </div>
              </div>

              {formData.frecuenciaTipo === 'personalizada' && (
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4">
                  <h5 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    ⚙️ Configuración Personalizada
                  </h5>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Intervalo (días)</label>
                    <input
                      type="number"
                      name="intervaloDias"
                      value={formData.intervaloDias}
                      onChange={handleChange}
                      min="1"
                      placeholder="Ej: 3 (cada 3 días)"
                      className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:border-transparent transition-all duration-200 text-sm"
                    />
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4">
                <h4 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                  ❓ Preguntas Personalizadas
                </h4>
                
                <div className="bg-white rounded-lg p-3 mb-3 border-2 border-gray-100">
                  <h5 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    ➕ Agregar Nueva Pregunta
                  </h5>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Texto de la pregunta *</label>
                      <input
                        type="text"
                        name="texto"
                        value={nuevaPregunta.texto}
                        onChange={handleNuevaPreguntaChange}
                        className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:border-transparent transition-all duration-200 text-sm"
                        placeholder="Ej: ¿Cómo se siente del 1 al 10?"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Tipo de respuesta</label>
                        <select
                          name="tipoRespuesta"
                          value={nuevaPregunta.tipoRespuesta}
                          onChange={handleNuevaPreguntaChange}
                          className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:border-transparent transition-all duration-200 text-sm"
                        >
                          <option value="texto">📝 Texto libre</option>
                          <option value="escala">📊 Escala 1-10</option>
                          <option value="sino">✅ Sí/No</option>
                          <option value="opcion">📋 Opción múltiple</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">¿Obligatoria?</label>
                        <select
                          name="obligatoria"
                          value={nuevaPregunta.obligatoria}
                          onChange={(e) => setNuevaPregunta(prev => ({ ...prev, obligatoria: e.target.value === 'true' }))}
                          className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:border-transparent transition-all duration-200 text-sm"
                        >
                          <option value={true}>Sí</option>
                          <option value={false}>No</option>
                        </select>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={agregarPregunta}
                      className="w-full py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-semibold transition-all duration-200 transform hover:scale-[1.02] text-sm"
                    >
                      ➕ Agregar Pregunta
                    </button>
                  </div>
                </div>
                
                {formData.preguntasPersonalizadas.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      📝 Preguntas Configuradas ({formData.preguntasPersonalizadas.length})
                    </h5>
                    {formData.preguntasPersonalizadas.map((pregunta, index) => (
                      <div key={pregunta.id} className="bg-white rounded-lg p-3 border-l-4 border-indigo-500 shadow-sm">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-0.5 rounded-full">
                                #{index + 1}
                              </span>
                              {pregunta.obligatoria && (
                                <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-0.5 rounded-full">
                                  Obligatoria
                                </span>
                              )}
                              <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full">
                                {pregunta.tipoRespuesta === 'texto' && '📝 Texto'}
                                {pregunta.tipoRespuesta === 'escala' && '📊 Escala 1-10'}
                                {pregunta.tipoRespuesta === 'sino' && '✅ Sí/No'}
                                {pregunta.tipoRespuesta === 'opcion' && '📋 Opción múltiple'}
                              </span>
                            </div>
                            <p className="text-gray-800 font-medium text-sm">{pregunta.texto}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => eliminarPregunta(pregunta.id)}
                            className="ml-3 text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors text-sm"
                            title="Eliminar pregunta"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-[#00796B] to-[#004D40] hover:from-[#00695c] hover:to-[#00251a] text-white font-bold shadow-lg disabled:opacity-60 transition-all duration-200 transform hover:scale-[1.02] text-sm"
                >
                  {saving ? '🔄 Guardando...' : 'Programar seguimiento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramarSeguimientoPage;
