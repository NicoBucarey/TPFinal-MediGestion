const db = require('../db');

const DisponibilidadController = {
  obtenerConfiguracion: async (req, res) => {
    const { id_profesional } = req.params;

    try {
      // Verificar que el profesional solo pueda ver su propia configuración
      if (req.user.id !== parseInt(id_profesional)) {
        return res.status(403).json({ error: 'No autorizado' });
      }

      const horarios = await db.query(
        `SELECT 
          dia_semana, 
          activo, 
          hora_inicio, 
          hora_fin, 
          duracion_turno, 
          intervalo_turnos
        FROM disponibilidad 
        WHERE id_profesional = $1`,
        [id_profesional]
      );

      res.json({
        horarios: horarios.rows,
        configuracion: horarios.rows[0] ? {
          duracionTurno: horarios.rows[0].duracion_turno,
          intervaloTurnos: horarios.rows[0].intervalo_turnos
        } : {
          duracionTurno: 30,
          intervaloTurnos: 0
        }
      });
    } catch (error) {
      console.error('Error al obtener configuración:', error);
      res.status(500).json({ error: 'Error al obtener la configuración' });
    }
  },

  guardarConfiguracion: async (req, res) => {
    const { id_profesional } = req.params;
    const { horarios, configuracion } = req.body;

    try {
      // Verificar que el profesional solo pueda modificar su propia configuración
      if (req.user.id !== parseInt(id_profesional)) {
        return res.status(403).json({ error: 'No autorizado' });
      }

      const client = await db.connect();

      try {
        await client.query('BEGIN');

        // Eliminar configuración existente
        await client.query(
          'DELETE FROM disponibilidad WHERE id_profesional = $1',
          [id_profesional]
        );

        // Insertar nueva configuración
        for (const [dia, horario] of Object.entries(horarios)) {
          await client.query(
            `INSERT INTO disponibilidad (
              id_profesional, 
              dia_semana, 
              activo, 
              hora_inicio, 
              hora_fin, 
              duracion_turno, 
              intervalo_turnos
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              id_profesional,
              dia,
              horario.activo,
              horario.horaInicio,
              horario.horaFin,
              configuracion.duracionTurno,
              configuracion.intervaloTurnos
            ]
          );
        }

        await client.query('COMMIT');
        res.json({ mensaje: 'Configuración guardada exitosamente' });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      res.status(500).json({ error: 'Error al guardar la configuración' });
    }
  },

  obtenerExcepciones: async (req, res) => {
    const { id_profesional } = req.params;

    try {
      // Verificar que el profesional solo pueda ver sus propias excepciones
      if (req.user.id !== parseInt(id_profesional)) {
        return res.status(403).json({ error: 'No autorizado' });
      }

      const excepciones = await db.query(
        `SELECT * FROM disponibilidad_excepciones 
         WHERE id_profesional = $1`,
        [id_profesional]
      );

      res.json(excepciones.rows);
    } catch (error) {
      console.error('Error al obtener excepciones:', error);
      res.status(500).json({ error: 'Error al obtener las excepciones' });
    }
  },

  agregarExcepcion: async (req, res) => {
    const { id_profesional } = req.params;
    const { fecha, tipo, horaInicio, horaFin } = req.body;

    try {
      // Verificar que el profesional solo pueda agregar sus propias excepciones
      if (req.user.id !== parseInt(id_profesional)) {
        return res.status(403).json({ error: 'No autorizado' });
      }

      const result = await db.query(
        `INSERT INTO disponibilidad_excepciones (
          id_profesional, 
          fecha, 
          tipo, 
          hora_inicio, 
          hora_fin
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [id_profesional, fecha, tipo, horaInicio || null, horaFin || null]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error al agregar excepción:', error);
      res.status(500).json({ error: 'Error al agregar la excepción' });
    }
  },

  eliminarExcepcion: async (req, res) => {
    const { id_profesional, id_excepcion } = req.params;

    try {
      // Verificar que el profesional solo pueda eliminar sus propias excepciones
      if (req.user.id !== parseInt(id_profesional)) {
        return res.status(403).json({ error: 'No autorizado' });
      }

      await db.query(
        `DELETE FROM disponibilidad_excepciones 
         WHERE id_excepcion = $1 AND id_profesional = $2`,
        [id_excepcion, id_profesional]
      );

      res.json({ mensaje: 'Excepción eliminada exitosamente' });
    } catch (error) {
      console.error('Error al eliminar excepción:', error);
      res.status(500).json({ error: 'Error al eliminar la excepción' });
    }
  }
};

module.exports = DisponibilidadController;