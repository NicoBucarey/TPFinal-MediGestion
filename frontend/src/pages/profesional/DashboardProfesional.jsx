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
  }, []);

  const cargarDatos = async () => {
    try {
      // TODO: Implementar endpoints en backend
      // const token = localStorage.getItem('token');
      // const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      
      setEstadisticas({
        turnosMes: 0,
        totalPacientes: 0,
        seguimientosPendientes: 0
      });
      setTurnosHoy([]);
    } catch (error) {
      console.error('Error al cargar datos:', error);
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
          Bienvenido, {user?.apellido}
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
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <ClockIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {turno.hora_inicio} - {turno.paciente_nombre} {turno.paciente_apellido}
                    </p>
                    <p className="text-sm text-gray-600">{turno.motivo_consulta || 'Consulta general'}</p>
                  </div>
                </div>
                <Link
                  to={`/dashboard/profesional/nota/${turno.id_turno}`}
                  className="text-primary hover:text-primary-dark font-medium text-sm"
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
