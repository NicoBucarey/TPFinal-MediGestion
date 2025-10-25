import { useState, useEffect } from 'react';
import axios from 'axios';
import { ChartBarIcon, CalendarIcon, UserGroupIcon, ClockIcon } from '@heroicons/react/24/outline';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Reportes = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('mes');
  const [reportes, setReportes] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarReportes();
  }, [selectedPeriod]);

  const cargarReportes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      
      const response = await axios.get(`${API_URL}/admin/reportes`, {
        params: { periodo: selectedPeriod },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setReportes(response.data);
    } catch (error) {
      console.error('Error al cargar reportes:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#00796B', '#4DD0E1', '#FFB74D', '#E57373'];

  const reportCards = [
    {
      title: 'Turnos Totales',
      value: reportes?.metricas?.turnosTotales || '-',
      change: '+12%',
      icon: CalendarIcon,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Pacientes Atendidos',
      value: reportes?.metricas?.pacientesAtendidos || '-',
      change: '+8%',
      icon: UserGroupIcon,
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Turnos Cancelados',
      value: reportes?.metricas?.turnosCancelados || '-',
      change: '-5%',
      icon: ClockIcon,
      color: 'text-red-500',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Tasa de Ocupación',
      value: `${reportes?.metricas?.tasaOcupacion || '-'}%`,
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
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-pulse text-gray-400">Cargando...</div>
            </div>
          ) : reportes?.turnosPorDia && reportes.turnosPorDia.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportes.turnosPorDia}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="dia" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('es-AR')}
                />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#00796B" name="Turnos" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              <p>No hay datos disponibles</p>
            </div>
          )}
        </div>

        {/* Turnos por profesional */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Profesionales</h3>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-pulse text-gray-400">Cargando...</div>
            </div>
          ) : reportes?.turnosPorProfesional && reportes.turnosPorProfesional.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportes.turnosPorProfesional.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="profesional" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                  tick={{ fontSize: 10 }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#00796B" name="Turnos" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              <p>No hay datos disponibles</p>
            </div>
          )}
        </div>

        {/* Turnos por especialidad */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Turnos por Especialidad</h3>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-pulse text-gray-400">Cargando...</div>
            </div>
          ) : reportes?.turnosPorEspecialidad && reportes.turnosPorEspecialidad.length > 0 ? (
            <div className="space-y-3">
              {reportes.turnosPorEspecialidad.map((esp, idx) => {
                const total = reportes.turnosPorEspecialidad.reduce((sum, e) => sum + parseInt(e.total), 0);
                const porcentaje = ((parseInt(esp.total) / total) * 100).toFixed(1);
                return (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{esp.especialidad}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-[#00796B] h-2 rounded-full" 
                          style={{ width: `${porcentaje}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-12 text-right">{esp.total}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              <p>No hay datos disponibles</p>
            </div>
          )}
        </div>

        {/* Estado de turnos */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Turnos</h3>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-pulse text-gray-400">Cargando...</div>
            </div>
          ) : reportes?.estadoTurnos && reportes.estadoTurnos.length > 0 ? (
            <div className="space-y-4">
              {reportes.estadoTurnos.map((estado, idx) => {
                const colores = {
                  'confirmado': { bg: 'bg-green-50', text: 'text-green-700' },
                  'pendiente': { bg: 'bg-yellow-50', text: 'text-yellow-700' },
                  'cancelado': { bg: 'bg-red-50', text: 'text-red-700' },
                  'completado': { bg: 'bg-blue-50', text: 'text-blue-700' }
                };
                const color = colores[estado.estado] || { bg: 'bg-gray-50', text: 'text-gray-700' };
                return (
                  <div key={idx} className={`flex items-center justify-between p-3 ${color.bg} rounded-lg`}>
                    <span className={`text-sm font-medium ${color.text} capitalize`}>{estado.estado}</span>
                    <span className={`text-xl font-bold ${color.text}`}>{estado.total}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              <p>No hay datos disponibles</p>
            </div>
          )}
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
