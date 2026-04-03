import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  CalendarIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  DocumentTextIcon,
  FolderIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../stores/authStore';
import { API_URL, getAuthConfig } from './shared';

export const useDashboardProfesional = ({ enabled = true } = {}) => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(enabled);
  const [estadisticas, setEstadisticas] = useState(null);
  const [turnosHoy, setTurnosHoy] = useState([]);

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
        const hoy = new Date();
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
        const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0];
        const hoySolo = hoy.toISOString().split('T')[0];

        const [responseMes, responseHoy] = await Promise.all([
          axios.get(`${API_URL}/turnos/profesional/${user.id}`, {
            ...getAuthConfig(),
            params: { fechaDesde: inicioMes, fechaHasta: finMes }
          }),
          axios.get(`${API_URL}/turnos/profesional/${user.id}`, {
            ...getAuthConfig(),
            params: { fechaDesde: hoySolo, fechaHasta: hoySolo }
          })
        ]);

        const turnosMes = responseMes.data || [];
        const turnosDelDia = (responseHoy.data || []).sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
        const pacientesUnicos = new Set(turnosMes.map((turno) => turno.id_paciente)).size;

        let seguimientosPendientes = 0;
        try {
          const responseSeguimientos = await axios.get(
            `${API_URL}/seguimiento/profesional/${user.id}/estadisticas`,
            getAuthConfig()
          );
          seguimientosPendientes = responseSeguimientos.data?.resumen?.pendiente || 0;
        } catch {
          seguimientosPendientes = 0;
        }

        setTurnosHoy(turnosDelDia);
        setEstadisticas({
          turnosMes: turnosMes.length,
          totalPacientes: pacientesUnicos,
          seguimientosPendientes
        });
      } catch (error) {
        console.error('Error cargando dashboard profesional:', error);
        setTurnosHoy([]);
        setEstadisticas({ turnosMes: 0, totalPacientes: 0, seguimientosPendientes: 0 });
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
      value: turnosHoy?.length || 0,
      loading,
      icon: CalendarIcon,
      className: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    {
      key: 'turnosMes',
      label: 'Turnos del Mes',
      value: estadisticas?.turnosMes || 0,
      loading,
      icon: ClipboardDocumentCheckIcon,
      className: 'bg-gradient-to-br from-green-500 to-green-600'
    },
    {
      key: 'totalPacientes',
      label: 'Pacientes Atendidos',
      value: estadisticas?.totalPacientes || 0,
      loading,
      icon: UserGroupIcon,
      className: 'bg-gradient-to-br from-purple-500 to-purple-600'
    },
    {
      key: 'seguimientosPendientes',
      label: 'Seguimientos Pendientes',
      value: estadisticas?.seguimientosPendientes || 0,
      loading,
      icon: ClockIcon,
      className: 'bg-gradient-to-br from-orange-500 to-orange-600'
    }
  ], [estadisticas, turnosHoy, loading]);

  const actions = useMemo(() => [
    {
      title: 'Mis Turnos',
      description: 'Ver todos tus turnos programados',
      icon: CalendarIcon,
      to: '/dashboard/profesional/turnos',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      compact: true
    },
    {
      title: 'Disponibilidad',
      description: 'Configurar horarios de atención',
      icon: ClockIcon,
      to: '/dashboard/disponibilidad',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      compact: true
    },
    {
      title: 'Historias Clínicas',
      description: 'Gestionar historias de pacientes',
      icon: DocumentTextIcon,
      to: '/dashboard/profesional/historias',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      compact: true
    },
    {
      title: 'Seguimientos',
      description: 'Seguimientos post-consulta',
      icon: ClipboardDocumentCheckIcon,
      to: '/dashboard/profesional/seguimientos',
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      compact: true
    },
    {
      title: 'Documentos',
      description: 'Gestionar documentos médicos',
      icon: FolderIcon,
      to: '/dashboard/profesional/documentos',
      color: 'bg-cyan-500',
      hoverColor: 'hover:bg-cyan-600',
      compact: true
    }
  ], []);

  return {
    stats,
    actions,
    loading,
    turnosHoy,
    extraSection: null
  };
};