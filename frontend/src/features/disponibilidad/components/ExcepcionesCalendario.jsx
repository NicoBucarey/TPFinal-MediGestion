import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import useDisponibilidad from '@/hooks/useDisponibilidad';
import Calendar from 'react-calendar';
import './Calendar.css';

const ExcepcionesCalendario = () => {
  const [selectedDates, setSelectedDates] = useState([]);
  const [excepcionesList, setExcepcionesList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    obtenerExcepciones,
    agregarExcepcion,
    eliminarExcepcion
  } = useDisponibilidad();

  const formatDate = (date) => {
    const d = new Date(date);
    d.setHours(12, 0, 0, 0);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isValidDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate >= today;
  };

  useEffect(() => {
    loadExceptions();
  }, []);

  const loadExceptions = async () => {
    try {
      const data = await obtenerExcepciones();
      if (data) {
        setExcepcionesList(data);
      }
    } catch (error) {
      console.error('Error al cargar excepciones:', error);
      toast.error('Error al cargar las excepciones');
    }
  };

  const handleSelectDate = (date) => {
    if (!isValidDate(date)) {
      toast.error('No se pueden seleccionar fechas pasadas');
      return;
    }

    const localDate = new Date(date);
    localDate.setHours(12, 0, 0, 0);
    const formattedDate = formatDate(localDate);

    if (excepcionesList.some(exc => formatDate(exc.fecha) === formattedDate)) {
      toast.error('Esta fecha ya está marcada como no disponible');
      return;
    }

    setSelectedDates(prev => {
      if (prev.includes(formattedDate)) {
        return prev.filter(d => d !== formattedDate);
      }
      return [...prev, formattedDate];
    });
  };

  const handleGuardarExcepciones = async () => {
    if (selectedDates.length === 0) {
      toast.error('Seleccione al menos una fecha');
      return;
    }

    setIsLoading(true);
    try {
      for (const fecha of selectedDates) {
        const nuevaExcepcion = {
          fecha,
          tipo: 'no_disponible'
        };

        await agregarExcepcion(nuevaExcepcion);
      }

      await loadExceptions();
      setSelectedDates([]);
      toast.success('Excepciones guardadas exitosamente');
    } catch (error) {
      console.error('Error al guardar excepciones:', error);
      toast.error('Error al guardar las excepciones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEliminarExcepcion = async (idExcepcion) => {
    try {
      setIsLoading(true);
      const success = await eliminarExcepcion(idExcepcion);
      if (success) {
        await loadExceptions();
        toast.success('Excepción eliminada exitosamente');
      }
    } catch (error) {
      console.error('Error al eliminar excepción:', error);
      toast.error('Error al eliminar la excepción');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-4">
          Seleccionar fechas
        </h3>
        <Calendar
          onChange={date => handleSelectDate(date)}
          value={null}
          className="rounded-md border"
          minDate={new Date()}
          tileClassName={({ date }) => {
            const dateStr = formatDate(date);

            if (excepcionesList.some(exc => formatDate(exc.fecha) === dateStr)) {
              return 'bg-red-200 text-gray-700 cursor-not-allowed';
            }

            if (selectedDates.includes(dateStr)) {
              return 'bg-blue-100 hover:bg-blue-200';
            }

            if (!isValidDate(date)) {
              return 'bg-gray-100 text-gray-400 cursor-not-allowed';
            }

            return '';
          }}
          tileDisabled={({ date }) => {
            const dateStr = formatDate(date);
            return !isValidDate(date) || excepcionesList.some(exc => formatDate(exc.fecha) === dateStr);
          }}
        />
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Fechas seleccionadas:</h4>
          <ul className="space-y-2">
            {selectedDates.map(date => (
              <li key={date} className="flex items-center justify-between bg-blue-50 p-2 rounded">
                <span>{date.split('-').reverse().join('/')}</span>
                <button
                  onClick={() => setSelectedDates(prev => prev.filter(d => d !== date))}
                  className="text-red-500 hover:text-red-700"
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>

          {selectedDates.length > 0 && (
            <button
              onClick={handleGuardarExcepciones}
              disabled={isLoading}
              className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {isLoading ? 'Guardando...' : 'Guardar Excepciones'}
            </button>
          )}
        </div>

        <div>
          <h4 className="font-medium text-gray-700 mb-3">Excepciones guardadas:</h4>
          <ul className="space-y-2">
            {excepcionesList.map(exc => (
              <li key={exc.id_excepcion} className="flex items-center justify-between bg-red-50 p-2 rounded">
                <span className="font-medium">
                  {new Date(exc.fecha).toLocaleDateString('es-AR')}
                  <span className="ml-2 text-gray-500">(No disponible)</span>
                </span>
                <button
                  onClick={() => handleEliminarExcepcion(exc.id_excepcion)}
                  className="text-red-500 hover:text-red-700"
                  disabled={isLoading}
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ExcepcionesCalendario;
