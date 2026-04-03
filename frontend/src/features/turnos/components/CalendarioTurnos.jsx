import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import './CalendarioTurnos.css';
import { toast } from 'sonner';
import ModalInfoTurno from './ModalInfoTurno';
import { getCalendarioDisponibilidad, getProfesionalTurnos } from '../../../services/bookingService';

const getDayNumber = (dia) => {
	const dias = {
		domingo: 0,
		lunes: 1,
		martes: 2,
		'miércoles': 3,
		miercoles: 3,
		jueves: 4,
		viernes: 5,
		'sábado': 6,
		sabado: 6
	};
	return dias[dia.toLowerCase()];
};

const CalendarioTurnos = ({ onTurnoSelect, profesionalId, tipoConsulta = 'presencial' }) => {
	const [eventos, setEventos] = useState([]);
	const [horariosProfesional, setHorariosProfesional] = useState(null);
	const [loading, setLoading] = useState(true);
	const [modalTurno, setModalTurno] = useState({ isOpen: false, turnoData: null });
	const [horarioLaboral, setHorarioLaboral] = useState({
		inicio: '08:00:00',
		fin: '20:00:00'
	});
	void tipoConsulta;
	void loading;

	useEffect(() => {
		const obtenerHorarios = async () => {
			try {
				const idProfesional = typeof profesionalId === 'object' ? profesionalId.id : profesionalId;

				const data = await getCalendarioDisponibilidad(idProfesional);

				const horariosLimite = data.horarios.reduce((acc, h) => {
					const inicio = h.hora_inicio;
					const fin = h.hora_fin;
					return {
						inicio: inicio < acc.inicio ? inicio : acc.inicio,
						fin: fin > acc.fin ? fin : acc.fin
					};
				}, { inicio: '23:59:00', fin: '00:00:00' });

				const turnosOcupados = data.turnosOcupados.map(turno => ({
					title: 'Ocupado',
					start: `${turno.fecha}T${turno.hora_inicio}`,
					end: `${turno.fecha}T${turno.hora_fin}`,
					backgroundColor: '#e74c3c',
					borderColor: '#c0392b',
					editable: false
				}));

				const excepcionesBloqueadas = (data.excepciones || []).map(excepcion => {
					const fecha = new Date(excepcion.fecha).toISOString().split('T')[0];

					if (excepcion.tipo === 'no_disponible') {
						return {
							title: 'No disponible',
							start: fecha,
							end: fecha,
							allDay: true,
							backgroundColor: '#95a5a6',
							borderColor: '#7f8c8d',
							textColor: '#ffffff',
							editable: false,
							display: 'background',
							extendedProps: {
								isException: true
							}
						};
					}
					if (excepcion.tipo === 'horario_especial') {
						return {
							title: 'Horario especial',
							start: `${fecha}T${excepcion.hora_inicio}`,
							end: `${fecha}T${excepcion.hora_fin}`,
							backgroundColor: '#f39c12',
							borderColor: '#e67e22',
							textColor: '#ffffff',
							editable: false,
							display: 'background',
							extendedProps: {
								isException: true
							}
						};
					}
					return null;
				}).filter(Boolean);

				setHorarioLaboral(horariosLimite);
				setHorariosProfesional(data.horarios);
				setEventos(prevEventos => [...prevEventos, ...turnosOcupados, ...excepcionesBloqueadas]);
			} catch (error) {
				console.error('Error al obtener horarios:', error);
				toast.error('Error al cargar los horarios del profesional');
			}
		};

		if (profesionalId) {
			obtenerHorarios();
		}
	}, [profesionalId]);

	useEffect(() => {
		const obtenerTurnos = async () => {
			setLoading(true);
			try {
				const fechaActual = new Date().toISOString().split('T')[0];
				const fechaFin = new Date();
				fechaFin.setDate(fechaFin.getDate() + 30);

				const idProfesional = typeof profesionalId === 'object' ? profesionalId.id : profesionalId;
				const data = await getProfesionalTurnos(idProfesional, {
					fechaDesde: fechaActual,
					fechaHasta: fechaFin.toISOString().split('T')[0]
				});

				const getTurnoVisual = (turno) => {
					const iniciales = turno.paciente_nombre && turno.paciente_apellido
						? `${turno.paciente_nombre[0]}${turno.paciente_apellido[0]}`.toUpperCase()
						: 'OC';

					if (turno.tipo === 'teleconsulta') {
						return {
							title: `🎥 ${iniciales}`,
							backgroundColor: '#10b981',
							borderColor: '#059669',
							textColor: '#ffffff'
						};
					}
					return {
						title: `👤 ${iniciales}`,
						backgroundColor: '#3b82f6',
						borderColor: '#2563eb',
						textColor: '#ffffff'
					};
				};

				const eventosCalendario = data.map(turno => {
					const visual = getTurnoVisual(turno);
					return {
						id: turno.id_turno,
						title: visual.title,
						start: `${turno.fecha.split('T')[0]}T${turno.hora_inicio}`,
						end: `${turno.fecha.split('T')[0]}T${turno.hora_fin}`,
						backgroundColor: visual.backgroundColor,
						borderColor: visual.borderColor,
						textColor: visual.textColor,
						extendedProps: {
							turnoData: turno
						},
						display: 'block'
					};
				});

				setEventos(prevEventos => {
					const eventosAnteriores = prevEventos.filter(e => !e.id);
					return [...eventosAnteriores, ...eventosCalendario];
				});
			} catch (error) {
				console.error('Error al obtener turnos:', error);
				toast.error('Error al cargar los turnos');
			} finally {
				setLoading(false);
			}
		};

		if (profesionalId) {
			obtenerTurnos();
		}
	}, [profesionalId]);

	const handleEventClick = async (info) => {
		info.jsEvent.stopPropagation();

		const turnoId = info.event.id;

		try {
			const token = localStorage.getItem('token');
			const response = await fetch(`http://localhost:3000/api/turnos/${turnoId}`, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			if (response.ok) {
				const data = await response.json();
				setModalTurno({ isOpen: true, turnoData: data.turno });
			} else {
				console.error('Error al obtener detalles del turno:', response.statusText);
				const turnoData = info.event.extendedProps.turnoData;
				setModalTurno({ isOpen: true, turnoData });
			}
		} catch (error) {
			console.error('Error al obtener detalles del turno:', error);
			const turnoData = info.event.extendedProps.turnoData;
			setModalTurno({ isOpen: true, turnoData });
		}
	};

	const handleDateClick = (info) => {
		const clickedDate = info.date;
		const currentDate = new Date();

		const clickedDateOnly = new Date(clickedDate.getFullYear(), clickedDate.getMonth(), clickedDate.getDate());
		const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

		if (clickedDateOnly < currentDateOnly) {
			toast.error('No se pueden seleccionar fechas pasadas');
			return;
		}

		if (clickedDateOnly.getTime() === currentDateOnly.getTime() && clickedDate < currentDate) {
			toast.error('No se pueden seleccionar horarios pasados');
			return;
		}

		const fechaClickeada = clickedDate.toISOString().split('T')[0];
		const tieneExcepcion = eventos.some(evento =>
			evento.extendedProps?.isException &&
			(evento.start === fechaClickeada || evento.start.includes(fechaClickeada))
		);

		if (tieneExcepcion) {
			toast.error('El profesional no está disponible en esta fecha');
			return;
		}

		const isTurnoOcupado = eventos.some(evento => {
			if (evento.extendedProps?.isException) return false;
			const eventoStart = new Date(evento.start);
			const eventoEnd = new Date(evento.end);
			return clickedDate >= eventoStart && clickedDate < eventoEnd;
		});

		if (isTurnoOcupado) {
			toast.error('Este horario ya está ocupado');
			return;
		}

		const diaSemana = clickedDate.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
		const hora = clickedDate.getHours();
		const minutos = clickedDate.getMinutes();

		if (horariosProfesional && !esHorarioValido(diaSemana, hora, minutos, horariosProfesional)) {
			toast.error('El profesional no atiende en este horario');
			return;
		}

		onTurnoSelect(clickedDate);
	};

	const esHorarioValido = (diaSemana, hora, minutos, horarios) => {
		if (!horarios || horarios.length === 0) {
			return false;
		}

		const diaNormalizado = diaSemana
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '');

		const horarioDia = horarios.find(h => {
			const horarioDiaNormalizado = h.dia_semana
				.toLowerCase()
				.normalize('NFD')
				.replace(/[\u0300-\u036f]/g, '');
			return horarioDiaNormalizado === diaNormalizado;
		});

		if (!horarioDia) {
			return false;
		}

		if (!horarioDia.activo) {
			return false;
		}

		const horaActual = hora * 60 + minutos;
		const horaInicio = parseInt(horarioDia.hora_inicio.split(':')[0]) * 60 +
											parseInt(horarioDia.hora_inicio.split(':')[1]);
		const horaFin = parseInt(horarioDia.hora_fin.split(':')[0]) * 60 +
										parseInt(horarioDia.hora_fin.split(':')[1]);

		return horaActual >= horaInicio && horaActual < horaFin;
	};

	return (
		<div className="p-4 bg-white rounded-lg shadow">
			<ModalInfoTurno
				isOpen={modalTurno.isOpen}
				onClose={() => setModalTurno({ isOpen: false, turnoData: null })}
				turnoData={modalTurno.turnoData}
			/>

			<FullCalendar
				plugins={[timeGridPlugin, interactionPlugin]}
				initialView="timeGridWeek"
				slotMinTime={horarioLaboral.inicio}
				slotMaxTime={horarioLaboral.fin}
				slotEventOverlap={false}
				eventOverlap={false}
				slotDuration={`00:${horariosProfesional?.[0]?.duracion_turno || '30'}:00`}
				slotLabelInterval={`00:${horariosProfesional?.[0]?.duracion_turno || '30'}:00`}
				allDaySlot={false}
				locale="es"
				events={eventos}
				dateClick={handleDateClick}
				eventClick={handleEventClick}
				headerToolbar={{
					left: 'prev,next today',
					center: 'title',
					right: 'timeGridWeek,timeGridDay'
				}}
				eventDisplay="block"
				selectable={true}
				selectMirror={true}
				selectConstraint="businessHours"
				businessHours={(() => {
					const businessHours = horariosProfesional?.map(h => {
						const dayNumber = getDayNumber(h.dia_semana);
						return {
							daysOfWeek: [dayNumber],
							startTime: h.hora_inicio,
							endTime: h.hora_fin
						};
					}) || [];
					return businessHours;
				})()}
				height="auto"
				slotLabelFormat={{
					hour: '2-digit',
					minute: '2-digit',
					hour12: true
				}}
				displayEventTime={true}
				eventTimeFormat={{
					hour: '2-digit',
					minute: '2-digit',
					hour12: true
				}}
				nowIndicator={true}
				snapDuration={`00:${horariosProfesional?.[0]?.duracion_turno || '30'}:00`}
				contentHeight="auto"
				expandRows={true}
				hiddenDays={[0]}
				selectOverlap={false}
			/>
		</div>
	);
};

export default CalendarioTurnos;
