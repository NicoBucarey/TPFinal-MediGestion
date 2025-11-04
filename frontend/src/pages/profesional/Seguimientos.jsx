import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../stores/authStore';
import { Link } from 'react-router-dom';
import { ClipboardDocumentListIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
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

        {stats && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-xl p-4 shadow">
                <div className="text-sm text-gray-500">Total</div>
                <div className="text-2xl font-bold">{stats.resumen.total}</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow">
                <div className="text-sm text-gray-500">Completado</div>
                <div className="text-2xl font-bold text-green-600">{stats.resumen.completado}</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow">
                <div className="text-sm text-gray-500">Pendiente</div>
                <div className="text-2xl font-bold text-yellow-600">{stats.resumen.pendiente}</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow">
                <div className="text-sm text-gray-500">Vencido</div>
                <div className="text-2xl font-bold text-red-600">{stats.resumen.vencido}</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow">
                <div className="text-sm text-gray-500">Cumplimiento</div>
                <div className="text-2xl font-bold text-[#00796B]">{cumplimiento}%</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Evolución (últimos días)</div>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.serie} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorVenc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#dc2626" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fecha" tickFormatter={(d) => new Date(d).toLocaleDateString()} />
                    <YAxis allowDecimals={false} />
                    <Tooltip labelFormatter={(d) => new Date(d).toLocaleDateString()} />
                    <Legend />
                    <Area type="monotone" name="Completados" dataKey="completado" stroke="#16a34a" fillOpacity={1} fill="url(#colorComp)" />
                    <Area type="monotone" name="Vencidos" dataKey="vencido" stroke="#dc2626" fillOpacity={1} fill="url(#colorVenc)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Paciente</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Fecha inicio</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Frecuencia</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Estado</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500">Respuestas</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-6">
                    Cargando...
                  </td>
                </tr>
              ) : seguimientos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-6 text-center text-gray-500">
                    No hay seguimientos
                  </td>
                </tr>
              ) : (
                seguimientos.map((s) => (
                  <tr key={s.id_seguimiento} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.paciente_nombre}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(s.fecha_inicio).toLocaleDateString()}
                    </td>
                      <td className="px-6 py-4 text-sm text-gray-600 capitalize">{s.frecuencia_tipo || 'unica'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 capitalize">{s.tipo_seguimiento || 'texto'}</td>
                    <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoBadge(s.estado)}`}>
                          {s.estado.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleVerRespuestas(s)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm"
                      >
                        <ChatBubbleBottomCenterTextIcon className="w-4 h-4" />
                        Ver
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/dashboard/profesional/seguimiento/${s.id_seguimiento}`}
                        className="px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-sm"
                      >
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
