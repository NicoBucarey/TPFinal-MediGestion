const pool = require('../db');
const whatsappService = require('../services/whatsappService');

const SeguimientoController = {
  // POST /api/seguimiento - Crear seguimiento post-consulta
  // GET /api/seguimiento/:id/preguntas - Obtener preguntas personalizadas de un seguimiento
  obtenerPreguntasSeguimiento: async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.rol?.toLowerCase();

    try {
      // Verificar que el seguimiento existe y el usuario tiene acceso
      let seguimiento;
      if (userRole === 'paciente') {
        const result = await pool.query(
          'SELECT * FROM seguimiento WHERE id_seguimiento = $1 AND id_paciente = $2',
          [id, userId]
        );
        seguimiento = result.rows[0];
      } else if (userRole === 'profesional') {
        const result = await pool.query(
          'SELECT * FROM seguimiento WHERE id_seguimiento = $1 AND id_profesional = $2',
          [id, userId]
        );
        seguimiento = result.rows[0];
      } else {
        return res.status(403).json({ message: 'No tiene permisos para acceder a este seguimiento' });
      }

      if (!seguimiento) {
        return res.status(404).json({ message: 'Seguimiento no encontrado o no tiene acceso' });
      }

      // Obtener preguntas personalizadas
      const preguntasResult = await pool.query(
        `SELECT 
          id_pregunta,
          texto_pregunta,
          tipo_respuesta,
          opciones,
          obligatoria,
          orden_pregunta
         FROM pregunta_seguimiento
         WHERE id_seguimiento = $1
         ORDER BY orden_pregunta ASC, id_pregunta ASC`,
        [id]
      );

      res.json(preguntasResult.rows);
    } catch (error) {
      console.error('Error obtenerPreguntasSeguimiento:', error);
      res.status(500).json({ message: 'Error al obtener preguntas del seguimiento' });
    }
  },

  crearSeguimiento: async (req, res) => {
    const {
      turnoId,
      pacienteId,
      fechaInicio,
      frecuenciaTipo,
      intervaloDias,
      repeticiones,
      fechaFin,
      preguntasPersonalizadas
    } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.rol?.toLowerCase();

    console.log('=== CREAR SEGUIMIENTO ===');
    console.log('Datos recibidos:', { turnoId, pacienteId, fechaInicio, frecuenciaTipo, preguntasPersonalizadas: preguntasPersonalizadas?.length });
    console.log('Usuario:', { userId, userRole });

    if (!pacienteId || !fechaInicio) {
      return res.status(400).json({ message: 'pacienteId y fechaInicio son requeridos' });
    }
    if (userRole !== 'profesional') {
      return res.status(403).json({ message: 'Solo profesionales pueden crear seguimientos' });
    }

    try {
      console.log('1. Validando turno...');
      // Si hay turnoId, validar que el turno existe y pertenece al profesional
      if (turnoId) {
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
      }

      console.log('2. Validando paciente...');
      // Validar que el paciente existe en ambas tablas
      const pacienteRes = await pool.query(
        `SELECT u.id_usuario, p.id_paciente 
         FROM usuario u
         JOIN paciente p ON p.id_paciente = u.id_usuario
         JOIN rol r ON r.id_rol = u.id_rol
         WHERE u.id_usuario = $1 AND r.nombre = 'paciente'`,
        [pacienteId]
      );
      if (pacienteRes.rows.length === 0) {
        return res.status(404).json({ message: 'Paciente no encontrado o no válido' });
      }
      console.log('Paciente validado:', pacienteRes.rows[0]);

      console.log('3. Creando seguimiento...');
      // Crear seguimiento
      const result = await pool.query(
        `INSERT INTO seguimiento (
            id_turno, id_paciente, id_profesional, fecha_inicio, 
            frecuencia_tipo, intervalo_dias, repeticiones, fecha_fin, estado
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`,
        [
          turnoId || null,
          pacienteId,
          userId,
          fechaInicio,
          frecuenciaTipo || 'unica',
          intervaloDias || null,
          repeticiones || null,
          fechaFin || null,
          'pendiente'
        ]
      );
      console.log('Seguimiento creado:', result.rows[0]);

      const seguimientoId = result.rows[0].id_seguimiento;

      console.log('4. Creando preguntas personalizadas...');
      // Crear preguntas personalizadas si existen
      if (preguntasPersonalizadas && Array.isArray(preguntasPersonalizadas) && preguntasPersonalizadas.length > 0) {
        console.log(`Creando ${preguntasPersonalizadas.length} preguntas...`);
        for (let i = 0; i < preguntasPersonalizadas.length; i++) {
          const pregunta = preguntasPersonalizadas[i];
          console.log(`Creando pregunta ${i + 1}:`, pregunta);
          await pool.query(
            `INSERT INTO pregunta_seguimiento (
              id_seguimiento, texto_pregunta, tipo_respuesta, opciones, obligatoria, orden_pregunta
            ) VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              seguimientoId,
              pregunta.texto,
              pregunta.tipoRespuesta,
              pregunta.opciones || null,
              pregunta.obligatoria !== false, // Por defecto true
              i + 1 // Orden basado en el índice
            ]
          );
        }
      }

      console.log('5. Seguimiento creado exitosamente');

      // Obtener datos completos del paciente y profesional para WhatsApp
      try {
        console.log('6. Obteniendo datos para WhatsApp...');
        const datosWhatsappRes = await pool.query(`
          SELECT 
            up.nombre as paciente_nombre,
            up.apellido as paciente_apellido,
            up.telefono as paciente_telefono,
            upr.nombre as profesional_nombre,
            upr.apellido as profesional_apellido
          FROM usuario up
          JOIN usuario upr ON upr.id_usuario = $2
          WHERE up.id_usuario = $1
        `, [pacienteId, userId]);

        if (datosWhatsappRes.rows.length > 0) {
          const datos = datosWhatsappRes.rows[0];
          const pacienteData = {
            nombre: `${datos.paciente_nombre} ${datos.paciente_apellido}`
          };
          const profesionalData = {
            nombre: datos.profesional_nombre,
            apellido: datos.profesional_apellido
          };

          // Enviar WhatsApp (no bloqueante)
          if (datos.paciente_telefono) {
            console.log('7. Enviando WhatsApp...');
            const mensaje = whatsappService.generarMensajeSeguimiento(
              result.rows[0], 
              pacienteData, 
              profesionalData
            );
            
            whatsappService.enviarMensaje(datos.paciente_telefono, mensaje)
              .then((resultadoWhatsapp) => {
                if (resultadoWhatsapp.success) {
                  console.log('✅ WhatsApp enviado correctamente');
                } else {
                  console.warn('⚠️ No se pudo enviar WhatsApp:', resultadoWhatsapp.error);
                }
              })
              .catch((err) => {
                console.error('❌ Error al enviar WhatsApp (no crítico):', err.message);
              });
          } else {
            console.warn('⚠️ Paciente sin teléfono, no se envía WhatsApp');
          }
        }
      } catch (whatsappError) {
        console.error('Error al enviar WhatsApp (no crítico):', whatsappError.message);
      }

      res.status(201).json({
        message: 'Seguimiento creado correctamente',
        seguimiento: result.rows[0]
      });
    } catch (error) {
      console.error('ERROR CREAR SEGUIMIENTO:', error);
      console.error('Error message:', error.message);
      console.error('Error detail:', error.detail);
      res.status(500).json({ message: 'Error al crear seguimiento: ' + error.message });
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
        LEFT JOIN turno t ON t.id_turno = s.id_turno
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
        LEFT JOIN turno t ON t.id_turno = s.id_turno
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
