import { useState, useEffect } from 'react';
import axios from 'axios';
import { DocumentIcon, CalendarIcon, UserIcon, ArrowDownTrayIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const tipoDocumentoOptions = [
  { value: '', label: 'Todos los tipos' },
  { value: 'laboratorio', label: 'Laboratorio' },
  { value: 'estudio', label: 'Estudio' },
  { value: 'receta', label: 'Receta' },
  { value: 'informe', label: 'Informe' },
  { value: 'otros', label: 'Otros' }
];

const MisDocumentos = () => {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('');

  useEffect(() => {
    fetchDocumentos();
  }, [filtroTipo]);

  const fetchDocumentos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = {};
      if (filtroTipo) params.tipo = filtroTipo;

      const response = await axios.get(`${API}/clinica/documentos/compartidos`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setDocumentos(response.data);
    } catch (error) {
      console.error('Error al cargar documentos:', error);
      toast.error('Error al cargar los documentos');
    } finally {
      setLoading(false);
    }
  };

  const handleDescargar = (url, nombre) => {
    try {
      // Extraer el nombre del archivo de la URL
      const filename = url.split('/').pop();
      const downloadUrl = `http://localhost:3000${url}`;
      
      // Crear un elemento <a> temporal para descargar
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = nombre || filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Descargando documento...');
    } catch (error) {
      console.error('Error al descargar:', error);
      toast.error('Error al descargar el documento');
    }
  };

  const handlePrevisualizar = (url) => {
    try {
      const fullUrl = `http://localhost:3000${url}`;
      window.open(fullUrl, '_blank');
    } catch (error) {
      console.error('Error al previsualizar:', error);
      toast.error('Error al abrir el documento');
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const getTipoBadgeColor = (tipo) => {
    const colors = {
      laboratorio: 'bg-purple-100 text-purple-800',
      estudio: 'bg-blue-100 text-blue-800',
      receta: 'bg-green-100 text-green-800',
      informe: 'bg-orange-100 text-orange-800',
      otros: 'bg-gray-100 text-gray-800'
    };
    return colors[tipo] || colors.otros;
  };

  const getFileExtension = (url) => {
    if (!url) return '';
    const ext = url.split('.').pop().toLowerCase();
    return ext;
  };

  const isImageFile = (url) => {
    const ext = getFileExtension(url);
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
  };

  const isPdfFile = (url) => {
    const ext = getFileExtension(url);
    return ext === 'pdf';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <DocumentIcon className="w-8 h-8 text-teal-600" />
              Mis Documentos Médicos
            </h1>
            <p className="text-gray-600 mt-1">
              Documentos compartidos por tus profesionales de la salud
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-teal-600">{documentos.length}</div>
            <div className="text-sm text-gray-500">documentos</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          <FunnelIcon className="w-5 h-5 text-gray-500" />
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            {tipoDocumentoOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de documentos */}
      {loading ? (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Cargando documentos...</p>
        </div>
      ) : documentos.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
          <DocumentIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No tienes documentos compartidos</p>
          <p className="text-gray-400 text-sm mt-2">
            Los documentos que tus profesionales compartan contigo aparecerán aquí
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documentos.map((doc) => (
            <div
              key={doc.id_documento}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <DocumentIcon className="w-5 h-5 text-teal-600" />
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getTipoBadgeColor(doc.tipo_documento)}`}>
                      {doc.tipo_documento || 'documento'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    {doc.url ? doc.url.split('/').pop() : 'Documento sin nombre'}
                  </h3>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-gray-400" />
                  <span>Dr/a. {doc.profesional}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-gray-400" />
                  <span>Subido: {formatFecha(doc.fecha)}</span>
                </div>
                {doc.fecha_turno && (
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                    <span>Turno: {formatFecha(doc.fecha_turno)}</span>
                  </div>
                )}
              </div>

              {/* Preview si es imagen o PDF */}
              {doc.url && (isImageFile(doc.url) || isPdfFile(doc.url)) && (
                <div className="mb-4 border border-gray-200 rounded overflow-hidden">
                  {isImageFile(doc.url) ? (
                    <img
                      src={`http://localhost:3000${doc.url}`}
                      alt="Vista previa"
                      className="w-full h-40 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => handlePrevisualizar(doc.url)}
                    />
                  ) : isPdfFile(doc.url) ? (
                    <div className="bg-gray-50 p-4 text-center">
                      <DocumentIcon className="w-12 h-12 text-red-500 mx-auto mb-2" />
                      <p className="text-xs text-gray-600">PDF Document</p>
                    </div>
                  ) : null}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handlePrevisualizar(doc.url)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <DocumentIcon className="w-4 h-4" />
                  Ver
                </button>
                <button
                  onClick={() => handleDescargar(doc.url, doc.url.split('/').pop())}
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Descargar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisDocumentos;
