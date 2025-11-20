import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  UserGroupIcon, 
  ArrowTrendingUpIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../stores/authStore';

const DashboardSecretario = () => {
  const { user } = useAuthStore();
  const [estadisticas, setEstadisticas] = useState(null);
  const [turnosProximos, setTurnosProximos] = useState([]);
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
        turnosHoy: 0,
        turnosMes: 0,
        pacientesAtendidos: 0,
        turnosPendientes: 0
      });
      setTurnosProximos([]);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Nuevo Turno',
      description: 'Programar un turno para un paciente',
      icon: CalendarDaysIcon,
      to: '/dashboard/turnos/nuevo',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600'
    },
    {
      title: 'Turno Periódico',
      description: 'Crear turno recurrente',
      icon: ClockIcon,
      to: '/dashboard/turnos/periodico/nuevo',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600'
    },
    {
      title: 'Nueva Teleconsulta',
      description: 'Programar consulta virtual',
      icon: VideoCameraIcon,
      to: '/dashboard/teleconsultas/nueva',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenido/a, {user?.nombre} {user?.apellido}
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
                <p className="text-3xl font-bold">{estadisticas?.turnosHoy || 0}</p>
              )}
            </div>
            <CalendarDaysIcon className="w-12 h-12 opacity-30" />
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
            <ArrowTrendingUpIcon className="w-12 h-12 opacity-30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Pacientes Atendidos</p>
              {loading ? (
                <div className="animate-pulse h-8 w-12 bg-white/20 rounded"></div>
              ) : (
                <p className="text-3xl font-bold">{estadisticas?.pacientesAtendidos || 0}</p>
              )}
            </div>
            <UserGroupIcon className="w-12 h-12 opacity-30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Turnos Pendientes</p>
              {loading ? (
                <div className="animate-pulse h-8 w-12 bg-white/20 rounded"></div>
              ) : (
                <p className="text-3xl font-bold">{estadisticas?.turnosPendientes || 0}</p>
              )}
            </div>
            <ClockIcon className="w-12 h-12 opacity-30" />
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Accesos Rápidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Link
                key={index}
                to={action.to}
                className="group bg-white rounded-2xl shadow-md p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-center space-x-6">
                  <div className={`${action.color} ${action.hoverColor} w-16 h-16 rounded-xl flex items-center justify-center transition-colors flex-shrink-0`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {action.title}
                    </h3>
                    <p className="text-gray-600">
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
        <h2 className="text-xl font-bold text-gray-900 mb-4">Próximos Turnos</h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse flex space-x-4">
                <div className="h-16 w-16 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : turnosProximos?.length > 0 ? (
          <div className="space-y-3">
            {turnosProximos.map((turno) => (
              <div key={turno.id_turno} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <ClockIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {new Date(turno.fecha).toLocaleDateString('es-ES')} - {turno.hora_inicio}
                    </p>
                    <p className="text-sm text-gray-600">
                      {turno.paciente_nombre} {turno.paciente_apellido} con {turno.profesional_nombre} {turno.profesional_apellido}
                    </p>
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
          <p className="text-gray-500 text-center py-8">No hay turnos próximos programados</p>
        )}
      </div>
    </div>
  );
};

export default DashboardSecretario;
