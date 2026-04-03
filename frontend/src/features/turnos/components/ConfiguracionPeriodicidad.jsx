import { useState, useEffect } from 'react';

const diasSemana = [
  'domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'
];

const ConfiguracionPeriodicidad = ({ onConfirmar, fechaHoraInicial, loading }) => {
  const [periodicidad, setPeriodicidad] = useState('semanal');
  const [fechaFin, setFechaFin] = useState('');
  const [diaSemana, setDiaSemana] = useState('');

  useEffect(() => {
    if (fechaHoraInicial && fechaHoraInicial.fecha) {
      const [yyyy, mm, dd] = fechaHoraInicial.fecha.split('-');
      const fecha = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
      setDiaSemana(diasSemana[fecha.getDay()]);
    }
  }, [fechaHoraInicial]);

  const opciones = [
    { value: 'semanal', label: 'Semanal (mismo día y hora cada semana)' },
    { value: 'quincenal', label: 'Quincenal (mismo día y hora cada dos semanas)' },
    { value: 'mensual', label: 'Mensual (mismo día y hora cada mes)' }
  ];

  const handleContinuar = () => {
    if (!fechaFin) {
      alert('Por favor selecciona la fecha de fin');
      return;
    }
    const config = {
      tipo: periodicidad,
      diaSemana,
      fechaInicio: fechaHoraInicial.fecha,
      horaInicio: fechaHoraInicial.hora_inicio,
      horaFin: fechaHoraInicial.hora_fin,
      fechaFin
    };
    onConfirmar(config);
  };

  return (
    <div className="space-y-6">
      <div>
        
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Periodicidad
        </label>
        <select
          value={periodicidad}
          onChange={e => setPeriodicidad(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          {opciones.map(opcion => (
            <option key={opcion.value} value={opcion.value}>
              {opcion.label}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fecha de Fin
        </label>
        <input
          type="date"
          value={fechaFin}
          onChange={e => setFechaFin(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 border p-2"
        />
      </div>
      <button
        onClick={handleContinuar}
        className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        disabled={loading}
      >
        Continuar
      </button>
    </div>
  );
};

export default ConfiguracionPeriodicidad;
