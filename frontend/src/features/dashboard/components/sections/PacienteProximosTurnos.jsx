import { Link } from 'react-router-dom';
import { CalendarIcon } from '@heroicons/react/24/outline';

const PacienteProximosTurnos = ({ loading, turnos = [] }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Mis Próximos Turnos</h2>
        <Link to="/dashboard/paciente/turnos" className="text-primary hover:text-primary-dark font-medium text-sm">
          Ver todos →
        </Link>
      </div>
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="animate-pulse flex space-x-4">
              <div className="h-16 w-16 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : turnos.length > 0 ? (
        <div className="space-y-3">
          {turnos.slice(0, 3).map((turno) => (
            <div key={turno.id_turno} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <CalendarIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {new Date(turno.fecha).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </p>
                  <p className="text-sm text-gray-600">
                    {turno.hora_inicio} - Dr./Dra. {turno.profesional_apellido}
                  </p>
                  {turno.motivo_consulta && (
                    <p className="text-xs text-gray-500 mt-1">{turno.motivo_consulta}</p>
                  )}
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  turno.estado === 'pendiente'
                    ? 'bg-yellow-100 text-yellow-800'
                    : turno.estado === 'confirmado'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                }`}
              >
                {turno.estado}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No tienes turnos próximos programados</p>
          <Link to="/dashboard/paciente/buscar-profesional" className="btn-primary inline-block">
            Agendar un turno
          </Link>
        </div>
      )}
    </div>
  );
};

export default PacienteProximosTurnos;
