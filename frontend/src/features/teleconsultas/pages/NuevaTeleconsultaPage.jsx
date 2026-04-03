import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import BusquedaPaciente from '../../shared/components/BusquedaPaciente';
import CalendarioTurnos from '../../turnos/components/CalendarioTurnos';
import SelectProfesional from '../../shared/components/SelectProfesional';
import ConfirmacionTeleconsultaModal from '../components/ConfirmacionTeleconsultaModal';
import BookingStepIndicator from '../../shared/components/BookingStepIndicator';
import PacienteSeleccionadoCard from '../../shared/components/PacienteSeleccionadoCard';
import useSecretarioBooking from '../../../hooks/useSecretarioBooking';
import { useAuthStore } from '../../../stores/authStore';
import { createTeleconsulta } from '../../../services/bookingService';

const PASOS = ['Paciente', 'Profesional', 'Fecha/Hora'];

const NuevaTeleconsultaPage = () => {
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

	const handleTeleconsultaSelect = (fecha) => {
		setFechaSeleccionada(fecha);
		setModalAbierto(true);
	};

	const handleConfirmarTeleconsulta = async () => {
		try {
			await createTeleconsulta({
				pacienteId: paciente.id_usuario,
				profesionalId,
				fechaHora: fechaSeleccionada,
				tipo: 'teleconsulta',
			});
			toast.success('¡Teleconsulta programada exitosamente!', {
				description: `Teleconsulta agendada para ${fechaSeleccionada.toLocaleString()}`,
			});
			setModalAbierto(false);
			navigate(isPaciente ? '/dashboard/paciente/turnos' : '/dashboard');
		} catch (error) {
			toast.error('Error al programar la teleconsulta', {
				description:
					error.response?.data?.error ||
					error.response?.data?.message ||
					'Hubo un problema al conectar con el servidor',
			});
		}
	};

	return (
		<div className="p-6">
			<div className="flex items-baseline mb-6">
				<svg fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor" className="w-7 h-7 text-green-600 mr-3 translate-y-0.5">
					<path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
				</svg>
				<h1 className="text-3xl font-bold">Nueva Teleconsulta</h1>
			</div>

			<BookingStepIndicator steps={PASOS} currentStep={paso} />

			<div className="bg-white rounded-lg shadow p-6">
				<ConfirmacionTeleconsultaModal
					isOpen={modalAbierto}
					onClose={() => setModalAbierto(false)}
					onConfirm={handleConfirmarTeleconsulta}
					fecha={fechaSeleccionada}
				/>

				{!paciente ? (
					<div>
						<h2 className="text-lg font-medium mb-4">Buscar Paciente</h2>
						<BusquedaPaciente onPacienteSelect={setPaciente} />
					</div>
				) : (
					<>
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
								<h2 className="text-lg font-medium mb-4">Seleccionar Horario para Teleconsulta</h2>

								<div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
									<div className="flex items-center">
										<div className="w-5 h-5 text-green-600 mr-2">
											<svg fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
												<path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
										</div>
										<p className="text-green-800 text-sm">
											Esta será una consulta virtual. Se enviará un enlace de reunión a ambas partes.
										</p>
									</div>
								</div>

								<CalendarioTurnos
									profesionalId={profesionalId}
									onTurnoSelect={handleTeleconsultaSelect}
									tipoConsulta="teleconsulta"
								/>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
};

export default NuevaTeleconsultaPage;
