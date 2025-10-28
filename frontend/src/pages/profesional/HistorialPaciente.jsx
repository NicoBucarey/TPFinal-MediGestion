import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import DocumentPreviewModal from '../../components/DocumentPreviewModal';
import { FunnelIcon } from '@heroicons/react/24/outline';

const API = import.meta.env.VITE_API_URL;
const BASE = API.replace(/\/api$/, '');

const HistorialPaciente = () => {
  const { pacienteId } = useParams();
  const token = useAuthStore((s) => s.token) || localStorage.getItem('token');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ desde: '', hasta: '', tipo: 'todos' });
  const [preview, setPreview] = useState({ open: false, url: '', type: 'pdf' });
  const [expanded, setExpanded] = useState(null);

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
      // Silencioso, se podría usar toast
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistorial(); }, [pacienteId]);
  useEffect(() => { fetchHistorial(); }, [filters]);

  const profesionales = useMemo(() => Array.from(new Set(items.map(i => i.profesional))).filter(Boolean), [items]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Historial Clínico</h2>
          <p className="text-gray-600">Notas y documentos del paciente</p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-xs text-gray-500">Desde</label>
              <input type="date" value={filters.desde} onChange={(e) => setFilters(f => ({ ...f, desde: e.target.value }))}
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00796B]" />
            </div>
            <div>
              <label className="block text-xs text-gray-500">Hasta</label>
              <input type="date" value={filters.hasta} onChange={(e) => setFilters(f => ({ ...f, hasta: e.target.value }))}
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00796B]" />
            </div>
            <div>
              <label className="block text-xs text-gray-500">Tipo</label>
              <select value={filters.tipo} onChange={(e) => setFilters(f => ({ ...f, tipo: e.target.value }))}
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00796B]">
                <option value="todos">Todos</option>
                <option value="nota">Notas</option>
                <option value="documento">Documentos</option>
              </select>
            </div>
            <div className="ml-auto flex items-center gap-2 text-gray-500 text-sm">
              <FunnelIcon className="w-5 h-5" />
              <span>{items.length} resultados</span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl shadow p-6">
          {loading ? (
            <div className="h-32 animate-pulse" />
          ) : items.length === 0 ? (
            <p className="text-gray-600">No hay registros.</p>
          ) : (
            <ol className="relative border-s-2 border-gray-100">
              {items.map((item) => (
                <li key={`${item.tipo}-${item.id}`} className="mb-10 ms-6">
                  <span className={`absolute -start-3 flex items-center justify-center w-6 h-6 rounded-full ring-8 ring-white ${item.tipo === 'nota' ? 'bg-[#00796B]' : 'bg-blue-500'}`}></span>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <time>{new Date(item.fecha).toLocaleString()}</time>
                    <span>•</span>
                    <span>{item.profesional}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100">{item.tipo}</span>
                  </div>
                  <div className="mt-2">
                    <button onClick={() => setExpanded(expanded === item.id ? null : item.id)} className="text-left w-full">
                      <h3 className="text-lg font-semibold text-gray-900">{item.tipo === 'nota' ? 'Nota clínica' : `${item.tipo_documento?.toUpperCase()}`}</h3>
                      <p className="text-gray-600 line-clamp-2">{item.tipo === 'nota' ? item.detalle : item.url}</p>
                    </button>
                    {expanded === item.id && (
                      <div className="mt-3 bg-gray-50 rounded-lg p-3">
                        {item.tipo === 'nota' ? (
                          <p className="whitespace-pre-wrap text-gray-800">{item.detalle}</p>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Documento: {item.url.split('/').pop()}</span>
                            <button
                              className="px-3 py-1 rounded-md bg-[#00796B] hover:bg-[#00695c] text-white text-sm"
                              onClick={() => setPreview({ open: true, url: `${BASE}${item.url}`, type: item.tipo_documento === 'pdf' ? 'pdf' : 'image' })}
                            >
                              Ver detalle
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <DocumentPreviewModal open={preview.open} onClose={() => setPreview({ open: false, url: '', type: 'pdf' })} url={preview.url} type={preview.type} />
    </div>
  );
};

export default HistorialPaciente;
