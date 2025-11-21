import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '../../stores/authStore';
import ModalDetalleTurno from './ModalDetalleTurno';

const RecepcionTurnos = () => {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
  const { token } = useAuthStore();

  const obtenerTurnosHoy = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/turnos/recepcion/hoy`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTurnos(data);
      } else {
        toast.error('Error al cargar turnos del día');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar turnos del día');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerTurnosHoy();
  }, [token]);

  const turnosFiltrados = turnos.filter(turno => {
    if (!busqueda) return true;
    const searchTerm = busqueda.toLowerCase();
    return (
      turno.paciente_nombre?.toLowerCase().includes(searchTerm) ||
      turno.paciente_apellido?.toLowerCase().includes(searchTerm) ||
      turno.profesional_nombre?.toLowerCase().includes(searchTerm) ||
      turno.profesional_apellido?.toLowerCase().includes(searchTerm)
    );
  });

  const abrirModal = (turno) => {
    setTurnoSeleccionado(turno);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setTurnoSeleccionado(null);
  };

  const handleEstadoActualizado = () => {
    obtenerTurnosHoy();
    cerrarModal();
  };

  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'confirmado': return 'bg-green-100 text-green-800';
      case 'en_curso': return 'bg-blue-100 text-blue-800';
      case 'completado': return 'bg-purple-100 text-purple-800';
      case 'no_asistio': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'teleconsulta': return '🎥';
      case 'periodico': return '🔄';
      default: return '👤';
    }
  };

  const formatearHora = (hora) => {
    return hora ? hora.slice(0, 5) : '';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 rounded-lg p-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Recepción de Turnos</h2>
              <p className="text-teal-100 text-sm">
                {new Date().toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
          <div className="text-white">
            <span className="text-2xl font-bold">{turnos.length}</span>
            <p className="text-sm text-teal-100">turnos hoy</p>
          </div>
        </div>
      </div>

      {/* Buscador */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar paciente o profesional..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
          <svg 
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Lista de Turnos */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando turnos...</p>
          </div>
        ) : turnosFiltrados.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {busqueda ? 'No se encontraron turnos con esa búsqueda' : 'No hay turnos para hoy'}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {turnosFiltrados.map((turno) => (
              <div 
                key={turno.id_turno}
                onClick={() => abrirModal(turno)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-semibold text-gray-900">
                        {formatearHora(turno.hora_inicio)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatearHora(turno.hora_fin)}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getTipoIcon(turno.tipo)}</span>
                        <span className="font-medium text-gray-900">
                          {turno.paciente_nombre} {turno.paciente_apellido}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Dr. {turno.profesional_nombre} {turno.profesional_apellido}
                        {turno.nombre_especialidad && (
                          <span className="ml-1 text-xs text-gray-500">
                            ({turno.nombre_especialidad})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(turno.estado)}`}>
                      {turno.estado}
                    </span>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalAbierto && (
        <ModalDetalleTurno 
          isOpen={modalAbierto}
          onClose={cerrarModal}
          turno={turnoSeleccionado}
          onEstadoActualizado={handleEstadoActualizado}
        />
      )}
    </div>
  );
};

export default RecepcionTurnos;