import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import './CalendarioTurnos.css';
import { toast } from 'sonner';

// Función auxiliar para convertir día de la semana a número
const getDayNumber = (dia) => {
  const dias = {
    'domingo': 0,
    'lunes': 1,
    'martes': 2,
    'miércoles': 3,
    'jueves': 4,
    'viernes': 5,
    'sábado': 6
  };
  return dias[dia.toLowerCase()];
};

const CalendarioTurnos = ({ onTurnoSelect, profesionalId }) => {
  const [eventos, setEventos] = useState([]);
  const [horariosProfesional, setHorariosProfesional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [horarioLaboral, setHorarioLaboral] = useState({
    inicio: '08:00:00',
    fin: '18:00:00'
  });

  // Obtener los horarios disponibles del profesional
  useEffect(() => {
    const obtenerHorarios = async () => {
      try {
        const token = localStorage.getItem('token');
        // Asegurarse de que profesionalId sea solo el ID numérico
        const idProfesional = typeof profesionalId === 'object' ? profesionalId.id : profesionalId;
        const response = await fetch(`${import.meta.env.VITE_API_URL}/disponibilidad/horarios/${idProfesional}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Error al obtener horarios');
        }
        
        const data = await response.json();
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

        setHorarioLaboral(horariosLimite);
        setHorariosProfesional(data.horarios);
        setEventos(prevEventos => [...prevEventos, ...turnosOcupados]);
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
        
        // Convertir los turnos a eventos del calendario
        const eventosCalendario = data.map(turno => ({
          id: turno.id_turno,
          title: 'Ocupado',
          start: `${turno.fecha.split('T')[0]}T${turno.hora_inicio}`,
          end: `${turno.fecha.split('T')[0]}T${turno.hora_fin}`,
          backgroundColor: '#ff0000',
          borderColor: '#cc0000',
          display: 'background'
        }));
        
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

  const handleDateClick = (info) => {
    const clickedDate = info.date;
    const currentDate = new Date();

    // Validar que no sea una fecha pasada
    if (clickedDate < currentDate) {
      toast.error('No se pueden seleccionar fechas pasadas');
      return;
    }

    // Verificar si hay un turno ocupado en este horario
    const isTurnoOcupado = eventos.some(evento => {
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
      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        slotMinTime={horarioLaboral.inicio}
        slotMaxTime={horarioLaboral.fin}
        slotEventOverlap={false}
        eventOverlap={false}
        slotDuration="00:15:00"
        slotLabelInterval="00:15:00"
        allDaySlot={false}
        locale="es"
        events={eventos}
        dateClick={handleDateClick}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'timeGridWeek,timeGridDay'
        }}
        eventDisplay="block"
        eventOverlap={false}
        eventBackgroundColor="#ff0000"
        eventBorderColor="#cc0000"
        selectable={true}
        selectMirror={true}
        selectConstraint="businessHours"
        slotEventOverlap={false}
        businessHours={horariosProfesional?.map(h => ({
          daysOfWeek: [getDayNumber(h.dia_semana)],
          startTime: h.hora_inicio,
          endTime: h.hora_fin
        })) || []}
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
        snapDuration="00:15:00"
        contentHeight="auto"
        expandRows={true}
        hiddenDays={[0]} // Ocultar domingo
        selectOverlap={false} // No permitir seleccionar sobre eventos existentes
      />
    </div>
  );
};

export default CalendarioTurnos;