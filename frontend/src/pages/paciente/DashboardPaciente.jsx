import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  CalendarIcon, 
  MagnifyingGlassIcon, 
  DocumentTextIcon, 
  ClipboardDocumentCheckIcon,
  FolderIcon,
  ClockIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../stores/authStore';

const DashboardPaciente = () => {
  const { user } = useAuthStore();
  const [estadisticas, setEstadisticas] = useState(null);
  const [proximosTurnos, setProximosTurnos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      
      if (!token || !user?.id) {
        setLoading(false);
        return;
      }

      // Cargar estadísticas del paciente
      const [turnosRes, seguimientosRes, documentosRes] = await Promise.all([
        // Turnos del paciente
        axios.get(`${API_URL}/turnos/paciente/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] })),
        
        // Seguimientos activos
        axios.get(`${API_URL}/seguimiento/paciente/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] })),
        
        // Documentos (estimado, ajustar según tu endpoint)
        axios.get(`${API_URL}/clinica/paciente/${user.id}/documentos`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] }))
      ]);

      // Calcular estadísticas
      const turnos = turnosRes.data || [];
      const seguimientos = seguimientosRes.data || [];
      const documentos = documentosRes.data || [];

      // Próximos turnos (los primeros 3)
      const proximosTurnos = turnos
        .filter(turno => new Date(turno.fecha) >= new Date())
        .slice(0, 3);

      // Consultas realizadas (turnos completados)
      const consultasRealizadas = turnos.filter(turno => turno.estado === 'completado').length;

      // Seguimientos activos
      const seguimientosActivos = seguimientos.filter(seg => seg.estado === 'pendiente' || seg.estado === 'en_curso').length;

      setEstadisticas({
        consultasRealizadas,
        documentosCompartidos: documentos.length,
        seguimientosActivos
      });

      setProximosTurnos(proximosTurnos);
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
      // Valores por defecto en caso de error
      setEstadisticas({
        consultasRealizadas: 0,
        documentosCompartidos: 0,
        seguimientosActivos: 0
      });
      setProximosTurnos([]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Buscar Profesional',
      description: 'Encuentra y agenda con un profesional',
      icon: MagnifyingGlassIcon,
      to: '/dashboard/paciente/buscar-profesional',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600'
    },
    {
      title: 'Mis Turnos',
      description: 'Ver y gestionar tus turnos',
      icon: CalendarIcon,
      to: '/dashboard/paciente/turnos',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600'
    },
    {
      title: 'Mi Historia Clínica',
      description: 'Consulta tu historial médico',
      icon: DocumentTextIcon,
      to: '/dashboard/paciente/historia',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600'
    },
    {
      title: 'Mis Seguimientos',
      description: 'Responde a instrucciones médicas',
      icon: ClipboardDocumentCheckIcon,
      to: '/dashboard/paciente/seguimientos',
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600'
    },
    {
      title: 'Mis Documentos',
      description: 'Accede a documentos compartidos',
      icon: FolderIcon,
      to: '/dashboard/paciente/documentos',
      color: 'bg-cyan-500',
      hoverColor: 'hover:bg-cyan-600'
    },
    {
      title: 'Teleconsultas',
      description: 'Solicitar consultas virtuales',
      icon: VideoCameraIcon,
      to: '/dashboard/paciente/teleconsulta',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600'
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
              <p className="text-sm opacity-90 mb-1">Próximos Turnos</p>
              {loading ? (
                <div className="animate-pulse h-8 w-12 bg-white/20 rounded"></div>
              ) : (
                <p className="text-3xl font-bold">{proximosTurnos?.length || 0}</p>
              )}
            </div>
            <CalendarIcon className="w-12 h-12 opacity-30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Consultas Realizadas</p>
              {loading ? (
                <div className="animate-pulse h-8 w-12 bg-white/20 rounded"></div>
              ) : (
                <p className="text-3xl font-bold">{estadisticas?.consultasRealizadas || 0}</p>
              )}
            </div>
            <ClipboardDocumentCheckIcon className="w-12 h-12 opacity-30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Documentos Compartidos</p>
              {loading ? (
                <div className="animate-pulse h-8 w-12 bg-white/20 rounded"></div>
              ) : (
                <p className="text-3xl font-bold">{estadisticas?.documentosCompartidos || 0}</p>
              )}
            </div>
            <FolderIcon className="w-12 h-12 opacity-30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Seguimientos Activos</p>
              {loading ? (
                <div className="animate-pulse h-8 w-12 bg-white/20 rounded"></div>
              ) : (
                <p className="text-3xl font-bold">{estadisticas?.seguimientosActivos || 0}</p>
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

      {/* Próximos turnos */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Mis Próximos Turnos</h2>
          <Link 
            to="/dashboard/paciente/turnos"
            className="text-primary hover:text-primary-dark font-medium text-sm"
          >
            Ver todos →
          </Link>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex space-x-4">
                <div className="h-16 w-16 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : proximosTurnos?.length > 0 ? (
          <div className="space-y-3">
            {proximosTurnos.slice(0, 3).map((turno) => (
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
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  turno.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                  turno.estado === 'confirmado' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {turno.estado}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No tienes turnos próximos programados</p>
            <Link 
              to="/dashboard/paciente/buscar-profesional"
              className="btn-primary inline-block"
            >
              Agendar un turno
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPaciente;
