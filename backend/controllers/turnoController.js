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
      const resultado = await DisponibilidadModel.obtenerHorariosProfesional(id);
      
      // Devolver solo los horarios (ya normalizados en el modelo)
      res.json(resultado.horarios);
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

  obtenerTurnosPaciente: async (req, res) => {
    try {
      const { id } = req.params;
      const { fechaDesde, fechaHasta } = req.query;
      
      if (!id) {
        return res.status(400).json({ error: 'Se requiere el ID del paciente' });
      }

      // Si no se proporcionan fechas, usar rango por defecto
      const desde = fechaDesde || new Date().toISOString().split('T')[0];
      const futuro = new Date();
      futuro.setMonth(futuro.getMonth() + 3);
      const hasta = fechaHasta || futuro.toISOString().split('T')[0];

      // Validar que las fechas sean válidas
      if (!Date.parse(desde) || !Date.parse(hasta)) {
        return res.status(400).json({ error: 'Fechas inválidas' });
      }

      const turnos = await TurnoModel.obtenerTurnosPaciente(id, desde, hasta);
      res.json(turnos);
    } catch (error) {
      console.error('Error en TurnoController.obtenerTurnosPaciente:', error);
      res.status(500).json({ 
        error: 'Error al obtener los turnos del paciente',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  crearTurno: async (req, res) => {
    try {
      const { profesionalId, pacienteId, fechaHora, motivoConsulta } = req.body;

      console.log('Datos recibidos para crear turno:', { profesionalId, pacienteId, fechaHora, motivoConsulta });

      if (!profesionalId || !pacienteId || !fechaHora) {
        return res.status(400).json({ error: 'Faltan datos requeridos: profesionalId, pacienteId, fechaHora' });
      }

      // Convertir la fecha y hora recibidas a los formatos necesarios
      const fechaObj = new Date(fechaHora);
      const fecha = fechaObj.toISOString().split('T')[0];
      const horaInicio = fechaObj.toTimeString().split(' ')[0];
      const horaFin = new Date(fechaObj.getTime() + 30 * 60000).toTimeString().split(' ')[0];

      console.log('Fecha y hora procesadas:', { fecha, horaInicio, horaFin });

      const turno = await TurnoModel.crearTurno({
        profesionalId,
        pacienteId,
        fecha,
        horaInicio,
        horaFin
      });

      console.log('Turno creado:', turno);

      // Guardar motivo de consulta si se proporciona
      if (motivoConsulta && turno.id_turno) {
        await pool.query(
          'UPDATE turno SET motivo_consulta = $1 WHERE id_turno = $2',
          [motivoConsulta, turno.id_turno]
        );
        console.log('Motivo de consulta guardado');
      }

      // Enviar recordatorio por WhatsApp (no bloqueante)
      setImmediate(async () => {
        try {
          const RecordatorioService = require('../services/recordatorioService');
          await RecordatorioService.crearRecordatorioConfirmacion(turno.id_turno);
        } catch (err) {
          console.error('Error al enviar recordatorio WhatsApp (no crítico):', err.message);
        }
      });

      res.status(201).json(turno);
    } catch (error) {
      console.error('Error en TurnoController.crearTurno:', error);
      if (error.message === 'El horario seleccionado no está disponible') {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ 
          error: 'Error al crear el turno',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    }
  },

  cancelarTurno: async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query(
        'UPDATE turno SET estado = $1 WHERE id_turno = $2',
        ['cancelado', id]
      );
      res.json({ message: 'Turno cancelado exitosamente' });
    } catch (error) {
      console.error('Error en TurnoController.cancelarTurno:', error);
      res.status(500).json({ error: 'Error al cancelar el turno' });
    }
  }
};

module.exports = TurnoController;