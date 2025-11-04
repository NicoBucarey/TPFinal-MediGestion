const pool = require('../db');

const SeguimientoController = {
  // POST /api/seguimiento - Crear seguimiento post-consulta
  crearSeguimiento: async (req, res) => {
    const {
      turnoId,
      pacienteId,
      fechaInicio,
      frecuenciaTipo,
      intervaloDias,
      repeticiones,
      fechaFin,
      instrucciones,
      tipoSeguimiento
    } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.rol?.toLowerCase();

    if (!turnoId || !pacienteId || !fechaInicio) {
      return res.status(400).json({ message: 'turnoId, pacienteId y fechaInicio son requeridos' });
    }
    if (userRole !== 'profesional') {
      return res.status(403).json({ message: 'Solo profesionales pueden crear seguimientos' });
    }

    try {
      // Validar que el turno existe y pertenece al profesional
      const turnoRes = await pool.query(
        'SELECT id_turno, id_profesional, id_paciente FROM turno WHERE id_turno = $1',
        [turnoId]
      );
      if (turnoRes.rows.length === 0) {
        return res.status(404).json({ message: 'Turno no encontrado' });
      }
      if (turnoRes.rows[0].id_profesional !== userId) {
        return res.status(403).json({ message: 'No tiene permisos para crear seguimiento en este turno' });
      }
      if (turnoRes.rows[0].id_paciente !== Number(pacienteId)) {
        return res.status(400).json({ message: 'El paciente no coincide con el turno' });
      }

      const result = await pool.query(
        `INSERT INTO seguimiento (
            id_turno, id_paciente, id_profesional, fecha_inicio, instrucciones, 
            frecuencia_tipo, intervalo_dias, repeticiones, fecha_fin, tipo_seguimiento, estado
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          turnoId,
          pacienteId,
            userId,
            fechaInicio,
          instrucciones,
            frecuenciaTipo || 'unica',
            intervaloDias || null,
            repeticiones || null,
            fechaFin || null,
            tipoSeguimiento || 'texto',
            'pendiente'
        ]
      );

      res.status(201).json({
        message: 'Seguimiento creado correctamente',
        seguimiento: result.rows[0]
      });
    } catch (error) {
      console.error('Error crearSeguimiento:', error);
      res.status(500).json({ message: 'Error al crear seguimiento' });
    }
  },

  // GET /api/seguimiento/profesional/:id - Listar seguimientos del profesional
  obtenerSeguimientosProfesional: async (req, res) => {
    const { id } = req.params;
    const { estado } = req.query;
    const userId = req.user?.id;

    if (Number(id) !== userId) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    try {
      let query = `
        SELECT s.*, 
               u.nombre || ' ' || u.apellido as paciente_nombre,
            t.fecha as turno_fecha
        FROM seguimiento s
        JOIN usuario u ON u.id_usuario = s.id_paciente
        JOIN turno t ON t.id_turno = s.id_turno
        WHERE s.id_profesional = $1
      `;
      const params = [id];

      if (estado) {
        query += ` AND s.estado = $2`;
        params.push(estado);
      }

      query += ' ORDER BY s.fecha_inicio DESC';
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Error obtenerSeguimientosProfesional:', error);
      res.status(500).json({ message: 'Error al obtener seguimientos' });
    }
  },

  // GET /api/seguimiento/paciente/:id - Listar seguimientos del paciente
  obtenerSeguimientosPaciente: async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.rol?.toLowerCase();

    if (userRole !== 'paciente' || Number(id) !== userId) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    try {
      const query = `
        SELECT 
          s.*,
          up.nombre || ' ' || up.apellido as nombre_profesional,
          t.fecha as turno_fecha,
          EXISTS(
            SELECT 1 FROM respuesta_seguimiento rs 
            WHERE rs.id_seguimiento = s.id_seguimiento 
            AND rs.id_paciente = s.id_paciente
          ) as tiene_respuestas
        FROM seguimiento s
        JOIN turno t ON t.id_turno = s.id_turno
        LEFT JOIN profesional prof ON prof.id_profesional = s.id_profesional
        LEFT JOIN usuario up ON up.id_usuario = prof.id_profesional
        WHERE s.id_paciente = $1
        ORDER BY 
          CASE s.estado
            WHEN 'pendiente' THEN 1
            WHEN 'en_curso' THEN 2
            WHEN 'vencido' THEN 3
            WHEN 'completado' THEN 4
          END,
          s.fecha_inicio DESC
      `;

      const result = await pool.query(query, [id]);
      res.json(result.rows);
    } catch (error) {
      console.error('Error obtenerSeguimientosPaciente:', error);
      res.status(500).json({ message: 'Error al obtener seguimientos' });
    }
  },

  // GET /api/seguimiento/:id - Detalle de seguimiento
  obtenerSeguimientoDetalle: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query(
        `SELECT s.*, 
                up.nombre || ' ' || up.apellido as paciente_nombre,
      uf.nombre || ' ' || uf.apellido as profesional_nombre,
      t.fecha as turno_fecha
         FROM seguimiento s
         JOIN usuario up ON up.id_usuario = s.id_paciente
         JOIN turno t ON t.id_turno = s.id_turno
     JOIN usuario uf ON uf.id_usuario = s.id_profesional
         WHERE s.id_seguimiento = $1`,
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Seguimiento no encontrado' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error obtenerSeguimientoDetalle:', error);
      res.status(500).json({ message: 'Error al obtener detalle' });
    }
  },

  // PATCH /api/seguimiento/:id/estado - Actualizar estado
  actualizarEstado: async (req, res) => {
    const { id } = req.params;
    const { estado, respuesta } = req.body;
    
    try {
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (estado) {
          updates.push(`estado = $${paramCount++}`);
          values.push(estado);
        }
        if (respuesta !== undefined) {
          updates.push(`respuesta = $${paramCount++}, fecha_respuesta = CURRENT_TIMESTAMP`);
          values.push(respuesta);
        }

        if (updates.length === 0) {
          return res.status(400).json({ message: 'No hay datos para actualizar' });
        }

        values.push(id);
        const query = `UPDATE seguimiento SET ${updates.join(', ')} WHERE id_seguimiento = $${paramCount} RETURNING *`;
        const result = await pool.query(query, values);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Seguimiento no encontrado' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error actualizarEstado:', error);
      res.status(500).json({ message: 'Error al actualizar estado' });
    }
  },

  // GET /api/seguimiento/turno/:turnoId - Ver seguimientos de un turno
  obtenerSeguimientosTurno: async (req, res) => {
    const { turnoId } = req.params;
    try {
      const result = await pool.query(
        `SELECT s.*, 
                  u.nombre || ' ' || u.apellido as paciente_nombre
         FROM seguimiento s
         JOIN usuario u ON u.id_usuario = s.id_paciente
         WHERE s.id_turno = $1
           ORDER BY s.fecha_inicio DESC`,
        [turnoId]
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Error obtenerSeguimientosTurno:', error);
      res.status(500).json({ message: 'Error al obtener seguimientos del turno' });
    }
  }
};

// Estadísticas de cumplimiento por profesional
SeguimientoController.obtenerEstadisticasProfesional = async (req, res) => {
  const { id } = req.params; // profesional id
  const { desde, hasta } = req.query;
  const userId = req.user?.id;

  if (Number(id) !== userId) {
    return res.status(403).json({ message: 'No autorizado' });
  }

  try {
    const params = [id];
    let where = 's.id_profesional = $1';
    if (desde) {
      params.push(desde);
      where += ` AND s.fecha_inicio >= $${params.length}`;
    }
    if (hasta) {
      params.push(hasta);
      where += ` AND s.fecha_inicio <= $${params.length}`;
    }

    const resumenQuery = `
      SELECT 
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE s.estado = 'pendiente')::int AS pendiente,
        COUNT(*) FILTER (WHERE s.estado = 'en_curso')::int AS en_curso,
        COUNT(*) FILTER (WHERE s.estado = 'completado')::int AS completado,
        COUNT(*) FILTER (WHERE s.estado = 'vencido')::int AS vencido
      FROM seguimiento s
      WHERE ${where}
    `;

    const serieQuery = `
      WITH fechas AS (
        SELECT generate_series(
          COALESCE($2::date, (NOW() - INTERVAL '29 day')::date),
          COALESCE($3::date, NOW()::date),
          INTERVAL '1 day'
        )::date AS fecha
      )
      SELECT f.fecha,
        (SELECT COUNT(*) FROM seguimiento s WHERE ${where} AND s.estado = 'completado' AND s.fecha_respuesta::date = f.fecha)::int AS completado,
        (SELECT COUNT(*) FROM seguimiento s WHERE ${where} AND s.estado = 'vencido' AND s.fecha_inicio::date = f.fecha)::int AS vencido
      FROM fechas f
      ORDER BY f.fecha;
    `;

    // Ajustar params para serie: where usa $1, $2, $3; la CTE pasa desde/hasta como $2/$3
    const resumen = await pool.query(resumenQuery, params);
    const serieParams = [id, desde || null, hasta || null];
    const serie = await pool.query(serieQuery, serieParams);

    res.json({ resumen: resumen.rows[0], serie: serie.rows });
  } catch (error) {
    console.error('Error obtenerEstadisticasProfesional:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
};

module.exports = SeguimientoController;
