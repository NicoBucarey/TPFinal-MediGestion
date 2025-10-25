import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { UserGroupIcon, DocumentChartBarIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

const DashboardAdmin = () => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      
      const response = await axios.get(`${API_URL}/admin/estadisticas`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setEstadisticas(response.data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const adminCards = [
    {
      title: 'Gestión de Usuarios',
      description: 'Crear y administrar usuarios del sistema (profesionales, secretarios)',
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
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
        <p className="mt-2 text-gray-600">Gestiona todos los aspectos del sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <Link
              key={index}
              to={card.to}
              className="group bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex flex-col items-center text-center">
                <div className={`${card.color} ${card.hoverColor} w-16 h-16 rounded-xl flex items-center justify-center mb-4 transition-colors`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {card.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {card.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Resumen rápido */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Usuarios</p>
              {loading ? (
                <div className="animate-pulse h-8 w-16 bg-gray-200 rounded"></div>
              ) : (
                <p className="text-3xl font-bold text-gray-900">{estadisticas?.totalUsuarios || 0}</p>
              )}
            </div>
            <UserGroupIcon className="w-12 h-12 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Turnos del Mes</p>
              {loading ? (
                <div className="animate-pulse h-8 w-16 bg-gray-200 rounded"></div>
              ) : (
                <p className="text-3xl font-bold text-gray-900">{estadisticas?.turnosMes || 0}</p>
              )}
            </div>
            <ClipboardDocumentListIcon className="w-12 h-12 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Profesionales Activos</p>
              {loading ? (
                <div className="animate-pulse h-8 w-16 bg-gray-200 rounded"></div>
              ) : (
                <p className="text-3xl font-bold text-gray-900">{estadisticas?.profesionalesActivos || 0}</p>
              )}
            </div>
            <DocumentChartBarIcon className="w-12 h-12 text-purple-500 opacity-20" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
