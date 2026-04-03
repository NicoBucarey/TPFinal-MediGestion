import { Link } from 'react-router-dom';
import { ClockIcon } from '@heroicons/react/24/outline';

const ProfesionalTurnosHoy = ({ loading, turnos = [] }) => {
  const nombrePaciente = (turno) => {
    const nombre = turno.paciente_nombre || turno.pac_nombre || '';
    const apellido = turno.paciente_apellido || turno.pac_apellido || '';
    const completo = `${nombre} ${apellido}`.trim();
    return completo || 'Paciente sin datos';
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Turnos de Hoy</h2>
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="animate-pulse flex space-x-4">
              <div className="h-12 w-12 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : turnos.length > 0 ? (
        <div className="space-y-3">
          {turnos.map((turno) => (
            <div key={turno.id_turno} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-500/10 p-3 rounded-lg">
                  <ClockIcon className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {turno.hora_inicio} - {nombrePaciente(turno)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {turno.motivo_consulta || 'Consulta general'}
                    {turno.tipo && (
                      <span className="ml-2 text-blue-600">
                        ({turno.tipo === 'teleconsulta' ? '🎥 Teleconsulta' : '👤 Presencial'})
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">Estado: {turno.estado}</p>
                </div>
              </div>
              <Link
                to={`/dashboard/profesional/nota/${turno.id_turno}`}
                className="text-blue-500 hover:text-blue-600 font-medium text-sm px-4 py-2 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
              >
                Ver detalle →
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">No tienes turnos programados para hoy</p>
      )}
    </div>
  );
};

export default ProfesionalTurnosHoy;
