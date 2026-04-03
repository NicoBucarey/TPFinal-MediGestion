import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  ArrowTrendingUpIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserGroupIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../stores/authStore';
import { API_URL, getAuthConfig } from './shared';

export const useDashboardSecretario = ({ enabled = true } = {}) => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(enabled);
  const [estadisticas, setEstadisticas] = useState(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    if (!user?.id) {
      setLoading(false);
      return;
    }

    const cargarDatos = async () => {
      setLoading(true);

      try {
        const response = await axios.get(`${API_URL}/secretario/estadisticas`, getAuthConfig());
        setEstadisticas(response.data || {});
      } catch (error) {
        console.error('Error cargando estadísticas secretario:', error);
        setEstadisticas({
          turnosHoy: 0,
          turnosMes: 0,
          pacientesAtendidos: 0,
          turnosPendientes: 0
        });
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [enabled, user?.id]);

  const stats = useMemo(() => [
    {
      key: 'turnosHoy',
      label: 'Turnos Hoy',
      value: estadisticas?.turnosHoy || 0,
      loading,
      icon: CalendarDaysIcon,
      className: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    {
      key: 'turnosMes',
      label: 'Turnos del Mes',
      value: estadisticas?.turnosMes || 0,
      loading,
      icon: ArrowTrendingUpIcon,
      className: 'bg-gradient-to-br from-green-500 to-green-600'
    },
    {
      key: 'pacientesAtendidos',
      label: 'Pacientes Atendidos',
      value: estadisticas?.pacientesAtendidos || 0,
      loading,
      icon: UserGroupIcon,
      className: 'bg-gradient-to-br from-purple-500 to-purple-600'
    },
    {
      key: 'turnosPendientes',
      label: 'Turnos Pendientes',
      value: estadisticas?.turnosPendientes || 0,
      loading,
      icon: ClockIcon,
      className: 'bg-gradient-to-br from-orange-500 to-orange-600'
    }
  ], [estadisticas, loading]);

  const actions = useMemo(() => [
    {
      title: 'Turno Simple',
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
  ], []);

  return {
    stats,
    actions,
    loading,
    extraSection: null
  };
};