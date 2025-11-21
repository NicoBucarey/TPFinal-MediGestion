import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../stores/authStore';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const API = import.meta.env.VITE_API_URL;

const MisTurnos = () => {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token) || localStorage.getItem('token');
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Función para actualizar estado de turno
  const actualizarEstadoTurno = async (turnoId, nuevoEstado) => {
    try {
      await axios.put(`${API}/turnos/${turnoId}/estado`, 
        { estado: nuevoEstado },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Actualizar el estado local
      setTurnos(prev => prev.map(t => 
        t.id_turno === turnoId ? { ...t, estado: nuevoEstado } : t
      ));
      
      const mensajes = {
        'confirmado': 'Turno confirmado exitosamente',
        'en_curso': 'Consulta iniciada',
        'no_asistio': 'Marcado como "No asistió"',
        'cancelado': 'Turno cancelado'
      };
      
      toast.success(mensajes[nuevoEstado] || 'Estado actualizado');
    } catch (error) {
      console.error('Error actualizando estado:', error);
      toast.error('Error al actualizar el estado del turno');
    }
  };

  // Función específica para iniciar consulta (único cambio de estado que hace el profesional)
  const iniciarConsulta = (turnoId) => actualizarEstadoTurno(turnoId, 'en_curso');

  // Funciones auxiliares para formatear datos
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatearHora = (horaInicio, horaFin) => {
    const inicio = horaInicio ? horaInicio.slice(0, 5) : '';
    const fin = horaFin ? horaFin.slice(0, 5) : '';
    return `${inicio}-${fin}`;
  };

  const formatearPaciente = (turno) => {
    if (turno.paciente_nombre && turno.paciente_apellido) {
      return `${turno.paciente_nombre} ${turno.paciente_apellido}`;
    }
    return turno.paciente_nombre || turno.id_paciente || 'Sin datos';
  };

  const formatearEstado = (estado) => {
    const estados = {
      'pendiente': 'Pendiente',
      'confirmado': 'Confirmado',
      'en_curso': 'En Curso',
      'completado': 'Completado',
      'cancelado': 'Cancelado',
      'no_asistio': 'No Asistió'
    };
    return estados[estado?.toLowerCase()] || estado || '—';
  };

  useEffect(() => {
    const fetchTurnos = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const res = await axios.get(`${API}/turnos/profesional/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTurnos(res.data || []);
      } catch (e) {
        setTurnos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTurnos();
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Mis Turnos</h2>
          <p className="text-gray-600">Próximos 30 días</p>
        </div>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 w-1/5">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 w-1/6">Hora</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 w-1/4">Paciente</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 w-1/6">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 w-1/4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-6">Cargando...</td></tr>
              ) : turnos.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-6">No hay turnos</td></tr>
              ) : (
                turnos.map((t) => (
                  <tr key={t.id_turno} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {formatearFecha(t.fecha)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                      {formatearHora(t.hora_inicio, t.hora_fin)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatearPaciente(t)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        t.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                        t.estado === 'confirmado' ? 'bg-green-100 text-green-800' :
                        t.estado === 'en_curso' ? 'bg-blue-100 text-blue-800' :
                        t.estado === 'completado' ? 'bg-purple-100 text-purple-800' :
                        t.estado === 'cancelado' ? 'bg-red-100 text-red-800' :
                        t.estado === 'no_asistio' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {formatearEstado(t.estado)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {(() => {
                        const estado = String(t.estado || '').toLowerCase();
                        
                        // Definir qué acciones están disponibles según el estado
                        // Solo para profesionales: iniciar consulta y registrar nota
                        const puedeIniciar = estado === 'confirmado';
                        const puedeRegistrarNota = estado === 'en_curso';
                        const puedeVerNota = estado === 'completado';
                        
                        // Estados finales que no permiten acciones principales
                        if (['cancelado', 'no_asistio'].includes(estado)) {
                          return (
                            <span className="px-4 py-2 rounded-md bg-gray-100 text-gray-500 text-sm font-medium cursor-not-allowed whitespace-nowrap">
                              {estado === 'cancelado' ? 'Cancelado' : 'No asistió'}
                            </span>
                          );
                        }

                        // Estado pendiente - solo información
                        if (estado === 'pendiente') {
                          return (
                            <span className="px-4 py-2 rounded-md bg-yellow-100 text-yellow-700 text-sm font-medium whitespace-nowrap">
                              Esperando confirmación
                            </span>
                          );
                        }

                        // Estado completado - mostrar opciones post-consulta
                        if (estado === 'completado') {
                          return (
                            <div className="flex gap-2 justify-end items-center">
                              <Link 
                                to={`/dashboard/profesional/nota/${t.id_turno}`} 
                                className="px-4 py-2 rounded-md bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium transition-colors whitespace-nowrap"
                              >
                                👁️ Ver Nota
                              </Link>
                              <Link 
                                to={`/dashboard/profesional/turno/${t.id_turno}/seguimiento`} 
                                className="px-4 py-2 rounded-md bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium transition-colors whitespace-nowrap"
                              >
                                📋 Seguimiento
                              </Link>
                              <span className="px-4 py-2 rounded-md bg-purple-100 text-purple-700 text-sm font-medium whitespace-nowrap">
                                ✅ Completado
                              </span>
                            </div>
                          );
                        }

                        return (
                          <div className="flex gap-2 justify-end items-center">
                            {puedeIniciar && (
                              <Link
                                to={`/dashboard/profesional/nota/${t.id_turno}`}
                                className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors whitespace-nowrap"
                              >
                                🩺 Iniciar Consulta
                              </Link>
                            )}
                            
                            {puedeRegistrarNota && (
                              <>
                                <Link 
                                  to={`/dashboard/profesional/nota/${t.id_turno}`} 
                                  className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors whitespace-nowrap"
                                >
                                  📝 Registrar Nota
                                </Link>
                                <span className="px-4 py-2 rounded-md bg-blue-100 text-blue-700 text-sm font-medium whitespace-nowrap">
                                  🔵 En consulta
                                </span>
                              </>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MisTurnos;
