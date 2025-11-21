const db = require('../db');

const TurnoModel = {
  // Obtener detalles de un turno específico
  obtenerPorId: async (id) => {
    try {
      const query = `
        SELECT 
          t.id_turno,
          t.fecha,
          t.hora_inicio,
          t.hora_fin,
          t.estado,
          t.tipo,
          t.link_reunion,
          t.plataforma,
          t.id_paciente,
          t.id_profesional,
          p.id_paciente,
          up.nombre as paciente_nombre,
          up.apellido as paciente_apellido,
          up.email as paciente_email,
          up.telefono as paciente_telefono,
          prof.id_profesional,
          upr.nombre as profesional_nombre,
          upr.apellido as profesional_apellido,
          esp.nombre_especialidad
        FROM turno t
        LEFT JOIN paciente p ON t.id_paciente = p.id_paciente
        LEFT JOIN usuario up ON p.id_paciente = up.id_usuario
        LEFT JOIN profesional prof ON t.id_profesional = prof.id_profesional
        LEFT JOIN usuario upr ON prof.id_profesional = upr.id_usuario
        LEFT JOIN especialidad esp ON prof.id_especialidad = esp.id_especialidad
        WHERE t.id_turno = $1
      `;

      const result = await db.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error en TurnoModel.obtenerPorId:', error);
      throw error;
    }
  },

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
          u.nombre as paciente_nombre,
          u.apellido as paciente_apellido
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

  obtenerTurnosPaciente: async (pacienteId, fechaDesde, fechaHasta) => {
    try {
      const query = `
        SELECT 
          t.id_turno,
          t.fecha,
          t.hora_inicio,
          t.hora_fin,
          t.estado,
          t.motivo_consulta,
          prof.id_profesional,
          u.nombre as profesional_nombre,
          u.apellido as profesional_apellido
        FROM turno t
        JOIN profesional prof ON t.id_profesional = prof.id_profesional
        JOIN usuario u ON prof.id_profesional = u.id_usuario
        WHERE t.id_paciente = $1
          AND t.fecha BETWEEN $2 AND $3
        ORDER BY t.fecha ASC, t.hora_inicio ASC
      `;
      const result = await db.query(query, [pacienteId, fechaDesde, fechaHasta]);
      return result.rows;
    } catch (error) {
      console.error('Error en TurnoModel.obtenerTurnosPaciente:', error);
      throw error;
    }
  },

  crearTurno: async (turnoData) => {
    const { 
      profesionalId, 
      pacienteId, 
      fecha, 
      horaInicio, 
      horaFin, 
      tipo = 'presencial',
      linkReunion = null,
      plataforma = null 
    } = turnoData;
    
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
          estado,
          tipo,
          link_reunion,
          plataforma
        )
        VALUES ($1, $2, $3, $4, $5, 'pendiente', $6, $7, $8)
        RETURNING *
      `, [profesionalId, pacienteId, fecha, horaInicio, horaFin, tipo, linkReunion, plataforma]);

      return result.rows[0];
    } catch (error) {
      console.error('Error en TurnoModel.crearTurno:', error);
      throw error;
    }
  }
};

module.exports = TurnoModel;