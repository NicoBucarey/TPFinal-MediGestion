import { useAuthStore } from '../../../stores/authStore';
import { toast } from 'sonner';

const ModalInfoTurno = ({ isOpen, onClose, turnoData }) => {
  const { user } = useAuthStore();
  
  if (!isOpen || !turnoData) return null;

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };

  const getTipoIcon = (tipo) => {
    const tipoTurno = tipo || 'presencial';
    switch(tipoTurno) {
      case 'teleconsulta': return '🎥';
      case 'periodico': return '🔄';
      default: return '👤';
    }
  };

  const getTipoLabel = (tipo) => {
    const tipoTurno = tipo || 'presencial';
    switch(tipoTurno) {
      case 'teleconsulta': return 'Teleconsulta';
      case 'periodico': return 'Turno Periódico';
      default: return 'Consulta Presencial';
    }
  };

  const canViewPatientDetails = user?.rol === 'profesional' || user?.rol === 'secretario';
  const canManageTurno = user?.rol === 'profesional' || user?.rol === 'secretario';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center">
            <span className="text-2xl mr-3">{getTipoIcon(turnoData.tipo)}</span>
            <h2 className="text-xl font-semibold">Información del Turno</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Tipo de consulta */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Tipo de consulta</p>
            <p className="font-medium">{getTipoLabel(turnoData.tipo)}</p>
          </div>

          {/* Información del paciente */}
          {canViewPatientDetails && (
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700">Paciente</h3>
              <div className="grid grid-cols-1 gap-2 bg-blue-50 p-3 rounded-lg">
                <p>
                  <span className="font-medium">Nombre:</span> 
                  {turnoData.paciente_nombre && turnoData.paciente_apellido 
                    ? ` ${turnoData.paciente_nombre} ${turnoData.paciente_apellido}`
                    : ' Información no disponible'
                  }
                </p>
                {turnoData.paciente_telefono && (
                  <p><span className="font-medium">Teléfono:</span> {turnoData.paciente_telefono}</p>
                )}
                {turnoData.paciente_email && (
                  <p><span className="font-medium">Email:</span> {turnoData.paciente_email}</p>
                )}
              </div>
            </div>
          )}

          {/* Información del horario */}
          <div className="space-y-2">
            <h3 className="font-medium text-gray-700">Horario</h3>
            <div className="bg-green-50 p-3 rounded-lg space-y-1">
              <p><span className="font-medium">Fecha:</span> {formatFecha(turnoData.fecha)}</p>
              <p><span className="font-medium">Hora:</span> {turnoData.hora_inicio} - {turnoData.hora_fin}</p>
              <p><span className="font-medium">Estado:</span> 
                <span className="ml-2 inline-flex px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  {turnoData.estado || 'Confirmado'}
                </span>
              </p>
            </div>
          </div>

          {/* Información específica por tipo */}
          {(turnoData.tipo === 'teleconsulta') && (
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700">Teleconsulta</h3>
              <div className="bg-green-50 p-3 rounded-lg space-y-1">
                <p><span className="font-medium">Plataforma:</span> {turnoData.plataforma || 'Jitsi Meet'}</p>
                <p className="text-sm text-green-700">
                  📱 El enlace de reunión fue enviado automáticamente por WhatsApp
                </p>
                {turnoData.link_reunion && (
                  <p className="text-sm text-gray-600 break-all">
                    <span className="font-medium">Enlace:</span> {turnoData.link_reunion}
                  </p>
                )}
              </div>
            </div>
          )}

          {(turnoData.tipo === 'periodico') && (
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700">Serie Periódica</h3>
              <div className="bg-purple-50 p-3 rounded-lg space-y-1">
                <p><span className="font-medium">Frecuencia:</span> {turnoData.tipo_periodicidad || 'Semanal'}</p>
                {turnoData.fecha_fin && (
                  <p><span className="font-medium">Hasta:</span> {formatFecha(turnoData.fecha_fin)}</p>
                )}
              </div>
            </div>
          )}

          {/* Motivo de consulta */}
          {turnoData.motivo_consulta && (
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700">Motivo de Consulta</h3>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm">{turnoData.motivo_consulta}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer con acciones */}
        {canManageTurno && (
          <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cerrar
            </button>
            
            {/* Botón de cancelar turno */}
            <button 
              onClick={() => {
                toast.info('La cancelación de turno estará disponible próximamente');
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Cancelar Turno
            </button>

            {/* Botón de reprogramar solo para turnos simples */}
            {turnoData.tipo !== 'periodico' && (
              <button 
                onClick={() => {
                  toast.info('La reprogramación estará disponible próximamente');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Reprogramar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalInfoTurno;
