import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  QuestionMarkCircleIcon,
  UserIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const SeguimientoPublico = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Estados principales
  const [seguimiento, setSeguimiento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados del modal (copiados del sistema actual)
  const [preguntasPersonalizadas, setPreguntasPersonalizadas] = useState([]);
  const [respuestasPreguntas, setRespuestasPreguntas] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  // Estados para formato viejo (fallback)
  const [respuesta, setRespuesta] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [cumplimiento, setCumplimiento] = useState(true);
  const [sintomasReportados, setSintomasReportados] = useState('');
  
  // Estado de éxito
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSeguimiento();
    }
  }, [id]);

  const fetchSeguimiento = async () => {
    setLoading(true);
    setError(null);
    try {
      // Usar API pública (sin token)
      const response = await axios.get(`${API}/seguimiento/publico/${id}`);
      const data = response.data;
      
      setSeguimiento(data.seguimiento);
      setPreguntasPersonalizadas(data.preguntas || []);
      
      // Verificar si ya está completado
      if (data.seguimiento?.estado === 'completado') {
        setCompleted(true);
      }
      
      // Inicializar respuestas vacías
      const respuestasIniciales = {};
      data.preguntas?.forEach(pregunta => {
        respuestasIniciales[pregunta.id_pregunta] = {
          texto: '',
          numerica: null,
          booleana: null,
          opcion: ''
        };
      });
      setRespuestasPreguntas(respuestasIniciales);
      
    } catch (error) {
      console.error('Error al cargar seguimiento:', error);
      setError('No se pudo cargar el seguimiento. Verifica que el enlace sea correcto.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRespuesta = async (e) => {
    e.preventDefault();
    
    // Si hay preguntas personalizadas, usar ese formato (igual que el sistema actual)
    if (preguntasPersonalizadas.length > 0) {
      // Validar que todas las preguntas obligatorias estén respondidas
      const preguntasObligatorias = preguntasPersonalizadas.filter(p => p.obligatoria);
      const faltanRespuestas = preguntasObligatorias.some(pregunta => {
        const respuesta = respuestasPreguntas[pregunta.id_pregunta];
        if (!respuesta) return true;
        
        switch (pregunta.tipo_respuesta) {
          case 'texto':
            return !respuesta.texto?.trim();
          case 'escala':
            return respuesta.numerica === null || respuesta.numerica === '';
          case 'sino':
            return respuesta.booleana === null;
          case 'opcion':
            return !respuesta.opcion?.trim();
          default:
            return true;
        }
      });

      if (faltanRespuestas) {
        alert('Por favor completa todas las preguntas obligatorias');
        return;
      }

      setSubmitting(true);
      try {
        // Preparar respuestas en formato simple para API pública
        const respuestasFormateadas = {};
        preguntasPersonalizadas.forEach(pregunta => {
          const respuesta = respuestasPreguntas[pregunta.id_pregunta];
          
          switch (pregunta.tipo_respuesta) {
            case 'texto':
              respuestasFormateadas[pregunta.id_pregunta] = respuesta.texto;
              break;
            case 'escala':
              respuestasFormateadas[pregunta.id_pregunta] = respuesta.numerica?.toString();
              break;
            case 'sino':
              respuestasFormateadas[pregunta.id_pregunta] = respuesta.booleana ? 'Si' : 'No';
              break;
            case 'opcion':
              respuestasFormateadas[pregunta.id_pregunta] = respuesta.opcion;
              break;
          }
        });

        await axios.post(`${API}/seguimiento/${id}/respuesta`, {
          respuestas: respuestasFormateadas
        });

        setCompleted(true);
      } catch (error) {
        console.error('Error al enviar respuestas:', error);
        alert(error.response?.data?.message || 'Error al enviar las respuestas');
      } finally {
        setSubmitting(false);
      }
    } else {
      // Usar formato viejo para seguimientos sin preguntas personalizadas
      if (!respuesta.trim()) {
        alert('Debe ingresar una respuesta');
        return;
      }

      setSubmitting(true);
      try {
        await axios.post(`${API}/seguimiento/${id}/respuesta`, {
          respuestas: {
            respuesta_general: respuesta.trim(),
            observaciones: observaciones.trim() || null,
            sintomas_reportados: sintomasReportados.trim() || null,
            cumplimiento
          }
        });

        setCompleted(true);
      } catch (error) {
        console.error('Error al enviar respuesta:', error);
        alert(error.response?.data?.message || 'Error al enviar la respuesta');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleRespuestaPregunta = (idPregunta, tipo, valor) => {
    setRespuestasPreguntas(prev => ({
      ...prev,
      [idPregunta]: {
        ...prev[idPregunta],
        [tipo]: valor
      }
    }));
  };

  const renderPreguntaPersonalizada = (pregunta) => {
    const respuesta = respuestasPreguntas[pregunta.id_pregunta] || {};

    switch (pregunta.tipo_respuesta) {
      case 'texto':
        return (
          <textarea
            value={respuesta.texto || ''}
            onChange={(e) => handleRespuestaPregunta(pregunta.id_pregunta, 'texto', e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
            placeholder="Escribe tu respuesta aquí..."
            required={pregunta.obligatoria}
          />
        );

      case 'escala':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>1 (Muy malo)</span>
              <span>10 (Excelente)</span>
            </div>
            <div className="flex gap-2">
              {[...Array(10)].map((_, i) => {
                const valor = i + 1;
                const seleccionado = respuesta.numerica === valor;
                return (
                  <button
                    key={valor}
                    type="button"
                    onClick={() => handleRespuestaPregunta(pregunta.id_pregunta, 'numerica', valor)}
                    className={`w-10 h-10 rounded-full border-2 font-medium text-sm transition-colors ${
                      seleccionado 
                        ? 'bg-teal-600 text-white border-teal-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:border-teal-300'
                    }`}
                  >
                    {valor}
                  </button>
                );
              })}
            </div>
            {respuesta.numerica && (
              <p className="text-sm text-gray-600 text-center">
                Seleccionaste: <span className="font-medium">{respuesta.numerica}</span>
              </p>
            )}
          </div>
        );

      case 'sino':
        return (
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name={`pregunta_${pregunta.id_pregunta}`}
                checked={respuesta.booleana === true}
                onChange={() => handleRespuestaPregunta(pregunta.id_pregunta, 'booleana', true)}
                className="w-4 h-4 text-teal-600 focus:ring-teal-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Sí</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name={`pregunta_${pregunta.id_pregunta}`}
                checked={respuesta.booleana === false}
                onChange={() => handleRespuestaPregunta(pregunta.id_pregunta, 'booleana', false)}
                className="w-4 h-4 text-teal-600 focus:ring-teal-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">No</span>
            </label>
          </div>
        );

      case 'opcion':
        return (
          <div className="space-y-2">
            {pregunta.opciones?.map((opcion, index) => (
              <label key={index} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name={`pregunta_${pregunta.id_pregunta}`}
                  checked={respuesta.opcion === opcion}
                  onChange={() => handleRespuestaPregunta(pregunta.id_pregunta, 'opcion', opcion)}
                  className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                />
                <span className="ml-3 text-sm text-gray-700">{opcion}</span>
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-AR');
  };

  // Estados de carga y error
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Cargando seguimiento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center max-w-md">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center max-w-md">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">¡Respuesta Enviada!</h1>
          <p className="text-gray-600 mb-4">
            Gracias por completar tu seguimiento. Tu profesional revisará tus respuestas.
          </p>
          <button
            onClick={() => window.close()}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <QuestionMarkCircleIcon className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Seguimiento Médico</h1>
              <p className="text-gray-600 mt-2">
                Completa este seguimiento para mantener informado a tu profesional
              </p>
            </div>

            {/* Información del seguimiento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <UserIcon className="w-4 h-4 text-gray-400" />
                <span>
                  Dr/a. {seguimiento?.profesional?.nombre} {seguimiento?.profesional?.apellido}
                  {seguimiento?.profesional?.profesion && seguimiento?.profesional?.especialidad && (
                    <span className="ml-1 text-teal-600">
                      ({seguimiento.profesional.profesion} - {seguimiento.profesional.especialidad})
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CalendarIcon className="w-4 h-4 text-gray-400" />
                <span>
                  Inicio: {formatFecha(seguimiento?.fechaInicio)}
                  {seguimiento?.fechaFin && ` - Fin: ${formatFecha(seguimiento.fechaFin)}`}
                </span>
              </div>

              {seguimiento?.paciente && (
                <div className="md:col-span-2 text-sm text-gray-600">
                  <span className="font-medium">Paciente: </span>
                  {seguimiento.paciente.nombre} {seguimiento.paciente.apellido}
                </div>
              )}
            </div>

            {/* Instrucciones */}
            {seguimiento?.instrucciones && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  📋 Instrucciones del profesional:
                </p>
                <p className="text-sm text-blue-800 whitespace-pre-wrap">
                  {seguimiento.instrucciones}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmitRespuesta} className="p-6 space-y-6">
            {/* Preguntas personalizadas */}
            {preguntasPersonalizadas.length > 0 && (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-2">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <QuestionMarkCircleIcon className="w-5 h-5 text-teal-600" />
                    Preguntas del seguimiento
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Responde todas las preguntas para completar tu seguimiento
                  </p>
                </div>

                {preguntasPersonalizadas.map((pregunta, index) => (
                  <div key={pregunta.id_pregunta} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">
                        Pregunta {index + 1} 
                        {pregunta.obligatoria && <span className="text-red-500 ml-1">*</span>}
                      </h4>
                      <p className="text-gray-700">{pregunta.texto_pregunta}</p>
                    </div>
                    
                    {renderPreguntaPersonalizada(pregunta)}
                  </div>
                ))}
              </div>
            )}

            {/* Formato viejo (fallback para seguimientos sin preguntas personalizadas) */}
            {preguntasPersonalizadas.length === 0 && (
              <div className="space-y-4">
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
                {seguimiento?.tipo_seguimiento === 'sintomas' && (
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
              </div>
            )}

            {/* Observaciones adicionales (siempre disponible) */}
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

            {/* Botón de envío */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                {submitting ? 'Enviando...' : 'Enviar Respuesta'}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>MediGestion - Sistema de Seguimientos Médicos</p>
        </div>
      </div>
    </div>
  );
};

export default SeguimientoPublico;
