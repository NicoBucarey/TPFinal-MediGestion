import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import CalendarioTurnos from '../../turnos/components/CalendarioTurnos';
import SelectProfesional from '../../shared/components/SelectProfesional';
import ConfirmacionTeleconsultaModal from '../components/ConfirmacionTeleconsultaModal';
import { createTeleconsulta } from '../../../services/bookingService';

const SolicitarTeleconsultaPage = () => {
	const navigate = useNavigate();
	const { user } = useAuthStore();
	const [profesionalId, setProfesionalId] = useState('');
	const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
	const [modalAbierto, setModalAbierto] = useState(false);

	const handleTeleconsultaSelect = (fecha) => {
		setFechaSeleccionada(fecha);
		setModalAbierto(true);
	};

	const handleConfirmarTeleconsulta = async () => {
		try {
			await createTeleconsulta({
				pacienteId: user.id,
				profesionalId,
				fechaHora: fechaSeleccionada,
				tipo: 'teleconsulta',
			});
			toast.success('¡Teleconsulta solicitada exitosamente!', {
				description: `Agendada para ${fechaSeleccionada.toLocaleString()}`,
			});
			setModalAbierto(false);
			navigate('/dashboard/paciente/turnos');
		} catch (error) {
			console.error('Error al solicitar la teleconsulta:', error);
			toast.error('Error al solicitar la teleconsulta', {
				description:
					error.response?.data?.error ||
					error.response?.data?.message ||
					'Hubo un problema al conectar con el servidor',
			});
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
			<div className="max-w-5xl mx-auto space-y-6">
				<button
					onClick={() => navigate('/dashboard/paciente/buscar-profesional')}
					className="flex items-center gap-2 text-gray-600 hover:text-[#00796B] transition-colors"
				>
					<ArrowLeftIcon className="w-5 h-5" />
					Volver a búsqueda
				</button>

				<div className="flex items-center gap-3">
					<div className="w-9 h-9 text-[#00796B]">
						<svg fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
							<path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
						</svg>
					</div>
					<h1 className="text-3xl font-bold text-gray-900">Solicitar Teleconsulta</h1>
				</div>

				<ConfirmacionTeleconsultaModal
					isOpen={modalAbierto}
					onClose={() => setModalAbierto(false)}
					onConfirm={handleConfirmarTeleconsulta}
					fecha={fechaSeleccionada}
				/>

				<div className="bg-white rounded-2xl shadow p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-3">Tus datos</h2>
					<div className="grid grid-cols-2 gap-4 text-gray-600 bg-blue-50 p-4 rounded-xl">
						<p><span className="font-medium">Nombre:</span> {user?.nombre}</p>
						<p><span className="font-medium">Apellido:</span> {user?.apellido}</p>
						<p><span className="font-medium">Email:</span> {user?.email}</p>
					</div>
				</div>

				<div className="bg-white rounded-2xl shadow p-6 space-y-4">
					<h2 className="text-lg font-semibold text-gray-900">Seleccionar Profesional</h2>
					<SelectProfesional
						value={profesionalId}
						onChange={(e) => setProfesionalId(e.target.value)}
						className="w-full rounded-lg border-gray-300 border p-2 focus:border-[#00796B] focus:ring-[#00796B]"
					/>
				</div>

				{profesionalId && (
					<div className="bg-white rounded-2xl shadow p-6 space-y-4">
						<h2 className="text-lg font-semibold text-gray-900">Seleccionar Horario</h2>

						<div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
							<div className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5">
								<svg fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
									<path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<p className="text-green-800 text-sm">
								Esta será una consulta virtual. Recibirás un enlace de reunión por email y WhatsApp.
							</p>
						</div>

						<CalendarioTurnos
							profesionalId={profesionalId}
							onTurnoSelect={handleTeleconsultaSelect}
							tipoConsulta="teleconsulta"
						/>
					</div>
				)}
			</div>
		</div>
	);
};

export default SolicitarTeleconsultaPage;
