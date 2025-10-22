const DisponibilidadModel = require('../model/disponibilidadModel');
const TurnoModel = require('../model/turnoModel');

const TurnoController = {
  obtenerHorariosProfesional: async (req, res) => {
    try {
      const { id } = req.params;
      const horarios = await DisponibilidadModel.obtenerHorariosProfesional(id);
      res.json(horarios);
    } catch (error) {
      console.error('Error en TurnoController.obtenerHorariosProfesional:', error);
      res.status(500).json({ error: 'Error al obtener los horarios del profesional' });
    }
  },

  obtenerTurnosProfesional: async (req, res) => {
    try {
      const { id } = req.params;
      const { fechaDesde, fechaHasta } = req.query;
      
      // Si no se proporcionan fechas, usar rango por defecto (próximos 30 días)
      const desde = fechaDesde || new Date().toISOString().split('T')[0];
      const hasta = fechaHasta || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const turnos = await TurnoModel.obtenerTurnosProfesional(id, desde, hasta);
      res.json(turnos);
    } catch (error) {
      console.error('Error en TurnoController.obtenerTurnosProfesional:', error);
      res.status(500).json({ error: 'Error al obtener los turnos del profesional' });
    }
  },

  crearTurno: async (req, res) => {
    try {
      const { profesionalId, pacienteId, fechaHora } = req.body;

      // Convertir la fecha y hora recibidas a los formatos necesarios
      const fecha = new Date(fechaHora).toISOString().split('T')[0];
      const horaInicio = new Date(fechaHora).toTimeString().split(' ')[0];
      const horaFin = new Date(new Date(fechaHora).getTime() + 30 * 60000).toTimeString().split(' ')[0];

      const turno = await TurnoModel.crearTurno({
        profesionalId,
        pacienteId,
        fecha,
        horaInicio,
        horaFin
      });

      res.status(201).json(turno);
    } catch (error) {
      console.error('Error en TurnoController.crearTurno:', error);
      if (error.message === 'El horario seleccionado no está disponible') {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error al crear el turno' });
      }
    }
  }
};

module.exports = TurnoController;