const pool = require('../db');

const RespuestaSeguimientoModel = {
  // Crear una nueva respuesta del paciente
  async crear(data) {
    const {
      id_seguimiento,
      id_paciente,
      respuesta,
      archivos_urls = null,
      observaciones = null,
      sintomas_reportados = null,
      cumplimiento = true
    } = data;

    const query = `
      INSERT INTO respuesta_seguimiento 
        (id_seguimiento, id_paciente, respuesta, archivos_urls, observaciones, sintomas_reportados, cumplimiento)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const result = await pool.query(query, [
      id_seguimiento,
      id_paciente,
      respuesta,
      archivos_urls,
      observaciones,
      sintomas_reportados,
      cumplimiento
    ]);

    return result.rows[0];
  },

  // Obtener todas las respuestas de un seguimiento específico
  async obtenerPorSeguimiento(idSeguimiento) {
    const query = `
      SELECT 
        rs.*,
        u.nombre || ' ' || u.apellido as nombre_paciente,
        u.mail as email_paciente
      FROM respuesta_seguimiento rs
      JOIN usuario u ON u.id_usuario = rs.id_paciente
      WHERE rs.id_seguimiento = $1
      ORDER BY rs.fecha_respuesta DESC
    `;

    const result = await pool.query(query, [idSeguimiento]);
    return result.rows;
  },

  // Obtener todas las respuestas de un paciente
  async obtenerPorPaciente(idPaciente) {
    const query = `
      SELECT 
        rs.*,
        s.instrucciones,
        s.tipo_seguimiento,
        s.frecuencia_tipo,
        s.estado as estado_seguimiento,
        s.fecha_inicio,
        s.fecha_fin,
        up.nombre || ' ' || up.apellido as nombre_profesional,
        t.fecha as fecha_turno
      FROM respuesta_seguimiento rs
      JOIN seguimiento s ON s.id_seguimiento = rs.id_seguimiento
      JOIN turno t ON t.id_turno = s.id_turno
      LEFT JOIN profesional prof ON prof.id_profesional = s.id_profesional
      LEFT JOIN usuario up ON up.id_usuario = prof.id_profesional
      WHERE rs.id_paciente = $1
      ORDER BY rs.fecha_respuesta DESC
    `;

    const result = await pool.query(query, [idPaciente]);
    return result.rows;
  },

  // Obtener una respuesta específica por ID
  async obtenerPorId(idRespuesta) {
    const query = `
      SELECT 
        rs.*,
        s.instrucciones,
        s.tipo_seguimiento,
        u.nombre || ' ' || u.apellido as nombre_paciente
      FROM respuesta_seguimiento rs
      JOIN seguimiento s ON s.id_seguimiento = rs.id_seguimiento
      JOIN paciente p ON p.id_paciente = rs.id_paciente
      JOIN usuario u ON u.id_usuario = p.id_paciente
      WHERE rs.id_respuesta = $1
    `;

    const result = await pool.query(query, [idRespuesta]);
    return result.rows[0];
  },

  // Actualizar una respuesta
  async actualizar(idRespuesta, data) {
    const {
      respuesta,
      observaciones,
      sintomas_reportados,
      cumplimiento,
      archivos_urls
    } = data;

    const query = `
      UPDATE respuesta_seguimiento
      SET 
        respuesta = COALESCE($2, respuesta),
        observaciones = COALESCE($3, observaciones),
        sintomas_reportados = COALESCE($4, sintomas_reportados),
        cumplimiento = COALESCE($5, cumplimiento),
        archivos_urls = COALESCE($6, archivos_urls)
      WHERE id_respuesta = $1
      RETURNING *
    `;

    const result = await pool.query(query, [
      idRespuesta,
      respuesta,
      observaciones,
      sintomas_reportados,
      cumplimiento,
      archivos_urls
    ]);

    return result.rows[0];
  },

  // Eliminar una respuesta
  async eliminar(idRespuesta) {
    const query = 'DELETE FROM respuesta_seguimiento WHERE id_respuesta = $1 RETURNING *';
    const result = await pool.query(query, [idRespuesta]);
    return result.rows[0];
  },

  // Verificar si el paciente ya respondió un seguimiento específico
  async yaRespondio(idSeguimiento, idPaciente) {
    const query = `
      SELECT COUNT(*) as total
      FROM respuesta_seguimiento
      WHERE id_seguimiento = $1 AND id_paciente = $2
    `;

    const result = await pool.query(query, [idSeguimiento, idPaciente]);
    return parseInt(result.rows[0].total) > 0;
  },

  // Obtener estadísticas de respuestas para un seguimiento
  async obtenerEstadisticas(idSeguimiento) {
    const query = `
      SELECT 
        COUNT(*) as total_respuestas,
        COUNT(DISTINCT id_paciente) as pacientes_respondieron,
        AVG(CASE WHEN cumplimiento = true THEN 1 ELSE 0 END)::numeric(10,2) as tasa_cumplimiento,
        MIN(fecha_respuesta) as primera_respuesta,
        MAX(fecha_respuesta) as ultima_respuesta
      FROM respuesta_seguimiento
      WHERE id_seguimiento = $1
    `;

    const result = await pool.query(query, [idSeguimiento]);
    return result.rows[0];
  }
};

module.exports = RespuestaSeguimientoModel;
