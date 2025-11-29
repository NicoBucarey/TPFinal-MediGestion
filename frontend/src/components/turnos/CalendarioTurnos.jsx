import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import './CalendarioTurnos.css';
import { toast } from 'sonner';
import ModalInfoTurno from './ModalInfoTurno';

// Función auxiliar para convertir día de la semana a número
const getDayNumber = (dia) => {
  const dias = {
    'domingo': 0,
    'lunes': 1,
    'martes': 2,
    'miércoles': 3,
    'miercoles': 3,  // Sin acento (viene del backend)
    'jueves': 4,
    'viernes': 5,
    'sábado': 6,
    'sabado': 6      // Sin acento (viene del backend)
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

  // Obtener los horarios disponibles del profesional
  useEffect(() => {
    const obtenerHorarios = async () => {
      try {
        const token = localStorage.getItem('token');
        // Asegurarse de que profesionalId sea solo el ID numérico
        const idProfesional = typeof profesionalId === 'object' ? profesionalId.id : profesionalId;
        
        // LOG TEMPORAL para depuración
        console.log('🔧 DEBUG CalendarioTurnos:');
        console.log('🔧 profesionalId recibido:', profesionalId);
        console.log('🔧 idProfesional procesado:', idProfesional);
        console.log('🔧 URL de consulta:', `${import.meta.env.VITE_API_URL}/disponibilidad/horarios/${idProfesional}`);
        
        const response = await fetch(`${import.meta.env.VITE_API_URL}/disponibilidad/horarios/${idProfesional}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Error al obtener horarios');
        }
        
        const data = await response.json();
        console.log('🔧 Datos recibidos del backend:', data);
        console.log('🔧 Horarios detallados:');
        data.horarios.forEach((horario, index) => {
          console.log(`🔧 ${index + 1}. ${horario.dia_semana}: ${horario.activo ? 'ACTIVO' : 'INACTIVO'} - ${horario.hora_inicio} a ${horario.hora_fin}`);
        });
        console.log('🔧 Excepciones recibidas:', data.excepciones?.length || 0);
        if (data.excepciones) {
          data.excepciones.forEach(exc => {
            console.log(`🔧   ${exc.fecha}: ${exc.tipo}`);
          });
        }
        console.log('Datos del profesional:', data);
        
        // Encontrar el horario más temprano y más tardío de los horarios disponibles
        const horariosLimite = data.horarios.reduce((acc, h) => {
          const inicio = h.hora_inicio;
          const fin = h.hora_fin;
          return {
            inicio: inicio < acc.inicio ? inicio : acc.inicio,
            fin: fin > acc.fin ? fin : acc.fin
          };
        }, { inicio: '23:59:00', fin: '00:00:00' });

        // Convertir los turnos ocupados a eventos del calendario
        const turnosOcupados = data.turnosOcupados.map(turno => ({
          title: 'Ocupado',
          start: `${turno.fecha}T${turno.hora_inicio}`,
          end: `${turno.fecha}T${turno.hora_fin}`,
          backgroundColor: '#e74c3c',
          borderColor: '#c0392b',
          editable: false
        }));

        // Convertir las excepciones a eventos bloqueados del calendario
        const excepcionesBloqueadas = (data.excepciones || []).map(excepcion => {
          const fecha = new Date(excepcion.fecha).toISOString().split('T')[0];
          console.log('🔧 Procesando excepción para fecha:', fecha, 'tipo:', excepcion.tipo);
          
          if (excepcion.tipo === 'no_disponible') {
            // Si es día no disponible, bloquear todo el día
            return {
              title: 'No disponible',
              start: fecha,
              end: fecha,
              allDay: true,
              backgroundColor: '#95a5a6',
              borderColor: '#7f8c8d',
              textColor: '#ffffff',
              editable: false,
              display: 'background', // Esto hace que aparezca como fondo bloqueado
              extendedProps: {
                isException: true
              }
            };
          } else if (excepcion.tipo === 'horario_especial') {
            // Si es horario especial, bloquear solo el horario específico
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
        }).filter(Boolean); // Filtrar elementos undefined

        console.log('🔧 Excepciones procesadas como eventos:', excepcionesBloqueadas);

        setHorarioLaboral(horariosLimite);
        setHorariosProfesional(data.horarios);
        console.log('🔧 SETTING horariosProfesional:', data.horarios);
        console.log('🔧 SETTING horarioLaboral:', horariosLimite);
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

  // Obtener los turnos ya asignados
  useEffect(() => {
    const obtenerTurnos = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const fechaActual = new Date().toISOString().split('T')[0];
        const fechaFin = new Date();
        fechaFin.setDate(fechaFin.getDate() + 30); // 30 días hacia adelante
        
        // Asegurarse de que profesionalId sea solo el ID numérico
        const idProfesional = typeof profesionalId === 'object' ? profesionalId.id : profesionalId;
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/turnos/profesional/${idProfesional}?fechaDesde=${fechaActual}&fechaHasta=${fechaFin.toISOString().split('T')[0]}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          throw new Error('Error al obtener turnos');
        }
        
        const data = await response.json();
        console.log('Turnos obtenidos:', data);
        
        // Función para obtener icono y color según el tipo
        const getTurnoVisual = (turno) => {
          // Usar las iniciales del paciente si están disponibles, sino mostrar "Ocupado"
          const iniciales = turno.paciente_nombre && turno.paciente_apellido 
            ? `${turno.paciente_nombre[0]}${turno.paciente_apellido[0]}`.toUpperCase()
            : 'OC';
          
          return {
            title: `👤 ${iniciales}`,
            backgroundColor: '#3b82f6', // Azul por defecto
            borderColor: '#2563eb',
            textColor: '#ffffff'
          };
        };
        
        // Convertir los turnos a eventos del calendario con información visual mejorada
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
              // Guardamos toda la información del turno para el modal
              turnoData: turno
            },
            display: 'block'
          };
        });
        
        setEventos(prevEventos => {
          // Filtrar eventos anteriores que no sean turnos ocupados
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
    // Evitar que se propague el evento de dateClick
    info.jsEvent.stopPropagation();
    
    const turnoId = info.event.id;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/turnos/${turnoId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setModalTurno({ isOpen: true, turnoData: data.turno });
      } else {
        console.error('Error al obtener detalles del turno:', response.statusText);
        // Si no hay endpoint específico, usar los datos básicos
        const turnoData = info.event.extendedProps.turnoData;
        setModalTurno({ isOpen: true, turnoData });
      }
    } catch (error) {
      console.error('Error al obtener detalles del turno:', error);
      // Fallback: usar datos básicos del evento
      const turnoData = info.event.extendedProps.turnoData;
      setModalTurno({ isOpen: true, turnoData });
    }
  };

  const handleDateClick = (info) => {
    const clickedDate = info.date;
    const currentDate = new Date();

    // Validar que no sea una fecha pasada
    if (clickedDate < currentDate) {
      toast.error('No se pueden seleccionar fechas pasadas');
      return;
    }

    // Verificar si es una fecha con excepción (día no disponible)
    const fechaClickeada = clickedDate.toISOString().split('T')[0];
    const tieneExcepcion = eventos.some(evento => 
      evento.extendedProps?.isException && 
      (evento.start === fechaClickeada || evento.start.includes(fechaClickeada))
    );

    if (tieneExcepcion) {
      toast.error('El profesional no está disponible en esta fecha');
      return;
    }

    // Verificar si hay un turno ocupado en este horario
    const isTurnoOcupado = eventos.some(evento => {
      if (evento.extendedProps?.isException) return false; // Excluir excepciones de esta verificación
      const eventoStart = new Date(evento.start);
      const eventoEnd = new Date(evento.end);
      return clickedDate >= eventoStart && clickedDate < eventoEnd;
    });

    if (isTurnoOcupado) {
      toast.error('Este horario ya está ocupado');
      return;
    }

    // Convertir la fecha clickeada a formato legible
    const diaSemana = clickedDate.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
    const hora = clickedDate.getHours();
    const minutos = clickedDate.getMinutes();

    // Validar que sea un horario válido según el profesional
    if (horariosProfesional && !esHorarioValido(diaSemana, hora, minutos, horariosProfesional)) {
      toast.error('El profesional no atiende en este horario');
      return;
    }

    // Si el horario es válido, notificar la selección
    onTurnoSelect(clickedDate);
  };

  const esHorarioValido = (diaSemana, hora, minutos, horarios) => {
    // Si no hay horarios configurados, no permitir turnos
    if (!horarios || horarios.length === 0) {
      return false;
    }

    // Buscar el horario para el día seleccionado
    const horarioDia = horarios.find(h => h.dia_semana.toLowerCase() === diaSemana);
    
    if (!horarioDia) {
      return false;
    }

    // Convertir las horas a minutos para facilitar la comparación
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
        eventOverlap={false}
        selectable={true}
        selectMirror={true}
        selectConstraint="businessHours"
        slotEventOverlap={false}
        businessHours={(() => {
          console.log('🔧 CALENDAR CONFIG - horariosProfesional:', horariosProfesional);
          const businessHours = horariosProfesional?.map(h => {
            const dayNumber = getDayNumber(h.dia_semana);
            console.log(`🔧 CALENDAR CONFIG - Día: ${h.dia_semana}, DayNumber: ${dayNumber}, Horario: ${h.hora_inicio}-${h.hora_fin}`);
            return {
              daysOfWeek: [dayNumber],
              startTime: h.hora_inicio,
              endTime: h.hora_fin
            };
          }) || [];
          console.log('🔧 CALENDAR CONFIG - businessHours final:', businessHours);
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
        hiddenDays={[0]} // Ocultar domingo
        selectOverlap={false} // No permitir seleccionar sobre eventos existentes
      />
    </div>
  );
};

export default CalendarioTurnos;