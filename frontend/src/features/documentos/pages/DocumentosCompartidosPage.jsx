import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../../stores/authStore';
import DocumentPreviewModal from '../../shared/components/DocumentPreviewModal';

const API = import.meta.env.VITE_API_URL;
const BASE = API.replace(/\/api$/, '');

const DocumentosCompartidosPage = () => {
  const token = useAuthStore((s) => s.token) || localStorage.getItem('token');
  const [docs, setDocs] = useState([]);
  const [tipo, setTipo] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState({ open: false, url: '', type: 'pdf' });

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (tipo !== 'todos') params.tipo = tipo;
      const res = await axios.get(`${API}/clinica/documentos`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocs(res.data);
    } catch (e) {
      void e;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [tipo]);

  const toggleCompartido = async (id, current) => {
    try {
      await axios.patch(`${API}/clinica/documentos/${id}/compartir`, { compartido: !current }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocs(docs.map(d => d.id_documento === id ? { ...d, compartido_con_paciente: !current } : d));
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Documentación</h2>
            <p className="text-gray-600">Gestión de documentos compartidos</p>
          </div>
          <div>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00796B]">
              <option value="todos">Todos</option>
              <option value="pdf">PDF</option>
              <option value="imagen">Imágenes</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Nombre</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Tipo</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Fecha</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Paciente</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Estado</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-6 py-6" colSpan={6}>Cargando...</td></tr>
              ) : docs.length === 0 ? (
                <tr><td className="px-6 py-6" colSpan={6}>Sin documentos</td></tr>
              ) : (
                docs.map((d) => (
                  <tr key={d.id_documento} className="border-t">
                    <td className="px-6 py-4 text-sm text-gray-900">{d.url.split('/').pop()}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{d.tipo_documento?.toUpperCase()}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(d.fecha).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{d.paciente}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${d.compartido_con_paciente ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {d.compartido_con_paciente ? 'Compartido' : 'Privado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-sm"
                        onClick={() => setPreview({ open: true, url: `${BASE}${d.url}`, type: d.tipo_documento === 'pdf' ? 'pdf' : 'image' })}>
                        Ver
                      </button>
                      <button className="px-3 py-1 rounded-md bg-[#00796B] hover:bg-[#00695c] text-white text-sm"
                        onClick={() => toggleCompartido(d.id_documento, d.compartido_con_paciente)}>
                        {d.compartido_con_paciente ? 'Privatizar' : 'Compartir'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <DocumentPreviewModal open={preview.open} onClose={() => setPreview({ open: false, url: '', type: 'pdf' })} url={preview.url} type={preview.type} />
      </div>
    </div>
  );
};

export default DocumentosCompartidosPage;
