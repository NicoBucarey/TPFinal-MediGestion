import { useState } from 'react';
import { toast } from 'sonner';
import BusquedaPaciente from '../../components/pacientes/BusquedaPaciente';
import CalendarioTurnos from '../../components/turnos/CalendarioTurnos';
import SelectProfesional from '../../components/SelectProfesional';

const NuevoTurno = () => {
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState(null);
  const [fechaTurno, setFechaTurno] = useState(null);
  const [error, setError] = useState(null);

  const handlePacienteSelect = (paciente) => {
    setPacienteSeleccionado(paciente);
  };

  const handleProfesionalSelect = (event) => {
    // Solo guardamos el ID del profesional
    setProfesionalSeleccionado(event.target.value);
  };

  const handleTurnoSelect = async (fecha) => {
    setFechaTurno(fecha);
    
    // Confirmar la selección del turno
    if (window.confirm(`¿Desea confirmar el turno para el ${fecha.toLocaleString()}?`)) {
      try {
        const token = localStorage.getItem('token');
        // Debug datos del turno
        console.log('Datos del turno a crear:', {
          paciente: pacienteSeleccionado,
          profesionalId: profesionalSeleccionado,
          fechaHora: fecha
        });

        const response = await fetch(`${import.meta.env.VITE_API_URL}/turnos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            pacienteId: pacienteSeleccionado.id_usuario,
            profesionalId: profesionalSeleccionado,
            fechaHora: fecha
          })
        });

        if (response.ok) {
          toast.success('¡Turno registrado exitosamente!', {
            description: `Turno agendado para ${fecha.toLocaleString()}`
          });
          // Resetear el formulario
          setPacienteSeleccionado(null);
          setProfesionalSeleccionado(null);
          setFechaTurno(null);
        } else {
          const errorData = await response.json();
          console.error('Error del servidor:', errorData);
          toast.error('Error al registrar el turno', {
            description: errorData.error || errorData.message || 'Por favor, intente nuevamente'
          });
        }
      } catch (error) {
        console.error('Error al guardar el turno:', error);
        toast.error('Error al registrar el turno', {
          description: 'Hubo un problema al conectar con el servidor'
        });
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Nuevo Turno</h1>
      
      {!pacienteSeleccionado ? (
        <div>
          <h2 className="text-lg font-medium mb-4">Buscar Paciente</h2>
          <BusquedaPaciente onPacienteSelect={handlePacienteSelect} />
        </div>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Paciente Seleccionado</h2>
            <div className="grid grid-cols-2 gap-4 text-gray-600">
              <p><span className="font-medium">Nombre:</span> {pacienteSeleccionado.nombre}</p>
              <p><span className="font-medium">Apellido:</span> {pacienteSeleccionado.apellido}</p>
              <p><span className="font-medium">DNI:</span> {pacienteSeleccionado.dni}</p>
              <p><span className="font-medium">Email:</span> {pacienteSeleccionado.email}</p>
            </div>
            <button
              onClick={() => setPacienteSeleccionado(null)}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Cambiar paciente
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Seleccionar Profesional</h2>
            {error ? (
              <div className="text-red-600 mb-4">{error}</div>
            ) : (
              <SelectProfesional
                value={profesionalSeleccionado || ''}
                onChange={handleProfesionalSelect}
                className="w-full rounded-lg border-gray-300 border p-2 focus:border-blue-500 focus:ring-blue-500"
              />
            )}
          </div>

          {profesionalSeleccionado && (
            <div>
              <h2 className="text-lg font-medium mb-4">Seleccionar Horario</h2>
              <CalendarioTurnos
                profesionalId={profesionalSeleccionado}
                onTurnoSelect={handleTurnoSelect}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NuevoTurno;