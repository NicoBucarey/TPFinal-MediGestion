import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import BusquedaPaciente from '../../shared/components/BusquedaPaciente';
import CalendarioTurnos from '../components/CalendarioTurnos';
import SelectProfesional from '../../shared/components/SelectProfesional';
import ConfirmacionTurnoModal from '../components/ConfirmacionTurnoModal';
import BookingStepIndicator from '../../shared/components/BookingStepIndicator';
import PacienteSeleccionadoCard from '../../shared/components/PacienteSeleccionadoCard';
import useSecretarioBooking from '../../../hooks/useSecretarioBooking';
import { useAuthStore } from '../../../stores/authStore';
import { createTurno } from '../../../services/bookingService';

const PASOS = ['Paciente', 'Profesional', 'Fecha/Hora'];

const NuevoTurnoPage = () => {
	const navigate = useNavigate();
	const user = useAuthStore((s) => s.user);
	const isPaciente = user?.rol === 'paciente';
	const pacienteAutenticado =
		isPaciente && user
			? {
				id_usuario: user.id,
				nombre: user.nombre,
				apellido: user.apellido,
				dni: user.dni,
				email: user.email,
			}
			: null;

	const { paciente, setPaciente, profesionalId, handleProfesionalSelect, paso } = useSecretarioBooking({
		initialPaciente: pacienteAutenticado,
		lockPaciente: isPaciente,
	});
	const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
	const [modalAbierto, setModalAbierto] = useState(false);

	const handleTurnoSelect = (fecha) => {
		setFechaSeleccionada(fecha);
		setModalAbierto(true);
	};

	const handleConfirmarTurno = async () => {
		try {
			await createTurno({
				pacienteId: paciente.id_usuario,
				profesionalId,
				fechaHora: fechaSeleccionada,
			});
			toast.success('¡Turno registrado exitosamente!', {
				description: `Turno agendado para ${fechaSeleccionada.toLocaleString()}`,
			});
			setModalAbierto(false);
			navigate(isPaciente ? '/dashboard/paciente/turnos' : '/dashboard');
		} catch (error) {
			console.error('Error al guardar el turno:', error);
			toast.error('Error al registrar el turno', {
				description:
					error.response?.data?.error ||
					error.response?.data?.message ||
					'Hubo un problema al conectar con el servidor',
			});
		}
	};

	return (
		<div className="p-6">
			<h1 className="text-3xl font-bold mb-6">Turno Simple</h1>
			<BookingStepIndicator steps={PASOS} currentStep={paso} />

			<div className="bg-white rounded-lg shadow p-6">
				<ConfirmacionTurnoModal
					isOpen={modalAbierto}
					onClose={() => setModalAbierto(false)}
					onConfirm={handleConfirmarTurno}
					fecha={fechaSeleccionada}
				/>

				{!paciente ? (
					<div>
						<h2 className="text-lg font-medium mb-4">Buscar Paciente</h2>
						<BusquedaPaciente onPacienteSelect={setPaciente} />
					</div>
				) : (
					<div>
						<PacienteSeleccionadoCard
							paciente={paciente}
							onCambiar={() => setPaciente(null)}
							hideChange={isPaciente}
						/>

						<div className="mb-6">
							<h2 className="text-lg font-medium mb-2">Seleccionar Profesional</h2>
							<SelectProfesional
								value={profesionalId}
								onChange={handleProfesionalSelect}
								className="w-full rounded-lg border-gray-300 border p-2 focus:border-blue-500 focus:ring-blue-500"
							/>
						</div>

						{profesionalId && (
							<div>
								<h2 className="text-lg font-medium mb-4">Seleccionar Horario</h2>
								<CalendarioTurnos profesionalId={profesionalId} onTurnoSelect={handleTurnoSelect} />
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default NuevoTurnoPage;
