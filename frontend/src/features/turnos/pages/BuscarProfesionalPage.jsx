import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MagnifyingGlassIcon, UserIcon } from '@heroicons/react/24/outline';
import { getProfesionales } from '../../../services/bookingService';

const BuscarProfesionalPage = () => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [profesionales, setProfesionales] = useState([]);
	const [filtrados, setFiltrados] = useState([]);
	const [loading, setLoading] = useState(true);
	const [busqueda, setBusqueda] = useState('');
	const modo = searchParams.get('modo') || 'simple';

	useEffect(() => {
		fetchProfesionales();
	}, []);

	useEffect(() => {
		if (!busqueda.trim()) {
			setFiltrados(profesionales);
			return;
		}
		const term = busqueda.toLowerCase();
		const results = profesionales.filter((p) =>
			p.nombre.toLowerCase().includes(term) ||
			p.apellido.toLowerCase().includes(term) ||
			(p.especialidad && p.especialidad.toLowerCase().includes(term)) ||
			(p.profesion && p.profesion.toLowerCase().includes(term))
		);
		setFiltrados(results);
	}, [busqueda, profesionales]);

	const fetchProfesionales = async () => {
		setLoading(true);
		try {
			const data = await getProfesionales();
			setProfesionales(data);
			setFiltrados(data);
		} catch (e) {
			console.error('Error fetching profesionales:', e);
			setProfesionales([]);
			setFiltrados([]);
		} finally {
			setLoading(false);
		}
	};

	const verAgenda = (profesionalId) => {
		if (modo === 'periodico') {
			navigate(`/dashboard/paciente/turno-periodico/${profesionalId}`);
			return;
		}

		navigate(`/dashboard/paciente/agenda/${profesionalId}`);
	};

	const titulo = modo === 'periodico' ? 'Seleccionar Profesional (Turno Periódico)' : 'Buscar Profesional';
	const subtitulo =
		modo === 'periodico'
			? 'Elige un profesional para configurar tu turno recurrente'
			: 'Encuentra al profesional que necesitas';
	const cta = modo === 'periodico' ? 'Configurar Turno Periódico' : 'Ver Agenda';

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
			<div className="max-w-6xl mx-auto space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
							<UserIcon className="w-8 h-8 text-[#00796B]" />
							{titulo}
						</h2>
						<p className="text-gray-600">{subtitulo}</p>
					</div>
				</div>

				<div className="bg-white rounded-2xl shadow p-4">
					<div className="relative">
						<MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
						<input
							type="text"
							placeholder="Buscar por nombre, apellido o especialidad..."
							value={busqueda}
							onChange={(e) => setBusqueda(e.target.value)}
							className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00796B]"
						/>
					</div>
				</div>

				{loading ? (
					<div className="text-center py-12">
						<div className="text-gray-500">Cargando profesionales...</div>
					</div>
				) : filtrados.length === 0 ? (
					<div className="text-center py-12">
						<div className="text-gray-500">
							{busqueda ? 'No se encontraron profesionales con ese criterio' : 'No hay profesionales disponibles'}
						</div>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{filtrados.map((prof) => (
							<div
								key={prof.id_usuario}
								className="bg-white rounded-2xl shadow hover:shadow-lg transition-shadow p-6 space-y-4"
							>
								<div className="flex items-center gap-4">
									<div className="w-16 h-16 bg-[#00796B]/10 rounded-full flex items-center justify-center">
										<UserIcon className="w-8 h-8 text-[#00796B]" />
									</div>
									<div className="flex-1">
										<h3 className="text-lg font-semibold text-gray-900">
											{prof.nombre} {prof.apellido}
										</h3>
										{prof.especialidad && (
											<p className="text-sm text-gray-600">{prof.especialidad}</p>
										)}
										{prof.profesion && (
											<p className="text-xs text-gray-500">{prof.profesion}</p>
										)}
									</div>
								</div>
								<button
									onClick={() => verAgenda(prof.id_usuario)}
									className="w-full px-4 py-2 bg-[#00796B] hover:bg-[#00796B]/90 text-white rounded-lg transition-colors"
								>
									{cta}
								</button>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default BuscarProfesionalPage;
