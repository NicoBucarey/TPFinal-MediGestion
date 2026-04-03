import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../../stores/authStore';
import {
	CalendarIcon,
	UserIcon,
	ClockIcon,
	VideoCameraIcon,
	ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

const API = import.meta.env.VITE_API_URL;

const MisTurnosPacientePage = () => {
	const user = useAuthStore((s) => s.user);
	const token = useAuthStore((s) => s.token) || localStorage.getItem('token');
	const [turnos, setTurnos] = useState([]);
	const [turnosPeriodicos, setTurnosPeriodicos] = useState([]);
	const [teleconsultas, setTeleconsultas] = useState([]);
	const [loading, setLoading] = useState(true);
	const [cancelandoSerie, setCancelandoSerie] = useState(false);
	const [periodicoAEliminar, setPeriodicoAEliminar] = useState(null);
	const [filtroEstado, setFiltroEstado] = useState('');
	const [vistaActual, setVistaActual] = useState('simples');

	useEffect(() => {
		if (user?.id) {
			fetchData();
		}
	}, [user]);

	const fetchData = async () => {
		setLoading(true);
		try {
			await Promise.all([fetchTurnos(), fetchTurnosPeriodicos(), fetchTeleconsultas()]);
		} finally {
			setLoading(false);
		}
	};

	const fetchTurnos = async () => {
		try {
			const hoy = new Date().toISOString().split('T')[0];
			const futuro = new Date();
			futuro.setMonth(futuro.getMonth() + 3);
			const hasta = futuro.toISOString().split('T')[0];

			const res = await axios.get(`${API}/turnos/paciente/${user.id}`, {
				params: { fechaDesde: hoy, fechaHasta: hasta },
				headers: { Authorization: `Bearer ${token}` },
			});
			setTurnos(res.data || []);
		} catch (e) {
			console.error('Error fetching turnos:', e);
			setTurnos([]);
		}
	};

	const fetchTurnosPeriodicos = async () => {
		try {
			const res = await axios.get(`${API}/turnos-periodicos/paciente/${user.id}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			setTurnosPeriodicos(res.data || []);
		} catch (e) {
			console.error('Error fetching turnos periodicos:', e);
			setTurnosPeriodicos([]);
		}
	};

	const fetchTeleconsultas = async () => {
		try {
			const res = await axios.get(`${API}/teleconsultas`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			setTeleconsultas(res.data || []);
		} catch (e) {
			console.error('Error fetching teleconsultas:', e);
			setTeleconsultas([]);
		}
	};

	const handleCancelar = async (turnoId) => {
		if (!window.confirm('¿Está seguro que desea cancelar este turno?')) return;

		try {
			await axios.patch(
				`${API}/turnos/${turnoId}/cancelar`,
				{},
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			toast.success('Turno cancelado exitosamente');
			fetchData();
		} catch (e) {
			console.error('Error cancelando turno:', e);
			toast.error(e.response?.data?.error || 'Error al cancelar turno');
		}
	};

	const handleCancelarPeriodico = (periodicoId) => {
		setPeriodicoAEliminar(periodicoId);
	};

	const confirmarCancelarPeriodico = async () => {
		if (!periodicoAEliminar) return;
		setCancelandoSerie(true);

		try {
			await axios.delete(
				`${API}/turnos-periodicos/${periodicoAEliminar}?cancelarSoloFuturos=true`,
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			toast.success('Turnos periódicos cancelados');
			setPeriodicoAEliminar(null);
			fetchData();
		} catch (e) {
			console.error('Error cancelando turno periódico:', e);
			toast.error(e.response?.data?.error || 'Error al cancelar');
		} finally {
			setCancelandoSerie(false);
		}
	};

	const estadoBadge = (estado) => {
		const colors = {
			pendiente: 'bg-yellow-100 text-yellow-700',
			confirmado: 'bg-green-100 text-green-700',
			cancelado: 'bg-red-100 text-red-700',
			completado: 'bg-blue-100 text-blue-700',
		};
		return colors[estado] || 'bg-gray-100 text-gray-700';
	};

	const turnosFiltrados = filtroEstado
		? turnos.filter((t) => t.estado === filtroEstado)
		: turnos;

	const teleconsultasFiltradas = useMemo(
		() => (filtroEstado ? teleconsultas.filter((t) => t.estado === filtroEstado) : teleconsultas),
		[filtroEstado, teleconsultas]
	);

	const puedeCancelar = (fecha, hora) => {
		const turnoDateTime = new Date(`${fecha}T${hora}`);
		return turnoDateTime > new Date();
	};

	const parseFechaLocal = (fecha) => {
		if (!fecha) return null;
		if (fecha instanceof Date) return fecha;
		if (typeof fecha === 'string') {
			const soloFecha = fecha.includes('T') ? fecha.split('T')[0] : fecha;
			const [year, month, day] = soloFecha.split('-').map(Number);
			if (year && month && day) {
				return new Date(year, month - 1, day, 12, 0, 0, 0);
			}
		}
		const parsed = new Date(fecha);
		return Number.isNaN(parsed.getTime()) ? null : parsed;
	};

	const formatearFecha = (fecha) => {
		const parsed = parseFechaLocal(fecha);
		if (!parsed) return 'Fecha inválida';
		return parsed.toLocaleDateString('es-AR', {
			weekday: 'short',
			day: 'numeric',
			month: 'short',
		});
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
			<div className="max-w-6xl mx-auto space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
							<CalendarIcon className="w-8 h-8 text-[#00796B]" />
							Mis Turnos
						</h2>
						<p className="text-gray-600">Gestiona tus citas médicas</p>
					</div>
					<div className="flex items-center gap-2">
						<select
							value={filtroEstado}
							onChange={(e) => setFiltroEstado(e.target.value)}
							className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00796B]"
						>
							<option value="">Todos los estados</option>
							<option value="pendiente">Pendiente</option>
							<option value="confirmado">Confirmado</option>
							<option value="cancelado">Cancelado</option>
							<option value="completado">Completado</option>
						</select>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow p-1 inline-flex gap-1">
					<button
						onClick={() => setVistaActual('simples')}
						className={`px-4 py-2 rounded-md transition-colors ${
							vistaActual === 'simples'
								? 'bg-[#00796B] text-white'
								: 'text-gray-600 hover:bg-gray-100'
						}`}
					>
						Turnos Simples
					</button>
					<button
						onClick={() => setVistaActual('periodicos')}
						className={`px-4 py-2 rounded-md transition-colors ${
							vistaActual === 'periodicos'
								? 'bg-[#00796B] text-white'
								: 'text-gray-600 hover:bg-gray-100'
						}`}
					>
						Turnos Periódicos
					</button>
					<button
						onClick={() => setVistaActual('teleconsultas')}
						className={`px-4 py-2 rounded-md transition-colors ${
							vistaActual === 'teleconsultas'
								? 'bg-[#00796B] text-white'
								: 'text-gray-600 hover:bg-gray-100'
						}`}
					>
						Teleconsultas
					</button>
				</div>

				{vistaActual === 'simples' ? (
					<div className="bg-white rounded-2xl shadow overflow-hidden">
						{loading ? (
							<div className="p-8 text-center text-gray-500">Cargando turnos...</div>
						) : turnosFiltrados.length === 0 ? (
							<div className="p-8 text-center text-gray-500">No tienes turnos</div>
						) : (
							<table className="min-w-full">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Fecha</th>
										<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Hora</th>
										<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Profesional</th>
										<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Motivo</th>
										<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Estado</th>
										<th className="px-6 py-3"></th>
									</tr>
								</thead>
								<tbody>
									{turnosFiltrados.map((turno) => (
										<tr key={turno.id_turno} className="border-t hover:bg-gray-50">
											<td className="px-6 py-4 text-sm text-gray-900">
												{formatearFecha(turno.fecha)}
											</td>
											<td className="px-6 py-4 text-sm text-gray-600">
												<ClockIcon className="w-4 h-4 inline mr-1" />
												{turno.hora_inicio?.slice(0, 5)}
											</td>
											<td className="px-6 py-4 text-sm text-gray-900">
												<div className="flex items-center gap-2">
													<UserIcon className="w-4 h-4 text-gray-400" />
													{turno.profesional_nombre} {turno.profesional_apellido}
												</div>
											</td>
											<td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
												{turno.motivo_consulta || '-'}
											</td>
											<td className="px-6 py-4">
												<span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoBadge(turno.estado)}`}>
													{turno.estado}
												</span>
											</td>
											<td className="px-6 py-4 text-right">
												{turno.estado === 'pendiente' && puedeCancelar(turno.fecha, turno.hora_inicio) && (
													<button
														onClick={() => handleCancelar(turno.id_turno)}
														className="text-red-600 hover:text-red-800 text-sm font-medium"
													>
														Cancelar
													</button>
												)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
					</div>
				) : vistaActual === 'periodicos' ? (
					<div className="space-y-4">
						{turnosPeriodicos.length === 0 ? (
							<div className="bg-white rounded-2xl shadow p-8 text-center text-gray-500">
								No tienes turnos periódicos activos
							</div>
						) : (
							turnosPeriodicos.map((tp) => (
								<div key={tp.id_turno_periodico} className="bg-white rounded-2xl shadow p-6">
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<div className="flex items-center gap-3 mb-2">
												<CalendarIcon className="w-5 h-5 text-[#00796B]" />
												<h3 className="text-lg font-semibold text-gray-900">
													Turno {tp.tipo_periodicidad} - {tp.dia_semana}
												</h3>
											</div>
											<div className="space-y-1 text-sm text-gray-600">
												<p>
													<UserIcon className="w-4 h-4 inline mr-1" />
													Profesional: {tp.profesional_nombre} {tp.profesional_apellido}
												</p>
												<p>
													<ClockIcon className="w-4 h-4 inline mr-1" />
													Horario: {tp.hora_inicio?.slice(0, 5)} - {tp.hora_fin?.slice(0, 5)}
												</p>
												<p>
													<CalendarIcon className="w-4 h-4 inline mr-1" />
													Período: {new Date(tp.fecha_inicio).toLocaleDateString()} - {new Date(tp.fecha_fin).toLocaleDateString()}
												</p>
												<p className="text-blue-600">
													Turnos pendientes: {tp.turnos_pendientes || 0}
												</p>
											</div>
										</div>
										<div>
											{tp.estado === 'activo' && (
												<button
													onClick={() => handleCancelarPeriodico(tp.id_turno_periodico)}
													className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
												>
													Cancelar serie
												</button>
											)}
											{tp.estado === 'cancelado' && (
												<span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
													Cancelado
												</span>
											)}
										</div>
									</div>
								</div>
							))
						)}
					</div>
				) : (
					<div className="bg-white rounded-2xl shadow overflow-hidden">
						{loading ? (
							<div className="p-8 text-center text-gray-500">Cargando teleconsultas...</div>
						) : teleconsultasFiltradas.length === 0 ? (
							<div className="p-8 text-center text-gray-500">No tienes teleconsultas</div>
						) : (
							<table className="min-w-full">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Fecha</th>
										<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Hora</th>
										<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Profesional</th>
										<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Plataforma</th>
										<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Estado</th>
										<th className="px-6 py-3 text-right text-xs font-semibold text-gray-500">Acciones</th>
									</tr>
								</thead>
								<tbody>
									{teleconsultasFiltradas.map((teleconsulta) => (
										<tr key={teleconsulta.id_turno} className="border-t hover:bg-gray-50">
											<td className="px-6 py-4 text-sm text-gray-900">{formatearFecha(teleconsulta.fecha)}</td>
											<td className="px-6 py-4 text-sm text-gray-600">
												<ClockIcon className="w-4 h-4 inline mr-1" />
												{teleconsulta.hora_inicio?.slice(0, 5)}
											</td>
											<td className="px-6 py-4 text-sm text-gray-900">
												<div className="flex items-center gap-2">
													<UserIcon className="w-4 h-4 text-gray-400" />
													{teleconsulta.profesional_nombre} {teleconsulta.profesional_apellido}
												</div>
											</td>
											<td className="px-6 py-4 text-sm text-gray-600 capitalize">
												<div className="flex items-center gap-2">
													<VideoCameraIcon className="w-4 h-4 text-[#00796B]" />
													{teleconsulta.plataforma || 'Teleconsulta'}
												</div>
											</td>
											<td className="px-6 py-4">
												<span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoBadge(teleconsulta.estado)}`}>
													{teleconsulta.estado}
												</span>
											</td>
											<td className="px-6 py-4 text-right">
												<div className="flex items-center justify-end gap-3">
													{teleconsulta.link_reunion && teleconsulta.estado !== 'cancelado' && (
														<a
															href={teleconsulta.link_reunion}
															target="_blank"
															rel="noreferrer"
															className="inline-flex items-center gap-1 text-[#00796B] hover:text-[#005f56] text-sm font-medium"
														>
															<ArrowTopRightOnSquareIcon className="w-4 h-4" />
															Unirse
														</a>
													)}
													{teleconsulta.estado === 'pendiente' && puedeCancelar(teleconsulta.fecha, teleconsulta.hora_inicio) && (
														<button
															onClick={() => handleCancelar(teleconsulta.id_turno)}
															className="text-red-600 hover:text-red-800 text-sm font-medium"
														>
															Cancelar
														</button>
													)}
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
					</div>
				)}

				{periodicoAEliminar && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
						<div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
							<h3 className="text-lg font-semibold text-gray-900">Cancelar serie</h3>
							<p className="mt-2 text-sm text-gray-600">
								¿Cancelar todos los turnos futuros de esta serie?
							</p>
							<div className="mt-6 flex items-center justify-end gap-3">
								<button
									onClick={() => setPeriodicoAEliminar(null)}
									className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
									disabled={cancelandoSerie}
								>
									Volver
								</button>
								<button
									onClick={confirmarCancelarPeriodico}
									className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-70"
									disabled={cancelandoSerie}
								>
									{cancelandoSerie ? 'Cancelando...' : 'Confirmar cancelación'}
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default MisTurnosPacientePage;
