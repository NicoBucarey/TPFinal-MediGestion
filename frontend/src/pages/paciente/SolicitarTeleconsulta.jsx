import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import CalendarioTurnos from '../../components/turnos/CalendarioTurnos';
import SelectProfesional from '../../components/SelectProfesional';
import ConfirmacionTeleconsultaModal from '../../components/teleconsultas/ConfirmacionTeleconsultaModal';

const SolicitarTeleconsulta = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore(); // El paciente logueado
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState(null);
  const [fechaTeleconsulta, setFechaTeleconsulta] = useState(null);
  const [error, setError] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);

  const handleProfesionalSelect = (event) => {
    setProfesionalSeleccionado(event.target.value);
  };

  const handleTeleconsultaSelect = (fecha) => {
    setFechaTeleconsulta(fecha);
    setFechaSeleccionada(fecha);
    setModalAbierto(true);
  };

  const handleConfirmarTeleconsulta = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/teleconsultas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          pacienteId: user.id, // ID del paciente logueado
          profesionalId: profesionalSeleccionado,
          fechaHora: fechaTeleconsulta,
          tipo: 'teleconsulta'
        })
      });

      if (response.ok) {
        toast.success('¡Teleconsulta solicitada exitosamente!', {
          description: `Teleconsulta agendada para ${fechaTeleconsulta.toLocaleString()}`
        });
        
        // Cerrar el modal y redirigir al dashboard
        setModalAbierto(false);
        navigate('/dashboard/paciente/turnos'); // Redirige a "Mis Turnos"
      } else {
        const errorData = await response.json();
        console.error('Error del servidor:', errorData);
        toast.error('Error al solicitar la teleconsulta', {
          description: errorData.error || errorData.message || 'Por favor, intente nuevamente'
        });
      }
    } catch (error) {
      console.error('Error al solicitar la teleconsulta:', error);
      toast.error('Error al solicitar la teleconsulta', {
        description: 'Hubo un problema al conectar con el servidor'
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 text-green-600 mr-3">
          <svg fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold">Solicitar Teleconsulta</h1>
      </div>
      
      <ConfirmacionTeleconsultaModal 
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onConfirm={handleConfirmarTeleconsulta}
        fecha={fechaSeleccionada}
      />

      <div className="bg-white p-4 rounded-lg shadow">
        {/* Información del paciente */}
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">Paciente</h2>
          <div className="grid grid-cols-2 gap-4 text-gray-600 bg-blue-50 p-4 rounded-lg">
            <p><span className="font-medium">Nombre:</span> {user?.nombre}</p>
            <p><span className="font-medium">Apellido:</span> {user?.apellido}</p>
            <p><span className="font-medium">Email:</span> {user?.email}</p>
          </div>
        </div>

        {/* Selección de profesional */}
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

        {/* Calendario para seleccionar horario */}
        {profesionalSeleccionado && (
          <div>
            <h2 className="text-lg font-medium mb-4">Seleccionar Horario para Teleconsulta</h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <div className="w-5 h-5 text-green-600 mr-2">
                  <svg fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-green-800 text-sm">
                  Esta será una consulta virtual. Recibirás un enlace de reunión por email y WhatsApp.
                </p>
              </div>
            </div>
            <CalendarioTurnos
              profesionalId={profesionalSeleccionado}
              onTurnoSelect={handleTeleconsultaSelect}
              tipoConsulta="teleconsulta"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SolicitarTeleconsulta;