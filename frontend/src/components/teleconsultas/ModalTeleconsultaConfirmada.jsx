import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ModalTeleconsultaConfirmada = ({ isOpen, onClose, teleconsultaData }) => {
  const navigate = useNavigate();
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCopiedLink(false);
    }
  }, [isOpen]);

  if (!isOpen || !teleconsultaData) return null;

  const handleCopyLink = () => {
    if (teleconsultaData.linkReunion) {
      navigator.clipboard.writeText(teleconsultaData.linkReunion);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleJoinMeeting = () => {
    if (teleconsultaData.linkReunion) {
      window.open(teleconsultaData.linkReunion, '_blank');
    }
  };

  const handleGoToTurnos = () => {
    onClose();
    navigate('/dashboard/paciente/turnos');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        {/* Header con ícono de éxito */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <div className="w-8 h-8 text-green-600">
              <svg fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">¡Teleconsulta Confirmada!</h2>
          <p className="text-gray-600">Tu consulta virtual ha sido programada exitosamente</p>
        </div>

        {/* Detalles de la teleconsulta */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-green-800 mb-3 flex items-center">
            <div className="w-5 h-5 mr-2">
              <svg fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            Detalles de la Teleconsulta
          </h3>
          <div className="space-y-2 text-sm text-green-700">
            <p><span className="font-medium">📅 Fecha:</span> {teleconsultaData.detalles?.fecha}</p>
            <p><span className="font-medium">🕐 Hora:</span> {teleconsultaData.detalles?.hora}</p>
            <p><span className="font-medium">💻 Plataforma:</span> {teleconsultaData.detalles?.plataforma}</p>
          </div>
        </div>

        {/* Enlace de reunión */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🔗 Enlace de Reunión
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={teleconsultaData.linkReunion || ''}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
            />
            <button
              onClick={handleCopyLink}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                copiedLink 
                  ? 'bg-green-500 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {copiedLink ? '✓' : '📋'}
            </button>
          </div>
          {copiedLink && (
            <p className="text-green-600 text-sm mt-1">¡Enlace copiado!</p>
          )}
        </div>

        {/* Información importante */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-blue-800 mb-2">📋 Información Importante</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Conectate 5 minutos antes de la cita</li>
            <li>• Asegurate de tener buena conexión a internet</li>
            <li>• Tené a mano tu documento y estudios médicos</li>
            <li>• Recibirás el enlace también por WhatsApp</li>
          </ul>
        </div>

        {/* Botones de acción */}
        <div className="flex space-x-3">
          <button
            onClick={handleJoinMeeting}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            <div className="w-4 h-4 mr-2">
              <svg fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
            Abrir Reunión
          </button>
          <button
            onClick={handleGoToTurnos}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Ver Mis Turnos
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalTeleconsultaConfirmada;