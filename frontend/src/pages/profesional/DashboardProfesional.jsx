import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  CalendarIcon, 
  ClockIcon, 
  UserGroupIcon, 
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  FolderIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../stores/authStore';

const DashboardProfesional = () => {
  const { user } = useAuthStore();
  const [estadisticas, setEstadisticas] = useState(null);
  const [turnosHoy, setTurnosHoy] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, [user]);

  const cargarDatos = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      
      if (!user?.id) {
        console.log('No hay usuario logueado');
        return;
      }

      // Obtener turnos del profesional para el mes actual
      const hoy = new Date();
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
      const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0];
      const hoySolo = hoy.toISOString().split('T')[0];

      console.log('Cargando datos para profesional:', user.id);
      console.log('Período:', inicioMes, 'hasta', finMes);

      // Obtener todos los turnos del mes
      const responsesMes = await axios.get(`${API_URL}/turnos/profesional/${user.id}`, {
        params: { desde: inicioMes, hasta: finMes },
        headers: { Authorization: `Bearer ${token}` }
      });

      // Obtener turnos del día de hoy
      const responsesHoy = await axios.get(`${API_URL}/turnos/profesional/${user.id}`, {
        params: { desde: hoySolo, hasta: hoySolo },
        headers: { Authorization: `Bearer ${token}` }
      });

      const turnosMes = responsesMes.data || [];
      const turnosDelDia = (responsesHoy.data || []).sort((a, b) => {
        // Ordenar por hora_inicio
        return a.hora_inicio.localeCompare(b.hora_inicio);
      });

      console.log('Turnos del mes:', turnosMes.length);
      console.log('Turnos de hoy:', turnosDelDia.length);

      // Calcular estadísticas
      const pacientesUnicos = new Set(turnosMes.map(t => t.id_paciente)).size;
      
      // Obtener estadísticas de seguimientos si existe el endpoint
      let seguimientosPendientes = 0;
      try {
        const responseSeguimientos = await axios.get(`${API_URL}/seguimiento/profesional/${user.id}/estadisticas`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        seguimientosPendientes = responseSeguimientos.data?.resumen?.pendiente || 0;
      } catch (error) {
        console.log('No se pudieron cargar seguimientos:', error.response?.status);
      }
      
      setEstadisticas({
        turnosMes: turnosMes.length,
        totalPacientes: pacientesUnicos,
        seguimientosPendientes
      });
      
      setTurnosHoy(turnosDelDia);

    } catch (error) {
      console.error('Error al cargar datos:', error);
      // En caso de error, mantener valores en 0
      setEstadisticas({
        turnosMes: 0,
        totalPacientes: 0,
        seguimientosPendientes: 0
      });
      setTurnosHoy([]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Mis Turnos',
      description: 'Ver todos tus turnos programados',
      icon: CalendarIcon,
      to: '/dashboard/profesional/turnos',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600'
    },
    {
      title: 'Disponibilidad',
      description: 'Configurar horarios de atención',
      icon: ClockIcon,
      to: '/dashboard/disponibilidad',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600'
    },
    {
      title: 'Historias Clínicas',
      description: 'Gestionar historias de pacientes',
      icon: DocumentTextIcon,
      to: '/dashboard/profesional/historias',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600'
    },
    {
      title: 'Seguimientos',
      description: 'Seguimientos post-consulta',
      icon: ClipboardDocumentCheckIcon,
      to: '/dashboard/profesional/seguimientos',
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600'
    },
    {
      title: 'Documentos',
      description: 'Gestionar documentos médicos',
      icon: FolderIcon,
      to: '/dashboard/profesional/documentos',
      color: 'bg-cyan-500',
      hoverColor: 'hover:bg-cyan-600'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenido, {user?.nombre} {user?.apellido}
        </h1>
        <p className="mt-2 text-gray-600">
          {new Date().toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Turnos Hoy</p>
              {loading ? (
                <div className="animate-pulse h-8 w-12 bg-white/20 rounded"></div>
              ) : (
                <p className="text-3xl font-bold">{turnosHoy?.length || 0}</p>
              )}
            </div>
            <CalendarIcon className="w-12 h-12 opacity-30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Turnos del Mes</p>
              {loading ? (
                <div className="animate-pulse h-8 w-12 bg-white/20 rounded"></div>
              ) : (
                <p className="text-3xl font-bold">{estadisticas?.turnosMes || 0}</p>
              )}
            </div>
            <ClipboardDocumentCheckIcon className="w-12 h-12 opacity-30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Pacientes Atendidos</p>
              {loading ? (
                <div className="animate-pulse h-8 w-12 bg-white/20 rounded"></div>
              ) : (
                <p className="text-3xl font-bold">{estadisticas?.totalPacientes || 0}</p>
              )}
            </div>
            <UserGroupIcon className="w-12 h-12 opacity-30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Seguimientos Pendientes</p>
              {loading ? (
                <div className="animate-pulse h-8 w-12 bg-white/20 rounded"></div>
              ) : (
                <p className="text-3xl font-bold">{estadisticas?.seguimientosPendientes || 0}</p>
              )}
            </div>
            <ClockIcon className="w-12 h-12 opacity-30" />
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Accesos Rápidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Link
                key={index}
                to={action.to}
                className="group bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-start space-x-4">
                  <div className={`${action.color} ${action.hoverColor} w-14 h-14 rounded-xl flex items-center justify-center transition-colors flex-shrink-0`}>
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {action.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Turnos de hoy */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Turnos de Hoy</h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex space-x-4">
                <div className="h-12 w-12 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : turnosHoy?.length > 0 ? (
          <div className="space-y-3">
            {turnosHoy.map((turno) => (
              <div key={turno.id_turno} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-500/10 p-3 rounded-lg">
                    <ClockIcon className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {turno.hora_inicio} - {turno.pac_nombre} {turno.pac_apellido}
                    </p>
                    <p className="text-sm text-gray-600">
                      {turno.motivo_consulta || 'Consulta general'} 
                      {turno.tipo && <span className="ml-2 text-blue-600">({turno.tipo === 'teleconsulta' ? '🎥 Teleconsulta' : '👤 Presencial'})</span>}
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
    </div>
  );
};

export default DashboardProfesional;
