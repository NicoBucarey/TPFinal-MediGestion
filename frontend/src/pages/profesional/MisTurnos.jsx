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

  // Funciones específicas para cada acción
  const confirmarTurno = (turnoId) => actualizarEstadoTurno(turnoId, 'confirmado');
  const iniciarConsulta = (turnoId) => actualizarEstadoTurno(turnoId, 'en_curso');
  const marcarNoAsistio = (turnoId) => actualizarEstadoTurno(turnoId, 'no_asistio');

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
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Hora</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Paciente</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Estado</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-6">Cargando...</td></tr>
              ) : turnos.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-6">No hay turnos</td></tr>
              ) : (
                turnos.map((t) => (
                  <tr key={t.id_turno} className="border-t">
                    <td className="px-6 py-4 text-sm">{t.fecha}</td>
                    <td className="px-6 py-4 text-sm">{t.hora_inicio?.slice(0,5)} - {t.hora_fin?.slice(0,5)}</td>
                    <td className="px-6 py-4 text-sm">{t.paciente_nombre || t.id_paciente}</td>
                    <td className="px-6 py-4 text-sm">{t.estado || '—'}</td>
                    <td className="px-6 py-4 text-right">
                      {(() => {
                        const estado = String(t.estado || '').toLowerCase();
                        
                        // Definir qué acciones están disponibles según el estado
                        const puedeConfirmar = estado === 'pendiente';
                        const puedeIniciar = estado === 'confirmado';
                        const puedeRegistrarNota = ['confirmado', 'en_curso'].includes(estado);
                        const puedeMarcarNoAsistio = estado === 'confirmado';
                        
                        // Estados que no permiten acciones
                        if (['completado', 'cancelado', 'no_asistio'].includes(estado)) {
                          return (
                            <span className="px-3 py-1.5 rounded-md bg-gray-100 text-gray-500 text-sm inline-block cursor-not-allowed">
                              {estado === 'completado' ? 'Finalizado' : 
                               estado === 'cancelado' ? 'Cancelado' : 
                               'No asistió'}
                            </span>
                          );
                        }

                        return (
                          <div className="flex gap-2 justify-end">
                            {puedeConfirmar && (
                              <button
                                onClick={() => confirmarTurno(t.id_turno)}
                                className="px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm"
                              >
                                Confirmar
                              </button>
                            )}
                            
                            {puedeIniciar && (
                              <button
                                onClick={() => iniciarConsulta(t.id_turno)}
                                className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm"
                              >
                                Iniciar
                              </button>
                            )}
                            
                            {puedeRegistrarNota && (
                              <Link 
                                to={`/dashboard/profesional/nota/${t.id_turno}`} 
                                className="px-3 py-1.5 rounded-md bg-[#00796B] hover:bg-[#00695c] text-white text-sm"
                              >
                                {estado === 'en_curso' ? 'Finalizar' : 'Registrar nota'}
                              </Link>
                            )}
                            
                            {puedeMarcarNoAsistio && (
                              <button
                                onClick={() => marcarNoAsistio(t.id_turno)}
                                className="px-3 py-1.5 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm"
                              >
                                No asistió
                              </button>
                            )}
                            
                            <Link 
                              to={`/dashboard/profesional/turno/${t.id_turno}/seguimiento`} 
                              className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm"
                            >
                              Seguimiento
                            </Link>
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
