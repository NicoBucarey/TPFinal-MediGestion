import { useState } from 'react';
import { ChartBarIcon, CalendarIcon, UserGroupIcon, ClockIcon } from '@heroicons/react/24/outline';

const Reportes = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('mes');

  const reportCards = [
    {
      title: 'Turnos Totales',
      value: '-',
      change: '+12%',
      icon: CalendarIcon,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Pacientes Atendidos',
      value: '-',
      change: '+8%',
      icon: UserGroupIcon,
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Turnos Cancelados',
      value: '-',
      change: '-5%',
      icon: ClockIcon,
      color: 'text-red-500',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Tasa de Ocupación',
      value: '-%',
      change: '+3%',
      icon: ChartBarIcon,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reportes y Estadísticas</h1>
        <p className="mt-2 text-gray-600">Análisis y métricas del sistema de turnos</p>
      </div>

      {/* Selector de período */}
      <div className="mb-6 flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Período:</label>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00796B] focus:border-transparent"
        >
          <option value="semana">Última Semana</option>
          <option value="mes">Último Mes</option>
          <option value="trimestre">Último Trimestre</option>
          <option value="año">Último Año</option>
        </select>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {reportCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <div key={index} className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.bgColor} p-3 rounded-xl`}>
                  <IconComponent className={`w-6 h-6 ${card.color}`} />
                </div>
                <span className={`text-sm font-semibold ${card.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {card.change}
                </span>
              </div>
              <h3 className="text-sm text-gray-600 mb-1">{card.title}</h3>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Gráficos y tablas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Turnos por día */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Turnos por Día</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <ChartBarIcon className="w-16 h-16 mx-auto mb-2 opacity-50" />
              <p>Gráfico en desarrollo</p>
            </div>
          </div>
        </div>

        {/* Turnos por profesional */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Turnos por Profesional</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <UserGroupIcon className="w-16 h-16 mx-auto mb-2 opacity-50" />
              <p>Gráfico en desarrollo</p>
            </div>
          </div>
        </div>

        {/* Turnos por especialidad */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Turnos por Especialidad</h3>
          <div className="space-y-3">
            {['Cardiología', 'Dermatología', 'Pediatría', 'Traumatología'].map((especialidad, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{especialidad}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[#00796B] h-2 rounded-full" 
                      style={{ width: `${Math.random() * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">-</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Estado de turnos */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Turnos</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-green-700">Confirmados</span>
              <span className="text-xl font-bold text-green-700">-</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm font-medium text-yellow-700">Pendientes</span>
              <span className="text-xl font-bold text-yellow-700">-</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <span className="text-sm font-medium text-red-700">Cancelados</span>
              <span className="text-xl font-bold text-red-700">-</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-blue-700">Completados</span>
              <span className="text-xl font-bold text-blue-700">-</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nota informativa */}
      <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Los reportes se actualizan automáticamente cada hora. Para obtener datos en tiempo real, conecta las métricas del backend.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reportes;
