import { toast } from 'sonner';

const diasSemana = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo'
};

const defaultHorarios = {
  lunes: { activo: false, horaInicio: '09:00', horaFin: '17:00' },
  martes: { activo: false, horaInicio: '09:00', horaFin: '17:00' },
  miercoles: { activo: false, horaInicio: '09:00', horaFin: '17:00' },
  jueves: { activo: false, horaInicio: '09:00', horaFin: '17:00' },
  viernes: { activo: false, horaInicio: '09:00', horaFin: '17:00' },
  sabado: { activo: false, horaInicio: '09:00', horaFin: '13:00' },
  domingo: { activo: false, horaInicio: '09:00', horaFin: '13:00' }
};

const HorarioSemanal = ({ horarios, onChange }) => {
  // Asegurarnos de que tenemos un objeto válido con todos los días
  const horariosActuales = {
    ...defaultHorarios,
    ...(horarios || {})
  };

  const handleHorarioChange = (dia, campo, valor) => {
    const horarioActual = horariosActuales[dia];
    let nuevoValor = valor;
    
    // Si estamos cambiando las horas, validar que horaFin sea mayor que horaInicio
    if (campo === 'horaInicio' || campo === 'horaFin') {
      const horaInicio = campo === 'horaInicio' ? valor : horarioActual.horaInicio;
      const horaFin = campo === 'horaFin' ? valor : horarioActual.horaFin;
      
      if (horaFin <= horaInicio) {
        toast.error('La hora de fin debe ser mayor que la hora de inicio');
        return;
      }
    }

    // Si estamos activando el día, asegurarnos de que tenga los horarios por defecto
    if (campo === 'activo' && valor === true) {
      nuevoValor = true;
    }

    const nuevosHorarios = {
      ...horariosActuales,
      [dia]: {
        ...horarioActual,
        [campo]: nuevoValor
      }
    };

    console.log('Nuevos horarios:', nuevosHorarios); // Para debugging
    onChange(nuevosHorarios);
  };

  return (
    <div className="space-y-4">
      {Object.entries(diasSemana).map(([dia, nombre]) => (
        <div key={dia} className="flex items-center space-x-4 p-2 hover:bg-gray-50 rounded">
          <div className="w-32">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={horariosActuales[dia].activo}
                onChange={(e) => handleHorarioChange(dia, 'activo', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-gray-700">{nombre}</span>
            </label>
          </div>

          <div className="flex items-center space-x-2 flex-1">
            <input
              type="time"
              value={horariosActuales[dia].horaInicio}
              onChange={(e) => handleHorarioChange(dia, 'horaInicio', e.target.value)}
              disabled={!horariosActuales[dia].activo}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
            />
            <span className="text-gray-500">a</span>
            <input
              type="time"
              value={horariosActuales[dia].horaFin}
              onChange={(e) => handleHorarioChange(dia, 'horaFin', e.target.value)}
              disabled={!horariosActuales[dia].activo}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default HorarioSemanal;