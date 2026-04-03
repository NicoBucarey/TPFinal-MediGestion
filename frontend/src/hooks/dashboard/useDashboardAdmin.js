import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  ClipboardDocumentListIcon,
  DocumentChartBarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../stores/authStore';
import { API_URL, getAuthConfig } from './shared';

export const useDashboardAdmin = ({ enabled = true } = {}) => {
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
        const response = await axios.get(`${API_URL}/admin/estadisticas`, getAuthConfig());
        setEstadisticas(response.data || {});
      } catch (error) {
        console.error('Error cargando estadísticas admin:', error);
        setEstadisticas({ totalUsuarios: 0, turnosMes: 0, profesionalesActivos: 0 });
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [enabled, user?.id]);

  const stats = useMemo(() => [
    {
      key: 'totalUsuarios',
      label: 'Total Usuarios',
      value: estadisticas?.totalUsuarios || 0,
      loading,
      icon: UserGroupIcon,
      className: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    {
      key: 'turnosMes',
      label: 'Turnos del Mes',
      value: estadisticas?.turnosMes || 0,
      loading,
      icon: ClipboardDocumentListIcon,
      className: 'bg-gradient-to-br from-green-500 to-green-600'
    },
    {
      key: 'profesionalesActivos',
      label: 'Profesionales Activos',
      value: estadisticas?.profesionalesActivos || 0,
      loading,
      icon: DocumentChartBarIcon,
      className: 'bg-gradient-to-br from-purple-500 to-purple-600'
    }
  ], [estadisticas, loading]);

  const actions = useMemo(() => [
    {
      title: 'Gestión de Usuarios',
      description: 'Crear y administrar usuarios del sistema',
      icon: UserGroupIcon,
      to: '/dashboard/usuarios/gestion',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600'
    },
    {
      title: 'Reportes',
      description: 'Ver estadísticas y reportes del sistema',
      icon: DocumentChartBarIcon,
      to: '/dashboard/admin/reports',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600'
    }
  ], []);

  return {
    stats,
    actions,
    loading,
    extraSection: null
  };
};