import React, { useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import SelectProfesional from '../../components/SelectProfesional';

// Configurar la URL base de axios
axios.defaults.baseURL = 'http://localhost:3000';

const NuevoTurnoPeriodico = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    profesionalId: '',
    tipoPeriodicidad: 'libre',
    diaSemana: 'lunes',
    horaInicio: '',
    horaFin: '',
    fechaInicio: '',
    fechaFin: ''
  });

  // Se eliminó la carga de profesionales ya que ahora se maneja en el componente SelectProfesional

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/api/turnos-periodicos', {
        ...form,
        pacienteId: user.rol === 'paciente' ? user.id : form.pacienteId,
      });

      toast.success('Turnos periódicos creados correctamente');

      // Resetear formulario
      setForm({
        profesionalId: '',
        tipoPeriodicidad: 'libre',
        diaSemana: 'lunes',
        horaInicio: '',
        horaFin: '',
        fechaInicio: '',
        fechaFin: ''
      });
    } catch (error) {
      console.error('Error al crear turnos periódicos:', error);
      
      // Mostrar conflictos si existen
      if (error.response?.data?.conflictos) {
        const conflictos = error.response.data.conflictos;
        toast.error('Conflictos de horarios', {
          description: conflictos.map((conflicto, index) => (
            `${new Date(conflicto.fecha).toLocaleDateString()}: ${conflicto.mensaje}`
          )).join('\n'),
          duration: 10000,
        });
      } else {
        toast.error('No se pudieron crear los turnos periódicos');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calcular fecha máxima (2 meses desde la fecha inicial)
  const calcularFechaMaxima = () => {
    if (!form.fechaInicio) return '';
    const fecha = new Date(form.fechaInicio);
    fecha.setMonth(fecha.getMonth() + 2);
    return fecha.toISOString().split('T')[0];
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Nuevo Turno Periódico</h2>

        {/* Selección de Profesional */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Profesional <span className="text-red-500">*</span>
          </label>
          <SelectProfesional
            value={form.profesionalId}
            onChange={(e) => handleInputChange({ target: { name: 'profesionalId', value: e.target.value } })}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Tipo de Periodicidad */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Tipo de Periodicidad <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            {['libre', 'semanal', 'quincenal', 'mensual'].map((tipo) => (
              <label key={tipo} className="inline-flex items-center">
                <input
                  type="radio"
                  name="tipoPeriodicidad"
                  value={tipo}
                  checked={form.tipoPeriodicidad === tipo}
                  onChange={handleInputChange}
                  className="form-radio h-4 w-4 text-indigo-600"
                />
                <span className="ml-2 capitalize">{tipo}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Día de la Semana (solo si no es libre) */}
        {form.tipoPeriodicidad !== 'libre' && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Día de la Semana <span className="text-red-500">*</span>
            </label>
            <select
              name="diaSemana"
              value={form.diaSemana}
              onChange={handleInputChange}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="lunes">Lunes</option>
              <option value="martes">Martes</option>
              <option value="miercoles">Miércoles</option>
              <option value="jueves">Jueves</option>
              <option value="viernes">Viernes</option>
              <option value="sabado">Sábado</option>
              <option value="domingo">Domingo</option>
            </select>
          </div>
        )}

        {/* Horarios */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Hora de Inicio <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="horaInicio"
              value={form.horaInicio}
              onChange={handleInputChange}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Hora de Fin <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="horaFin"
              value={form.horaFin}
              onChange={handleInputChange}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Fecha de Inicio <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="fechaInicio"
              value={form.fechaInicio}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Fecha de Fin <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="fechaFin"
              value={form.fechaFin}
              onChange={handleInputChange}
              min={form.fechaInicio}
              max={calcularFechaMaxima()}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
        </div>

        {/* Mensaje informativo */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Los turnos se crearán según la disponibilidad del profesional y respetando otros turnos existentes.
              </p>
            </div>
          </div>
        </div>

        {/* Botón de submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Creando turnos...' : 'Crear Turnos Periódicos'}
        </button>
      </form>
    </div>
  );
};

export default NuevoTurnoPeriodico;