const DisponibilidadModel = require('../model/disponibilidadModel');
const TurnoModel = require('../model/turnoModel');
const pool = require('../db');

const TurnoController = {
  obtenerHorariosProfesional: async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ error: 'Se requiere el ID del profesional' });
      }

      console.log('Obteniendo horarios para el profesional:', id);
      const horarios = await DisponibilidadModel.obtenerHorariosProfesional(id);
      res.json(horarios);
    } catch (error) {
      console.error('Error en TurnoController.obtenerHorariosProfesional:', error);
      if (error.message === 'Profesional no encontrado') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Error al obtener los horarios del profesional' });
    }
  },

  obtenerTurnosProfesional: async (req, res) => {
    try {
      const { id } = req.params;
      const { fechaDesde, fechaHasta } = req.query;
      
      if (!id) {
        return res.status(400).json({ error: 'Se requiere el ID del profesional' });
      }

      // Validar que el profesional exista
      const profesionalCheck = await pool.query(
        'SELECT id_profesional FROM profesional WHERE id_profesional = $1',
        [id]
      );

      if (profesionalCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Profesional no encontrado' });
      }
      
      // Si no se proporcionan fechas, usar rango por defecto (próximos 30 días)
      const desde = fechaDesde || new Date().toISOString().split('T')[0];
      const hasta = fechaHasta || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Validar que las fechas sean válidas
      if (!Date.parse(desde) || !Date.parse(hasta)) {
        return res.status(400).json({ error: 'Fechas inválidas' });
      }

      // Validar que el rango de fechas sea coherente
      if (new Date(hasta) < new Date(desde)) {
        return res.status(400).json({ error: 'La fecha final debe ser posterior a la fecha inicial' });
      }

      console.log('Buscando turnos para profesional:', id, 'desde:', desde, 'hasta:', hasta);

      const turnos = await TurnoModel.obtenerTurnosProfesional(id, desde, hasta);
      console.log('Turnos encontrados:', turnos);
      res.json(turnos);
    } catch (error) {
      console.error('Error en TurnoController.obtenerTurnosProfesional:', error);
      res.status(500).json({ 
        error: 'Error al obtener los turnos del profesional',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
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