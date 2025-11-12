import { useState } from 'react';

const TeleconsultaConfirmadaModal = ({ isOpen, onClose, teleconsultaData }) => {
  const [enlaceCopado, setEnlaceCopado] = useState(false);

  if (!isOpen || !teleconsultaData) return null;

  const { fecha, profesional, linkReunion } = teleconsultaData;

  const copiarEnlace = async () => {
    try {
      await navigator.clipboard.writeText(linkReunion);
      setEnlaceCopado(true);
      setTimeout(() => setEnlaceCopado(false), 2000);
    } catch (err) {
      console.error('Error al copiar enlace:', err);
    }
  };

  const abrirReunion = () => {
    window.open(linkReunion, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black opacity-50"></div>
      
      {/* Modal */}
      <div className="bg-white rounded-lg p-6 w-96 relative z-10 max-h-[90vh] overflow-y-auto">
        <div className="text-center">
          {/* Icono de éxito */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            ¡Teleconsulta Confirmada!
          </h3>
          
          <div className="text-sm text-gray-600 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="font-medium text-green-800 mb-2">Detalles de tu teleconsulta:</p>
              <div className="text-left space-y-2">
                <p><span className="font-medium">👨‍⚕️ Profesional:</span> {profesional}</p>
                <p><span className="font-medium">📅 Fecha y hora:</span> {fecha}</p>
              </div>
            </div>

            {/* Enlace de reunión */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="font-medium text-blue-800 mb-3">🔗 Enlace de tu videollamada:</p>
              <div className="bg-white border border-blue-300 rounded p-2 mb-3">
                <code className="text-xs text-blue-900 break-all">{linkReunion}</code>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={copiarEnlace}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {enlaceCopado ? '✓ Copiado!' : '📋 Copiar enlace'}
                </button>
                <button
                  onClick={abrirReunion}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  🎥 Abrir reunión
                </button>
              </div>
            </div>

            {/* Información importante */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
              <p className="font-medium text-yellow-800 mb-2">📧 Información enviada por email:</p>
              <ul className="text-yellow-700 text-xs space-y-1">
                <li>• Confirmación de teleconsulta</li>
                <li>• Enlace de reunión</li>
                <li>• Recordatorio 15 minutos antes</li>
                <li>• Instrucciones para unirse</li>
              </ul>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-4 text-left">
              <p className="font-medium text-gray-700 text-xs mb-1">💡 Consejos para tu teleconsulta:</p>
              <ul className="text-gray-600 text-xs space-y-1">
                <li>• Únete 5 minutos antes</li>
                <li>• Usa auriculares para mejor audio</li>
                <li>• Asegúrate de tener buena conexión</li>
                <li>• Ten tus documentos médicos listos</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeleconsultaConfirmadaModal;