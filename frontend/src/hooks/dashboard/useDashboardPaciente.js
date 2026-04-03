import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  CalendarIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../stores/authStore';
import { API_URL, getAuthConfig } from './shared';

export const useDashboardPaciente = ({ enabled = true } = {}) => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(enabled);
  const [estadisticas, setEstadisticas] = useState(null);
  const [proximosTurnos, setProximosTurnos] = useState([]);

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
        const authConfig = getAuthConfig();
        const [turnosRes, seguimientosRes] = await Promise.all([
          axios.get(`${API_URL}/turnos/paciente/${user.id}`, authConfig).catch(() => ({ data: [] })),
          axios.get(`${API_URL}/seguimiento/paciente/${user.id}`, authConfig).catch(() => ({ data: [] }))
        ]);

        const turnos = turnosRes.data || [];
        const seguimientos = seguimientosRes.data || [];

        const proximos = turnos
          .filter((turno) => new Date(turno.fecha) >= new Date())
          .slice(0, 3);

        const consultasRealizadas = turnos.filter((turno) => turno.estado === 'completado').length;
        const seguimientosActivos = seguimientos.filter((seg) => seg.estado === 'pendiente' || seg.estado === 'en_curso').length;

        setProximosTurnos(proximos);
        setEstadisticas({
          consultasRealizadas,
          seguimientosActivos
        });
      } catch (error) {
        console.error('Error cargando dashboard paciente:', error);
        setProximosTurnos([]);
        setEstadisticas({ consultasRealizadas: 0, seguimientosActivos: 0 });
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [enabled, user?.id]);

  const stats = useMemo(() => [
    {
      key: 'proximosTurnos',
      label: 'Próximos Turnos',
      value: proximosTurnos?.length || 0,
      loading,
      icon: CalendarIcon,
      className: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    {
      key: 'consultasRealizadas',
      label: 'Consultas Realizadas',
      value: estadisticas?.consultasRealizadas || 0,
      loading,
      icon: ClipboardDocumentCheckIcon,
      className: 'bg-gradient-to-br from-green-500 to-green-600'
    },
    {
      key: 'seguimientosActivos',
      label: 'Seguimientos Activos',
      value: estadisticas?.seguimientosActivos || 0,
      loading,
      icon: ClockIcon,
      className: 'bg-gradient-to-br from-orange-500 to-orange-600'
    }
  ], [estadisticas, proximosTurnos, loading]);

  const actions = useMemo(() => [
    {
      title: 'Turno Simple',
      description: 'Programar un turno presencial',
      icon: MagnifyingGlassIcon,
      to: '/dashboard/turnos/nuevo',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      compact: true
    },
    {
      title: 'Turno Periódico',
      description: 'Programar turnos recurrentes',
      icon: ClockIcon,
      to: '/dashboard/turnos/periodico/nuevo',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      compact: true
    },
    {
      title: 'Nueva Teleconsulta',
      description: 'Programar consulta virtual',
      icon: VideoCameraIcon,
      to: '/dashboard/teleconsultas/nueva',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      compact: true
    },
    {
      title: 'Mis Turnos',
      description: 'Ver y gestionar tus turnos',
      icon: CalendarIcon,
      to: '/dashboard/paciente/turnos',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      compact: true
    },
    {
      title: 'Mis Seguimientos',
      description: 'Responde a instrucciones médicas',
      icon: ClipboardDocumentCheckIcon,
      to: '/dashboard/paciente/seguimientos',
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      compact: true
    }
  ], []);

  return {
    stats,
    actions,
    loading,
    proximosTurnos,
    extraSection: null
  };
};