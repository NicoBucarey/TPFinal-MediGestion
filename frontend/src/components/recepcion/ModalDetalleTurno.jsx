import { useState } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '../../stores/authStore';

const ModalDetalleTurno = ({ isOpen, onClose, turno, onEstadoActualizado }) => {
  const [actualizando, setActualizando] = useState(false);
  const { token } = useAuthStore();

  if (!isOpen || !turno) return null;

  const actualizarEstado = async (nuevoEstado) => {
    setActualizando(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/turnos/${turno.id_turno}/estado`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      if (response.ok) {
        const mensajes = {
          'confirmado': 'Turno confirmado exitosamente',
          'cancelado': 'Turno cancelado',
          'no_asistio': 'Marcado como "No asistió"'
        };
        toast.success(mensajes[nuevoEstado]);
        onEstadoActualizado();
      } else {
        toast.error('Error al actualizar el turno');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar el turno');
    } finally {
      setActualizando(false);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatearHora = (hora) => {
    return hora ? hora.slice(0, 5) : '';
  };

  const getTipoLabel = (tipo) => {
    switch (tipo) {
      case 'teleconsulta': return 'Teleconsulta';
      case 'periodico': return 'Turno Periódico';
      default: return 'Consulta Presencial';
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'teleconsulta': return '🎥';
      case 'periodico': return '🔄';
      default: return '👤';
    }
  };

  const puedeConfirmar = turno.estado === 'pendiente';
  const puedeCancelar = ['pendiente', 'confirmado'].includes(turno.estado);
  const puedeMarcarNoAsistio = turno.estado === 'confirmado';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{getTipoIcon(turno.tipo)}</span>
              <div>
                <h2 className="text-xl font-semibold text-white">Detalle del Turno</h2>
                <p className="text-teal-100 text-sm">{getTipoLabel(turno.tipo)}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-teal-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Información del horario */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">📅 Horario</h3>
            <div className="space-y-1">
              <p><strong>Fecha:</strong> {formatearFecha(turno.fecha)}</p>
              <p><strong>Hora:</strong> {formatearHora(turno.hora_inicio)} - {formatearHora(turno.hora_fin)}</p>
              <p><strong>Estado:</strong> 
                <span className="ml-2 px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                  {turno.estado}
                </span>
              </p>
            </div>
          </div>

          {/* Información del paciente */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">👤 Paciente</h3>
            <div className="space-y-1">
              <p><strong>Nombre:</strong> {turno.paciente_nombre} {turno.paciente_apellido}</p>
              {turno.paciente_telefono && (
                <p><strong>Teléfono:</strong> {turno.paciente_telefono}</p>
              )}
              {turno.paciente_email && (
                <p><strong>Email:</strong> {turno.paciente_email}</p>
              )}
            </div>
          </div>

          {/* Información del profesional */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-2">👨‍⚕️ Profesional</h3>
            <div className="space-y-1">
              <p><strong>Doctor:</strong> {turno.profesional_nombre} {turno.profesional_apellido}</p>
              {turno.nombre_especialidad && (
                <p><strong>Especialidad:</strong> {turno.nombre_especialidad}</p>
              )}
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="border-t border-gray-200 px-6 py-4">
          <h3 className="font-semibold text-gray-900 mb-3">🎯 Acciones</h3>
          <div className="flex flex-wrap gap-2">
            {puedeConfirmar && (
              <button
                onClick={() => actualizarEstado('confirmado')}
                disabled={actualizando}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {actualizando ? '...' : '✅ Confirmar Turno'}
              </button>
            )}
            
            {puedeMarcarNoAsistio && (
              <button
                onClick={() => actualizarEstado('no_asistio')}
                disabled={actualizando}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {actualizando ? '...' : '🚫 No Asistió'}
              </button>
            )}
            
            {puedeCancelar && (
              <button
                onClick={() => actualizarEstado('cancelado')}
                disabled={actualizando}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {actualizando ? '...' : '❌ Cancelar'}
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors mt-2"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalDetalleTurno;