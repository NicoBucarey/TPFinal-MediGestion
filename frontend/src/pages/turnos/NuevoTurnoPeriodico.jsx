import React, { useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import BusquedaPaciente from '../../components/pacientes/BusquedaPaciente';
import SelectProfesional from '../../components/SelectProfesional';
import CalendarioTurnos from '../../components/turnos/CalendarioTurnos';
import ConfiguracionPeriodicidad from '../../components/turnos/ConfiguracionPeriodicidad';
import { useAuthStore } from '../../stores/authStore';

axios.defaults.baseURL = import.meta.env.VITE_API_URL;

const NuevoTurnoPeriodico = () => {
  const [paso, setPaso] = useState(1);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState(null);
  const [fechaHoraSeleccionada, setFechaHoraSeleccionada] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = useAuthStore((state) => state.token);

  // Paso 1: Selección de paciente
  const handlePacienteSeleccionado = (paciente) => {
    setPacienteSeleccionado(paciente);
    setPaso(2);
  };

  // Paso 2: Selección de profesional
  const handleProfesionalSelect = (event) => {
    setProfesionalSeleccionado(event.target.value);
    setPaso(3);
  };

  // Paso 3: Selección de fecha/hora
  const handleFechaHoraSeleccionada = (fechaHora) => {
    console.log('Fecha y hora seleccionada:', fechaHora);
    // Transformar el objeto Date en el formato esperado
    if (fechaHora instanceof Date) {
      const yyyy = fechaHora.getFullYear();
      const mm = String(fechaHora.getMonth() + 1).padStart(2, '0');
      const dd = String(fechaHora.getDate()).padStart(2, '0');
      const fecha = `${yyyy}-${mm}-${dd}`;
      const hora = String(fechaHora.getHours()).padStart(2, '0');
      const minutos = String(fechaHora.getMinutes()).padStart(2, '0');
      const hora_inicio = `${hora}:${minutos}:00`;
      // Asumimos duración estándar de 30 minutos
      let finDate = new Date(fechaHora.getTime() + 30 * 60000);
      const hora_fin = `${String(finDate.getHours()).padStart(2, '0')}:${String(finDate.getMinutes()).padStart(2, '0')}:00`;
      setFechaHoraSeleccionada({ fecha, hora_inicio, hora_fin });
    } else {
      setFechaHoraSeleccionada(fechaHora);
    }
    setPaso(4);
  };

  // Paso 4: Configuración de periodicidad
  const handleConfiguracionPeriodicidad = async (config) => {
    await crearTurnoPeriodico(config);
  };

  const crearTurnoPeriodico = async (config) => {
    try {
      setLoading(true);
      // Validar datos antes de enviar
      if (!pacienteSeleccionado || !pacienteSeleccionado.id_usuario) {
        toast.error('Selecciona un paciente válido');
        setLoading(false);
        return;
      }
      if (!profesionalSeleccionado) {
        toast.error('Selecciona un profesional válido');
        setLoading(false);
        return;
      }
      if (!fechaHoraSeleccionada) {
        toast.error('Selecciona una fecha y hora válida');
        setLoading(false);
        return;
      }
      if (!config.fechaInicio || !config.fechaFin) {
        toast.error('Configura la periodicidad correctamente');
        setLoading(false);
        return;
      }

      // Construir payload con datos correctos
      const payload = {
        pacienteId: pacienteSeleccionado.id_usuario,
        profesionalId: profesionalSeleccionado,
        horaInicio: fechaHoraSeleccionada.hora_inicio,
        horaFin: fechaHoraSeleccionada.hora_fin,
        tipoPeriodicidad: config.tipo,
        diaSemana: config.diaSemana,
        fechaInicio: config.fechaInicio || fechaHoraSeleccionada.fecha,
        fechaFin: config.fechaFin
      };
      console.log('--- INICIO crearTurnoPeriodico FRONTEND ---');
      console.log('Payload enviado:', payload);
      const response = await axios.post('/turnos-periodicos', payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Respuesta backend:', response.data);
      toast.success('Turnos periódicos creados exitosamente');
      setPaso(1);
      setPacienteSeleccionado(null);
      setProfesionalSeleccionado(null);
      setFechaHoraSeleccionada(null);
    } catch (error) {
      console.error('Error al crear turno periódico:', error);
      if (error.response) {
        console.error('Respuesta error backend:', error.response.data);
      }
      toast.error(error.response?.data?.error || 'Error al crear los turnos periódicos');
    } finally {
      setLoading(false);
      console.log('--- FIN crearTurnoPeriodico FRONTEND ---');
    }
  };

  const handleVolver = () => {
    if (paso > 1) {
      setPaso(paso - 1);
      if (paso === 2) setPacienteSeleccionado(null);
      if (paso === 3) setProfesionalSeleccionado(null);
      if (paso === 4) setFechaHoraSeleccionada(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Nuevo Turno Periódico</h1>
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex-1 ${paso >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${paso >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                  1
                </div>
                <span className="ml-2 hidden sm:inline">Paciente</span>
              </div>
            </div>
            <div className={`flex-1 h-1 ${paso >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`flex-1 ${paso >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className="flex items-center justify-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${paso >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                  2
                </div>
                <span className="ml-2 hidden sm:inline">Profesional</span>
              </div>
            </div>
            <div className={`flex-1 h-1 ${paso >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`flex-1 ${paso >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className="flex items-center justify-end">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${paso >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                  3
                </div>
                <span className="ml-2 hidden sm:inline">Fecha/Hora</span>
              </div>
            </div>
            <div className={`flex-1 h-1 ${paso >= 4 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`flex-1 ${paso >= 4 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className="flex items-center justify-end">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${paso >= 4 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                  4
                </div>
                <span className="ml-2 hidden sm:inline">Periodicidad</span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          {paso === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Seleccionar Paciente</h2>
              <BusquedaPaciente onPacienteSelect={handlePacienteSeleccionado} />
            </div>
          )}
          {paso === 2 && pacienteSeleccionado && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Seleccionar Profesional</h2>
              <SelectProfesional
                value={profesionalSeleccionado || ''}
                onChange={handleProfesionalSelect}
                required
              />
              <button onClick={handleVolver} className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                Volver
              </button>
            </div>
          )}
          {paso === 3 && profesionalSeleccionado && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Seleccionar Fecha y Hora</h2>
              <CalendarioTurnos
                profesionalId={profesionalSeleccionado}
                onTurnoSelect={handleFechaHoraSeleccionada}
                esTurnoPeriodico={true}
              />
              <button onClick={handleVolver} className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                Volver
              </button>
            </div>
          )}
          {paso === 4 && fechaHoraSeleccionada && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Configurar Periodicidad</h2>
              <ConfiguracionPeriodicidad
                onConfirmar={handleConfiguracionPeriodicidad}
                fechaHoraInicial={fechaHoraSeleccionada}
                loading={loading}
              />
              <button onClick={handleVolver} className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300" disabled={loading}>
                Volver
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NuevoTurnoPeriodico;