import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import BusquedaPaciente from '../../components/pacientes/BusquedaPaciente';
import CalendarioTurnos from '../../components/turnos/CalendarioTurnos';

const NuevoTurno = () => {
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState(null);
  const [fechaTurno, setFechaTurno] = useState(null);
  const [profesionales, setProfesionales] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarProfesionales = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Token:', token); // Verificar que el token existe
        
        const response = await fetch('http://localhost:3000/api/profesionales', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Status:', response.status); // Ver el código de estado HTTP
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error del servidor:', errorData); // Ver el mensaje de error del servidor
          throw new Error(errorData.message || 'Error al cargar profesionales');
        }
        
        const data = await response.json();
        console.log('Profesionales cargados:', data); // Ver los datos recibidos
        setProfesionales(data);
      } catch (error) {
        console.error('Error detallado:', error);
        setError('Error al cargar la lista de profesionales');
        toast.error('Error al cargar profesionales', {
          description: 'No se pudo obtener la lista de profesionales. Por favor, recargue la página.'
        });
      }
    };

    cargarProfesionales();
  }, []);

  const handlePacienteSelect = (paciente) => {
    setPacienteSeleccionado(paciente);
  };

  const handleProfesionalSelect = (event) => {
    setProfesionalSeleccionado({
      id: event.target.value,
      nombre: event.target.options[event.target.selectedIndex].text
    });
  };

  const handleTurnoSelect = async (fecha) => {
    setFechaTurno(fecha);
    
    // Confirmar la selección del turno
    if (window.confirm(`¿Desea confirmar el turno para el ${fecha.toLocaleString()}?`)) {
      try {
        const response = await fetch('/api/turnos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            pacienteId: pacienteSeleccionado.id,
            profesionalId: profesionalSeleccionado.id,
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
          toast.error('Error al registrar el turno', {
            description: errorData.message || 'Por favor, intente nuevamente'
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
              <select
                value={profesionalSeleccionado?.id || ''}
                onChange={handleProfesionalSelect}
                className="w-full rounded-lg border-gray-300 border p-2 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Seleccione un profesional</option>
                {profesionales.map(prof => (
                  <option key={prof.id_usuario} value={prof.id_usuario}>
                    {`${prof.nombre} ${prof.apellido} - ${prof.especialidad || prof.profesion}`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {profesionalSeleccionado && (
            <div>
              <h2 className="text-lg font-medium mb-4">Seleccionar Horario</h2>
              <CalendarioTurnos
                profesionalId={profesionalSeleccionado.id}
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