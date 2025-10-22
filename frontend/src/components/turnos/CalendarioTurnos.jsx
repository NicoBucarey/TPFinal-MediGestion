import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const CalendarioTurnos = ({ onTurnoSelect, profesionalId }) => {
  const [eventos, setEventos] = useState([]);
  const [horariosProfesional, setHorariosProfesional] = useState(null);

  // Obtener los horarios disponibles del profesional
  useEffect(() => {
    const obtenerHorarios = async () => {
      try {
        const response = await fetch(`/api/profesionales/${profesionalId}/horarios`);
        const data = await response.json();
        setHorariosProfesional(data);
      } catch (error) {
        console.error('Error al obtener horarios:', error);
      }
    };

    if (profesionalId) {
      obtenerHorarios();
    }
  }, [profesionalId]);

  // Obtener los turnos ya asignados
  useEffect(() => {
    const obtenerTurnos = async () => {
      try {
        const response = await fetch(`/api/turnos/profesional/${profesionalId}`);
        const data = await response.json();
        
        // Convertir los turnos a eventos del calendario
        const eventosCalendario = data.map(turno => ({
          id: turno.id,
          title: 'Ocupado',
          start: turno.fecha_hora,
          end: new Date(new Date(turno.fecha_hora).getTime() + 30 * 60000), // 30 minutos
          backgroundColor: '#E02424', // Rojo para turnos ocupados
        }));
        
        setEventos(eventosCalendario);
      } catch (error) {
        console.error('Error al obtener turnos:', error);
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
      alert('No se pueden seleccionar fechas pasadas');
      return;
    }

    // Validar que sea un horario válido según el profesional
    if (horariosProfesional && !esHorarioValido(clickedDate, horariosProfesional)) {
      alert('El profesional no atiende en este horario');
      return;
    }

    // Si el horario es válido, notificar la selección
    onTurnoSelect(clickedDate);
  };

  const esHorarioValido = (fecha, horarios) => {
    // TODO: Implementar validación según los horarios del profesional
    return true;
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
        slotDuration="00:30:00"
        allDaySlot={false}
        locale="es"
        events={eventos}
        dateClick={handleDateClick}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'timeGridWeek,timeGridDay'
        }}
        businessHours={{
          daysOfWeek: [1, 2, 3, 4, 5], // Lunes a Viernes
          startTime: '08:00',
          endTime: '20:00',
        }}
        height="auto"
        slotLabelFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }}
      />
    </div>
  );
};

export default CalendarioTurnos;