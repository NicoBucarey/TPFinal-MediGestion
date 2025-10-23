const db = require('../db');

const TurnoModel = {
  obtenerTurnosProfesional: async (profesionalId, fechaDesde, fechaHasta) => {
    try {
      // Consulta para verificar si la tabla turno existe
      const tableCheck = await db.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'turno'
        );
      `);

      if (!tableCheck.rows[0].exists) {
        throw new Error('La tabla turno no existe en la base de datos');
      }

      const query = `
        SELECT 
          t.id_turno,
          t.fecha,
          t.hora_inicio,
          t.hora_fin,
          t.estado,
          p.id_paciente,
          u.nombre as nombre_paciente,
          u.apellido as apellido_paciente
        FROM turno t
        LEFT JOIN paciente p ON t.id_paciente = p.id_paciente
        LEFT JOIN usuario u ON p.id_paciente = u.id_usuario
        WHERE t.id_profesional = $1
          AND t.fecha BETWEEN $2 AND $3
        ORDER BY t.fecha ASC, t.hora_inicio ASC
      `;

      console.log('Ejecutando query con parámetros:', {
        profesionalId,
        fechaDesde,
        fechaHasta,
        query
      });

      const result = await db.query(query, [profesionalId, fechaDesde, fechaHasta]);
      
      console.log('Resultados obtenidos:', result.rows.length);
      return result.rows;
    } catch (error) {
      console.error('Error detallado en TurnoModel.obtenerTurnosProfesional:', {
        message: error.message,
        stack: error.stack,
        profesionalId,
        fechaDesde,
        fechaHasta
      });
      throw new Error(`Error al obtener turnos: ${error.message}`);
    }
  },

  crearTurno: async (turnoData) => {
    const { profesionalId, pacienteId, fecha, horaInicio, horaFin } = turnoData;
    
    try {
      // Primero verificamos que el horario esté disponible
      const conflicto = await db.query(`
        SELECT id_turno 
        FROM turno 
        WHERE id_profesional = $1 
          AND fecha = $2
          AND (
            (hora_inicio <= $3 AND hora_fin > $3)
            OR (hora_inicio < $4 AND hora_fin >= $4)
            OR (hora_inicio >= $3 AND hora_fin <= $4)
          )
      `, [profesionalId, fecha, horaInicio, horaFin]);

      if (conflicto.rows.length > 0) {
        throw new Error('El horario seleccionado no está disponible');
      }

      // Si no hay conflicto, creamos el turno
      const result = await db.query(`
        INSERT INTO turno (
          id_profesional, 
          id_paciente, 
          fecha, 
          hora_inicio, 
          hora_fin, 
          estado
        )
        VALUES ($1, $2, $3, $4, $5, 'programado')
        RETURNING *
      `, [profesionalId, pacienteId, fecha, horaInicio, horaFin]);

      return result.rows[0];
    } catch (error) {
      console.error('Error en TurnoModel.crearTurno:', error);
      throw error;
    }
  }
};

module.exports = TurnoModel;