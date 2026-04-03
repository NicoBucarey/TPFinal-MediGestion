import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import DocumentPreviewModal from '../../shared/components/DocumentPreviewModal';
import { 
  FunnelIcon, 
  XMarkIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const API = import.meta.env.VITE_API_URL;
const BASE = API.replace(/\/api$/, '');

const HistorialPacientePage = () => {
  const { pacienteId } = useParams();
  const token = useAuthStore((s) => s.token) || localStorage.getItem('token');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ desde: '', hasta: '', tipo: 'todos' });
  const [preview, setPreview] = useState({ open: false, url: '', type: 'pdf' });
  const [modalNota, setModalNota] = useState({ open: false, item: null });

  const pacienteNombre = items.length > 0 ? items[0].paciente : null;

  const fetchHistorial = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.desde) params.desde = filters.desde;
      if (filters.hasta) params.hasta = filters.hasta;
      if (filters.tipo !== 'todos') params.tipo = filters.tipo;
      const res = await axios.get(`${API}/clinica/paciente/${pacienteId}/historial`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(res.data);
    } catch (e) {
      console.error('Error al obtener historial:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorial();
  }, [pacienteId]);

  useEffect(() => {
    fetchHistorial();
  }, [filters]);

  const formatFecha = (fecha) => {
    if (!fecha) return 'Fecha no disponible';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFechaCorta = (fecha) => {
    if (!fecha) return 'Sin fecha';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const abrirModalNota = (item) => {
    setModalNota({ open: true, item });
  };

  const cerrarModalNota = () => {
    setModalNota({ open: false, item: null });
  };

  const profesionales = useMemo(() => Array.from(new Set(items.map(i => i.profesional))).filter(Boolean), [items]);
  void profesionales;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-gradient-to-r from-white to-blue-50 rounded-3xl shadow-xl border border-blue-100 p-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <UserIcon className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {pacienteNombre || 'Cargando paciente...'}
              </h1>
              <div className="flex items-center gap-6 text-gray-600">
                <div className="flex items-center gap-2">
                  <ClipboardDocumentListIcon className="w-5 h-5" />
                  <span>{items.length} registros en historial</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-gray-500" />
              <span className="font-semibold text-gray-700">Filtros:</span>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Desde</label>
                <input 
                  type="date" 
                  value={filters.desde} 
                  onChange={(e) => setFilters(f => ({ ...f, desde: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Hasta</label>
                <input 
                  type="date" 
                  value={filters.hasta} 
                  onChange={(e) => setFilters(f => ({ ...f, hasta: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
                <select 
                  value={filters.tipo} 
                  onChange={(e) => setFilters(f => ({ ...f, tipo: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="todos">Todos</option>
                  <option value="nota">Notas clínicas</option>
                  <option value="documento">Documentos</option>
                </select>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2 text-gray-500 text-sm bg-gray-100 px-3 py-2 rounded-lg">
              <span className="font-medium">{items.length} resultados</span>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <ClipboardDocumentListIcon className="w-6 h-6 text-blue-600" />
              Historial Clínico
            </h2>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ClipboardDocumentListIcon className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Sin registros</h3>
                <p className="text-gray-500">No se encontraron notas ni documentos para este paciente</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div 
                    key={`${item.tipo}-${item.id}`} 
                    className="group relative bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                            item.tipo === 'nota' 
                              ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                              : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                          }`}>
                            {item.tipo === 'nota' ? (
                              <ClipboardDocumentListIcon className="w-6 h-6 text-white" />
                            ) : (
                              <DocumentTextIcon className="w-6 h-6 text-white" />
                            )}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-medium text-gray-900">
                              {formatFechaCorta(item.fecha)}
                            </span>
                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                            <span className="text-sm text-gray-600">Dr/a. {item.profesional}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.tipo === 'nota' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {item.tipo === 'nota' ? 'Nota Clínica' : item.tipo_documento?.toUpperCase() || 'Documento'}
                            </span>
                          </div>

                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {item.tipo === 'nota' 
                              ? 'Nota Clínica' 
                              : item.tipo_documento === 'pdf' ? 'Documento PDF' :
                                item.tipo_documento === 'imagen' || item.tipo_documento === 'image' ? 'Imagen' :
                                item.tipo_documento?.charAt(0).toUpperCase() + item.tipo_documento?.slice(1) || 'Documento'
                            }
                          </h3>

                          <p className="text-gray-600 line-clamp-2 mb-3">
                            {item.tipo === 'nota' 
                              ? item.detalle?.substring(0, 120) + (item.detalle?.length > 120 ? '...' : '')
                              : item.tipo_documento === 'pdf' ? 'Documento en formato PDF' :
                                item.tipo_documento === 'imagen' || item.tipo_documento === 'image' ? 'Archivo de imagen' :
                                'Archivo adjunto'
                            }
                          </p>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => item.tipo === 'nota' ? abrirModalNota(item) : setPreview({ 
                                open: true, 
                                url: `${BASE}${item.url}`, 
                                type: item.tipo_documento === 'pdf' ? 'pdf' : 'image' 
                              })}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                item.tipo === 'nota'
                                  ? 'bg-green-600 hover:bg-green-700 text-white'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                              }`}
                            >
                              {item.tipo === 'nota' ? 'Ver nota completa' : 'Abrir archivo'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {modalNota.open && modalNota.item && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <ClipboardDocumentListIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Nota Clínica</h2>
                    <p className="text-green-100">{formatFecha(modalNota.item.fecha)}</p>
                  </div>
                </div>
                <button 
                  onClick={cerrarModalNota}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <UserIcon className="w-6 h-6 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Profesional</p>
                    <p className="text-gray-600">Dr/a. {modalNota.item.profesional}</p>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <ClipboardDocumentListIcon className="w-5 h-5 text-green-600" />
                    Detalles de la consulta
                  </h3>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {modalNota.item.detalle}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <DocumentPreviewModal 
        open={preview.open} 
        onClose={() => setPreview({ open: false, url: '', type: 'pdf' })} 
        url={preview.url} 
        type={preview.type} 
      />
    </div>
  );
};

export default HistorialPacientePage;
