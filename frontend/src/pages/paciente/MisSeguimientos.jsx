import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../stores/authStore';
import { 
  ClipboardDocumentListIcon, 
  CalendarIcon, 
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const MisSeguimientos = () => {
  const { user } = useAuthStore();
  const [seguimientos, setSeguimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeguimiento, setSelectedSeguimiento] = useState(null);
  const [showModalResponder, setShowModalResponder] = useState(false);
  const [respuesta, setRespuesta] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [cumplimiento, setCumplimiento] = useState(true);
  const [sintomasReportados, setSintomasReportados] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSeguimientos();
  }, []);

  const fetchSeguimientos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/seguimiento/paciente/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSeguimientos(response.data);
    } catch (error) {
      console.error('Error al cargar seguimientos:', error);
      toast.error('Error al cargar seguimientos');
    } finally {
      setLoading(false);
    }
  };

  const handleResponder = (seguimiento) => {
    setSelectedSeguimiento(seguimiento);
    setRespuesta('');
    setObservaciones('');
    setCumplimiento(true);
    setSintomasReportados('');
    setShowModalResponder(true);
  };

  const handleSubmitRespuesta = async (e) => {
    e.preventDefault();
    
    if (!respuesta.trim()) {
      toast.error('Debe ingresar una respuesta');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/seguimientos/${selectedSeguimiento.id_seguimiento}/responder`,
        {
          respuesta: respuesta.trim(),
          observaciones: observaciones.trim() || null,
          sintomas_reportados: sintomasReportados.trim() || null,
          cumplimiento
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Respuesta registrada exitosamente');
      setShowModalResponder(false);
      fetchSeguimientos();
    } catch (error) {
      console.error('Error al enviar respuesta:', error);
      toast.error(error.response?.data?.message || 'Error al enviar la respuesta');
    } finally {
      setSubmitting(false);
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

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendiente' },
      en_curso: { color: 'bg-blue-100 text-blue-800', label: 'En Curso' },
      completado: { color: 'bg-green-100 text-green-800', label: 'Completado' },
      vencido: { color: 'bg-red-100 text-red-800', label: 'Vencido' }
    };
    return badges[estado] || badges.pendiente;
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'checklist':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'sintomas':
        return <ExclamationCircleIcon className="w-5 h-5" />;
      default:
        return <ChatBubbleBottomCenterTextIcon className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ClipboardDocumentListIcon className="w-8 h-8 text-teal-600" />
              Mis Seguimientos
            </h1>
            <p className="text-gray-600 mt-1">
              Instrucciones post-consulta de tus profesionales
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-teal-600">{seguimientos.length}</div>
            <div className="text-sm text-gray-500">seguimientos</div>
          </div>
        </div>
      </div>

      {/* Lista de seguimientos */}
      {loading ? (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Cargando seguimientos...</p>
        </div>
      ) : seguimientos.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
          <ClipboardDocumentListIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No tienes seguimientos asignados</p>
          <p className="text-gray-400 text-sm mt-2">
            Los seguimientos post-consulta aparecerán aquí
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {seguimientos.map((seg) => {
            const badge = getEstadoBadge(seg.estado);
            return (
              <div
                key={seg.id_seguimiento}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-teal-600">
                      {getTipoIcon(seg.tipo_seguimiento)}
                    </div>
                    <div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {seg.frecuencia_tipo === 'unica' && 'Único'}
                    {seg.frecuencia_tipo === 'diaria' && 'Diario'}
                    {seg.frecuencia_tipo === 'semanal' && 'Semanal'}
                    {seg.frecuencia_tipo === 'personalizada' && `Cada ${seg.intervalo_dias} días`}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <UserIcon className="w-4 h-4 text-gray-400" />
                    <span>Dr/a. {seg.nombre_profesional}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                    <span>
                      Inicio: {formatFecha(seg.fecha_inicio)}
                      {seg.fecha_fin && ` - Fin: ${formatFecha(seg.fecha_fin)}`}
                    </span>
                  </div>

                  {seg.instrucciones && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-semibold text-blue-900 mb-2">
                        📋 Instrucciones:
                      </p>
                      <p className="text-sm text-blue-800 whitespace-pre-wrap">
                        {seg.instrucciones}
                      </p>
                    </div>
                  )}

                  {seg.tiene_respuestas && (
                    <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>Ya has respondido este seguimiento</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                  <button
                    onClick={() => handleResponder(seg)}
                    disabled={seg.estado === 'completado' || seg.estado === 'vencido'}
                    className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <ChatBubbleBottomCenterTextIcon className="w-4 h-4" />
                    Responder
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Responder */}
      {showModalResponder && selectedSeguimiento && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Responder Seguimiento
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Dr/a. {selectedSeguimiento.nombre_profesional}
              </p>
            </div>

            <form onSubmit={handleSubmitRespuesta} className="p-6 space-y-4">
              {/* Instrucciones */}
              {selectedSeguimiento.instrucciones && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-semibold text-blue-900 mb-2">
                    📋 Instrucciones del profesional:
                  </p>
                  <p className="text-sm text-blue-800 whitespace-pre-wrap">
                    {selectedSeguimiento.instrucciones}
                  </p>
                </div>
              )}

              {/* Respuesta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Respuesta <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={respuesta}
                  onChange={(e) => setRespuesta(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Describe cómo has seguido las instrucciones..."
                />
              </div>

              {/* Cumplimiento */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="cumplimiento"
                  checked={cumplimiento}
                  onChange={(e) => setCumplimiento(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                />
                <label htmlFor="cumplimiento" className="text-sm text-gray-700">
                  He cumplido con las instrucciones
                </label>
              </div>

              {/* Síntomas */}
              {selectedSeguimiento.tipo_seguimiento === 'sintomas' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Síntomas Reportados
                  </label>
                  <textarea
                    value={sintomasReportados}
                    onChange={(e) => setSintomasReportados(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="¿Has experimentado algún síntoma? Descríbelo..."
                  />
                </div>
              )}

              {/* Observaciones */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones adicionales
                </label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Agrega cualquier comentario adicional..."
                />
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModalResponder(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Enviando...' : 'Enviar Respuesta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MisSeguimientos;
