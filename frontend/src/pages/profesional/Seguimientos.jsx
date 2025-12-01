import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../stores/authStore';
import { Link } from 'react-router-dom';
import { ClipboardDocumentListIcon, ChatBubbleBottomCenterTextIcon, PlusIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

const API = import.meta.env.VITE_API_URL;

const Seguimientos = () => {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token) || localStorage.getItem('token');
  const [seguimientos, setSeguimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [stats, setStats] = useState(null);
  const [desde, setDesde] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [hasta, setHasta] = useState(() => new Date().toISOString().slice(0, 10));
  const [showModalRespuestas, setShowModalRespuestas] = useState(false);
  const [respuestas, setRespuestas] = useState([]);
  const [loadingRespuestas, setLoadingRespuestas] = useState(false);
  const [selectedSeguimiento, setSelectedSeguimiento] = useState(null);

  useEffect(() => {
    fetchSeguimientos();
  }, [filtroEstado]);

  useEffect(() => {
    fetchStats();
  }, [desde, hasta]);

  const fetchSeguimientos = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const params = filtroEstado ? { estado: filtroEstado } : {};
      const res = await axios.get(`${API}/seguimiento/profesional/${user.id}`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      setSeguimientos(res.data || []);
    } catch (e) {
      setSeguimientos([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!user?.id) return;
    try {
      const res = await axios.get(`${API}/seguimiento/profesional/${user.id}/estadisticas`, {
        params: { desde, hasta },
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (e) {
      setStats(null);
    }
  };

  const cumplimiento = useMemo(() => {
    if (!stats?.resumen) return 0;
    const { total, completado } = stats.resumen;
    if (!total) return 0;
    return Math.round((completado / total) * 100);
  }, [stats]);

  const estadoBadge = (estado) => {
    const colors = {
      pendiente: 'bg-yellow-100 text-yellow-700',
      en_curso: 'bg-blue-100 text-blue-700',
      completado: 'bg-green-100 text-green-700',
      vencido: 'bg-red-100 text-red-700'
    };
    return colors[estado] || 'bg-gray-100 text-gray-700';
  };

  const handleVerRespuestas = async (seguimiento) => {
    setSelectedSeguimiento(seguimiento);
    setShowModalRespuestas(true);
    setLoadingRespuestas(true);
    setRespuestas([]);

    try {
      const res = await axios.get(
        `${API}/seguimientos/${seguimiento.id_seguimiento}/respuestas`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRespuestas(res.data || []);
    } catch (error) {
      console.error('Error al cargar respuestas:', error);
      toast.error('Error al cargar las respuestas');
    } finally {
      setLoadingRespuestas(false);
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <ClipboardDocumentListIcon className="w-8 h-8 text-[#00796B]" />
              Seguimientos
            </h2>
            <p className="text-gray-600">Gestión de seguimientos post-consulta</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Botón Crear Seguimiento Rápido */}
            <Link
              to="/dashboard/profesional/seguimiento/seleccionar-paciente"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00796B] to-[#004D40] hover:from-[#00695c] hover:to-[#00251a] text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <PlusIcon className="w-5 h-5" />
              Crear Seguimiento
            </Link>
            
            {/* Filtros */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="border rounded-lg px-2 py-1" />
                <span className="text-gray-500">a</span>
                <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="border rounded-lg px-2 py-1" />
              </div>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00796B]"
              >
                <option value="">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="en_curso">En curso</option>
                <option value="completado">Completado</option>
                <option value="vencido">Vencido</option>
              </select>
            </div>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Total</div>
                  <div className="text-3xl font-bold text-gray-900">{stats.resumen.total}</div>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <ClipboardDocumentListIcon className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Completado</div>
                  <div className="text-3xl font-bold text-green-600">{stats.resumen.completado}</div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-xl font-bold">✓</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Pendiente</div>
                  <div className="text-3xl font-bold text-yellow-600">{stats.resumen.pendiente}</div>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 text-xl font-bold">⏳</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Vencido</div>
                  <div className="text-3xl font-bold text-red-600">{stats.resumen.vencido}</div>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-600 text-xl font-bold">⚠️</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Cumplimiento</div>
                  <div className="text-3xl font-bold text-[#00796B]">{cumplimiento}%</div>
                </div>
                <div className="w-12 h-12 bg-[#00796B]/10 rounded-lg flex items-center justify-center">
                  <span className="text-[#00796B] text-xl font-bold">📊</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Lista de Seguimientos</h3>
            <p className="text-sm text-gray-600 mt-1">Gestiona todos los seguimientos activos y completos</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Paciente</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha inicio</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Frecuencia</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Respuestas</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center space-x-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00796B]"></div>
                        <span className="text-gray-500 font-medium">Cargando seguimientos...</span>
                      </div>
                    </td>
                  </tr>
                ) : seguimientos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <ClipboardDocumentListIcon className="w-16 h-16 text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium">No hay seguimientos</p>
                        <p className="text-gray-400 text-sm mt-1">Crea tu primer seguimiento desde "Mis Turnos"</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  seguimientos.map((s) => (
                    <tr key={s.id_seguimiento} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#00796B] to-[#004D40] rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                            {s.paciente_nombre ? s.paciente_nombre.charAt(0).toUpperCase() : 'P'}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{s.paciente_nombre}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(s.fecha_inicio).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit', 
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                          {s.frecuencia_tipo || 'única'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                          {s.tipo_seguimiento || 'texto'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${estadoBadge(s.estado)}`}>
                          {s.estado.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleVerRespuestas(s)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium transition-colors duration-150"
                        >
                          <ChatBubbleBottomCenterTextIcon className="w-4 h-4" />
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Ver Respuestas */}
      {showModalRespuestas && selectedSeguimiento && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Respuestas del Paciente
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {selectedSeguimiento.paciente_nombre}
              </p>
              {selectedSeguimiento.instrucciones && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs font-semibold text-blue-900 mb-1">
                    📋 Instrucciones originales:
                  </p>
                  <p className="text-sm text-blue-800 whitespace-pre-wrap">
                    {selectedSeguimiento.instrucciones}
                  </p>
                </div>
              )}
            </div>

            <div className="p-6">
              {loadingRespuestas ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
                  <p className="text-gray-500 mt-4">Cargando respuestas...</p>
                </div>
              ) : respuestas.length === 0 ? (
                <div className="text-center py-8">
                  <ChatBubbleBottomCenterTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">El paciente aún no ha respondido</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {respuestas.map((resp) => (
                    <div
                      key={resp.id_respuesta}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {formatFecha(resp.fecha_respuesta)}
                          </span>
                          {resp.cumplimiento && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                              ✓ Cumplido
                            </span>
                          )}
                          {!resp.cumplimiento && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                              ✗ No cumplido
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm font-semibold text-gray-700 mb-1">Respuesta:</p>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">
                          {resp.respuesta}
                        </p>
                      </div>

                      {/* Respuestas a preguntas personalizadas */}
                      {resp.respuestas_preguntas_personalizadas && resp.respuestas_preguntas_personalizadas.length > 0 && (
                        <div className="mb-3 p-3 bg-purple-50 rounded border border-purple-200">
                          <p className="text-sm font-semibold text-purple-900 mb-3">
                            ❓ Respuestas a preguntas específicas:
                          </p>
                          <div className="space-y-3">
                            {resp.respuestas_preguntas_personalizadas.map((respPregunta) => (
                              <div key={respPregunta.id_respuesta_pregunta} className="bg-white p-3 rounded border border-purple-100">
                                <p className="text-sm font-medium text-gray-900 mb-2">
                                  {respPregunta.texto_pregunta}
                                </p>
                                <div className="text-sm text-gray-700">
                                  {respPregunta.tipo_respuesta === 'texto' && (
                                    <p className="bg-gray-50 p-2 rounded text-gray-800">
                                      {respPregunta.respuesta_texto}
                                    </p>
                                  )}
                                  {respPregunta.tipo_respuesta === 'escala' && (
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">Escala:</span>
                                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-bold">
                                        {respPregunta.respuesta_numerica}/10
                                      </span>
                                    </div>
                                  )}
                                  {respPregunta.tipo_respuesta === 'sino' && (
                                    <div className="flex items-center gap-2">
                                      <span className={`px-3 py-1 rounded-full font-medium ${
                                        respPregunta.respuesta_booleana 
                                          ? 'bg-green-100 text-green-800' 
                                          : 'bg-red-100 text-red-800'
                                      }`}>
                                        {respPregunta.respuesta_booleana ? '✓ Sí' : '✗ No'}
                                      </span>
                                    </div>
                                  )}
                                  {respPregunta.tipo_respuesta === 'opcion' && (
                                    <p className="bg-yellow-50 p-2 rounded text-yellow-800 font-medium">
                                      {respPregunta.respuesta_opcion}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {resp.sintomas_reportados && (
                        <div className="mb-3 p-3 bg-orange-50 rounded border border-orange-200">
                          <p className="text-sm font-semibold text-orange-900 mb-1">
                            ⚠️ Síntomas reportados:
                          </p>
                          <p className="text-sm text-orange-800 whitespace-pre-wrap">
                            {resp.sintomas_reportados}
                          </p>
                        </div>
                      )}

                      {resp.observaciones && (
                        <div className="mb-3 p-3 bg-blue-50 rounded border border-blue-200">
                          <p className="text-sm font-semibold text-blue-900 mb-1">
                            💬 Observaciones:
                          </p>
                          <p className="text-sm text-blue-800 whitespace-pre-wrap">
                            {resp.observaciones}
                          </p>
                        </div>
                      )}

                      {resp.archivos_urls && resp.archivos_urls.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-semibold text-gray-700 mb-2">
                            📎 Archivos adjuntos:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {resp.archivos_urls.map((url, idx) => (
                              <a
                                key={idx}
                                href={`http://localhost:3000${url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
                              >
                                Archivo {idx + 1}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowModalRespuestas(false)}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Seguimientos;
