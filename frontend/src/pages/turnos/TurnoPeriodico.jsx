import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import BusquedaPaciente from '../../components/pacientes/BusquedaPaciente';
import SelectProfesional from '../../components/SelectProfesional';
import ConfiguracionPeriodicidad from '../../components/turnos/ConfiguracionPeriodicidad';

const TurnoPeriodico = () => {
  const navigate = useNavigate();
  const [paso, setPaso] = useState(1);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState(null);
  const [configuracionPeriodica, setConfiguracionPeriodica] = useState(null);
  const [error, setError] = useState(null);

  const handlePacienteSelect = (paciente) => {
    setPacienteSeleccionado(paciente);
  };

  const handleProfesionalSelect = (event) => {
    setProfesionalSeleccionado(event.target.value);
  };

  const siguientePaso = () => {
    if (!pacienteSeleccionado || !profesionalSeleccionado) {
      toast.error('Por favor, seleccione un paciente y un profesional');
      return;
    }
    setPaso(2);
  };

  const volverPaso = () => {
    setPaso(1);
  };

  // Renderizado del primer paso: selección de paciente y profesional
  const renderPaso1 = () => (
    <div className="space-y-6">
      {!pacienteSeleccionado ? (
        <div>
          <h2 className="text-lg font-medium mb-4">Buscar Paciente</h2>
          <BusquedaPaciente onPacienteSelect={handlePacienteSelect} />
        </div>
      ) : (
        <>
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-2">Paciente Seleccionado</h2>
              <div className="grid grid-cols-2 gap-4 text-gray-600">
                <p><span className="font-medium">Nombre:</span> {pacienteSeleccionado.nombre}</p>
                <p><span className="font-medium">Apellido:</span> {pacienteSeleccionado.apellido}</p>
                <p><span className="font-medium">DNI:</span> {pacienteSeleccionado.dni}</p>
                <p><span className="font-medium">Email:</span> {pacienteSeleccionado.email}</p>
              </div>
              <button
                onClick={() => {
                  setPacienteSeleccionado(null);
                  setProfesionalSeleccionado(null);
                }}
                className="mt-4 text-blue-600 hover:text-blue-800"
              >
                Cambiar paciente
              </button>
            </div>
          </div>

          {/* Selector de profesional - solo se muestra después de seleccionar paciente */}
          <div className="mt-6">
            <h2 className="text-lg font-medium mb-4">Seleccionar Profesional</h2>
            <SelectProfesional
              value={profesionalSeleccionado || ''}
              onChange={handleProfesionalSelect}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </>
      )}

      {/* Botón para continuar */}
      {pacienteSeleccionado && profesionalSeleccionado && (
        <div className="mt-6">
          <button
            onClick={siguientePaso}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Continuar
          </button>
        </div>
      )}
    </div>
  );

  const handleConfiguracionChange = (config) => {
    setConfiguracionPeriodica(config);
  };

  const handleConfirmar = async () => {
    if (!configuracionPeriodica?.fechaInicio || !configuracionPeriodica?.fechaFin || !configuracionPeriodica?.horario) {
      toast.error('Por favor complete todos los campos de la configuración periódica');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/turnos/periodicos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          pacienteId: pacienteSeleccionado.id_usuario,
          profesionalId: profesionalSeleccionado,
          configuracion: configuracionPeriodica
        })
      });

      if (response.ok) {
        toast.success('¡Turnos periódicos registrados exitosamente!');
        navigate('/dashboard');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Error al registrar los turnos periódicos');
      }
    } catch (error) {
      console.error('Error al guardar los turnos periódicos:', error);
      toast.error('Error al registrar los turnos periódicos');
    }
  };

  const renderPaso2 = () => (
    <div>
      <button
        onClick={volverPaso}
        className="mb-4 text-blue-600 hover:text-blue-800"
      >
        ← Volver
      </button>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium mb-4">Configuración de Periodicidad</h2>
        <ConfiguracionPeriodicidad onConfigurationChange={handleConfiguracionChange} />
        
        {configuracionPeriodica?.fechaInicio && 
         configuracionPeriodica?.fechaFin && 
         configuracionPeriodica?.horario && (
          <div className="mt-6">
            <button
              onClick={handleConfirmar}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Confirmar Turnos Periódicos
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Nuevo Turno Periódico</h1>
      {paso === 1 ? renderPaso1() : renderPaso2()}
    </div>
  );
};

export default TurnoPeriodico;