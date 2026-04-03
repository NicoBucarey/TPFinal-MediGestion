import React, { useEffect, useState } from 'react';
import ConfirmacionTurnoModal from '../components/ConfirmacionTurnoModal';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import BusquedaPaciente from '../../shared/components/BusquedaPaciente';
import SelectProfesional from '../../shared/components/SelectProfesional';
import CalendarioTurnos from '../components/CalendarioTurnos';
import ConfiguracionPeriodicidad from '../components/ConfiguracionPeriodicidad';
import BookingStepIndicator from '../../shared/components/BookingStepIndicator';
import PacienteSeleccionadoCard from '../../shared/components/PacienteSeleccionadoCard';
import { createTurnoPeriodico } from '../../../services/bookingService';

const PASOS = ['Paciente', 'Profesional', 'Fecha/Hora', 'Periodicidad'];

const NuevoTurnoPeriodicoPage = () => {
	const navigate = useNavigate();
	const user = useAuthStore((s) => s.user);
	const isPaciente = user?.rol === 'paciente';
	const [modalAbierto, setModalAbierto] = useState(false);
	const [configAConfirmar, setConfigAConfirmar] = useState(null);
	const [paso, setPaso] = useState(1);
	const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
	const [profesionalSeleccionado, setProfesionalSeleccionado] = useState(null);
	const [fechaHoraSeleccionada, setFechaHoraSeleccionada] = useState(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!isPaciente || !user) return;

		setPacienteSeleccionado({
			id_usuario: user.id,
			nombre: user.nombre,
			apellido: user.apellido,
			dni: user.dni,
			email: user.email,
		});
		setPaso(2);
	}, [isPaciente, user]);

	const handlePacienteSeleccionado = (paciente) => {
		setPacienteSeleccionado(paciente);
		setPaso(2);
	};

	const handleProfesionalSelect = (event) => {
		setProfesionalSeleccionado(event.target.value);
		setPaso(3);
	};

	const handleFechaHoraSeleccionada = (fechaHora) => {
		if (fechaHora instanceof Date) {
			const yyyy = fechaHora.getFullYear();
			const mm = String(fechaHora.getMonth() + 1).padStart(2, '0');
			const dd = String(fechaHora.getDate()).padStart(2, '0');
			const fecha = `${yyyy}-${mm}-${dd}`;
			const hora = String(fechaHora.getHours()).padStart(2, '0');
			const minutos = String(fechaHora.getMinutes()).padStart(2, '0');
			const hora_inicio = `${hora}:${minutos}:00`;
			const finDate = new Date(fechaHora.getTime() + 30 * 60000);
			const hora_fin = `${String(finDate.getHours()).padStart(2, '0')}:${String(finDate.getMinutes()).padStart(2, '0')}:00`;
			setFechaHoraSeleccionada({ fecha, hora_inicio, hora_fin });
		} else {
			setFechaHoraSeleccionada(fechaHora);
		}
		setPaso(4);
	};

	const handleConfiguracionPeriodicidad = async (config) => {
		setConfigAConfirmar(config);
		setModalAbierto(true);
	};

	const crearTurnoPeriodico = async (config) => {
		try {
			setLoading(true);
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

			const payload = {
				pacienteId: pacienteSeleccionado.id_usuario,
				profesionalId: profesionalSeleccionado,
				horaInicio: fechaHoraSeleccionada.hora_inicio,
				horaFin: fechaHoraSeleccionada.hora_fin,
				tipoPeriodicidad: config.tipo,
				diaSemana: config.diaSemana,
				fechaInicio: config.fechaInicio || fechaHoraSeleccionada.fecha,
				fechaFin: config.fechaFin,
			};

			await createTurnoPeriodico(payload);
			toast.success('Turnos periódicos creados exitosamente');
			setPaso(isPaciente ? 2 : 1);
			if (!isPaciente) {
				setPacienteSeleccionado(null);
			}
			setProfesionalSeleccionado(null);
			setFechaHoraSeleccionada(null);
			navigate(isPaciente ? '/dashboard/paciente/turnos' : '/dashboard');
		} catch (error) {
			console.error('Error al crear turno periódico:', error);
			if (error.response) {
				console.error('Respuesta error backend:', error.response.data);

				if (error.response.data.conflictos && error.response.data.conflictos.length > 0) {
					const conflictos = error.response.data.conflictos;
					let mensaje = 'Conflictos encontrados en las siguientes fechas:\n\n';

					conflictos.forEach((conflicto) => {
						const fecha = new Date(conflicto.fecha).toLocaleDateString('es-ES');
						const hora = conflicto.hora_inicio;
						mensaje += `• ${fecha} a las ${hora}\n`;
					});

					mensaje += '\nPor favor, elija otro horario o fechas diferentes.';
					toast.error(mensaje, {
						duration: 8000,
						style: { whiteSpace: 'pre-line' },
					});
				} else {
					toast.error(error.response.data.error || 'Error al crear los turnos periódicos');
				}
			} else {
				toast.error('Error de conexión con el servidor');
			}
		} finally {
			setLoading(false);
		}
	};

	const handleVolver = () => {
		if (isPaciente && paso === 2) return;
		if (paso > 1) {
			setPaso(paso - 1);
			if (paso === 2 && !isPaciente) setPacienteSeleccionado(null);
			if (paso === 3) setProfesionalSeleccionado(null);
			if (paso === 4) setFechaHoraSeleccionada(null);
		}
	};

	return (
		<div className="p-6">
			<div className="w-full">
				<h1 className="text-3xl font-bold mb-6">Nuevo Turno Periódico</h1>
				<BookingStepIndicator steps={PASOS} currentStep={paso} />
				<div className="bg-white rounded-lg shadow p-6">
					{paso === 1 && !isPaciente && (
						<div>
							<h2 className="text-lg font-medium mb-4">Buscar Paciente</h2>
							<BusquedaPaciente onPacienteSelect={handlePacienteSeleccionado} />
						</div>
					)}
					{paso === 2 && pacienteSeleccionado && (
						<div>
							<PacienteSeleccionadoCard
								paciente={pacienteSeleccionado}
								onCambiar={() => {
									if (!isPaciente) {
										setPacienteSeleccionado(null);
										setPaso(1);
									}
								}}
								hideChange={isPaciente}
							/>
							<h2 className="text-xl font-semibold mb-4">Seleccionar Profesional</h2>
							<SelectProfesional
								value={profesionalSeleccionado || ''}
								onChange={handleProfesionalSelect}
								className="w-full rounded-lg border-gray-300 border p-2 focus:border-blue-500 focus:ring-blue-500"
								required
							/>
							{!isPaciente && (
								<button onClick={handleVolver} className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
									Volver
								</button>
							)}
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
						<>
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
							<ConfirmacionTurnoModal
								isOpen={modalAbierto}
								onClose={() => setModalAbierto(false)}
								onConfirm={async () => {
									setModalAbierto(false);
									await crearTurnoPeriodico(configAConfirmar);
								}}
								fecha={fechaHoraSeleccionada ? new Date(configAConfirmar?.fechaInicio + 'T' + fechaHoraSeleccionada.hora_inicio) : new Date()}
							/>
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default NuevoTurnoPeriodicoPage;
