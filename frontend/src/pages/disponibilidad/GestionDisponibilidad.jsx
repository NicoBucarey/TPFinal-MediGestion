import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import ConfiguracionGeneral from '@/components/disponibilidad/ConfiguracionGeneral';
import HorarioSemanal from '@/components/disponibilidad/HorarioSemanal';
import ExcepcionesCalendario from '@/components/disponibilidad/ExcepcionesCalendario';
import useDisponibilidad from '@/hooks/useDisponibilidad';

const GestionDisponibilidad = () => {
  const [configuracion, setConfiguracion] = useState({
    duracionTurno: 30,
    intervaloTurnos: 5
  });

  const [horarios, setHorarios] = useState(null);

  const handleConfiguracionChange = (newConfig) => {
    setConfiguracion(newConfig);
  };

  const handleHorariosChange = (newHorarios) => {
    setHorarios(newHorarios);
  };

  const { 
    error, 
    loading, 
    obtenerConfiguracion, 
    guardarConfiguracion 
  } = useDisponibilidad();

  // Cargar configuración al montar el componente
  useEffect(() => {
    const cargarConfiguracion = async () => {
      const data = await obtenerConfiguracion();
      if (data) {
        setConfiguracion(data.configuracion || {
          duracionTurno: 30,
          intervaloTurnos: 5
        });
        setHorarios(data.horarios || {
          lunes: { activo: false, horaInicio: '09:00', horaFin: '17:00' },
          martes: { activo: false, horaInicio: '09:00', horaFin: '17:00' },
          miercoles: { activo: false, horaInicio: '09:00', horaFin: '17:00' },
          jueves: { activo: false, horaInicio: '09:00', horaFin: '17:00' },
          viernes: { activo: false, horaInicio: '09:00', horaFin: '17:00' },
          sabado: { activo: false, horaInicio: '09:00', horaFin: '13:00' },
          domingo: { activo: false, horaInicio: '09:00', horaFin: '13:00' }
        });
      }
    };

    cargarConfiguracion();
  }, []);

  // Mostrar errores como notificaciones
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleGuardar = async () => {
    try {
      const success = await guardarConfiguracion({
        configuracion,
        horarios
      });

      if (success) {
        toast.success('Configuración guardada exitosamente');
      }
    } catch (error) {
      toast.error('Error al guardar la configuración');
      console.error('Error al guardar la configuración:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Gestión de Disponibilidad</h1>
      
      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Configuración General</h2>
          <ConfiguracionGeneral
            configuracion={configuracion}
            onChange={handleConfiguracionChange}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Horarios Semanales</h2>
          <HorarioSemanal
            horarios={horarios}
            onChange={handleHorariosChange}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Excepciones</h2>
          <ExcepcionesCalendario />
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleGuardar}
            disabled={loading}
            className="px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GestionDisponibilidad;