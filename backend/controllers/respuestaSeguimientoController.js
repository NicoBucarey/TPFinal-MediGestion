const RespuestaSeguimientoModel = require('../model/respuestaSeguimientoModel');
const pool = require('../db');

const RespuestaSeguimientoController = {
  // POST /api/seguimientos/:id/responder-personalizada - Paciente responde con preguntas personalizadas
  responderSeguimientoPersonalizada: async (req, res) => {
    const { id } = req.params; // id_seguimiento
    const userId = req.user?.id;
    const userRole = req.user?.rol?.toLowerCase();

    if (userRole !== 'paciente') {
      return res.status(403).json({ message: 'Solo pacientes pueden responder seguimientos' });
    }

    const { respuestas, observaciones_generales } = req.body;

    if (!Array.isArray(respuestas) || respuestas.length === 0) {
      return res.status(400).json({ message: 'Debe proporcionar al menos una respuesta' });
    }

    try {
      // Verificar que el seguimiento existe y pertenece al paciente
      const seguimientoRes = await pool.query(
        'SELECT * FROM seguimiento WHERE id_seguimiento = $1 AND id_paciente = $2',
        [id, userId]
      );

      if (seguimientoRes.rows.length === 0) {
        return res.status(404).json({ message: 'Seguimiento no encontrado o no tiene acceso' });
      }

      const seguimiento = seguimientoRes.rows[0];

      // Verificar si el seguimiento no está ya completado
      if (seguimiento.estado === 'completado') {
        return res.status(400).json({ message: 'Este seguimiento ya fue completado' });
      }

      // Crear respuesta principal en respuesta_seguimiento
      const nuevaRespuestaRes = await pool.query(
        `INSERT INTO respuesta_seguimiento 
          (id_seguimiento, id_paciente, respuesta, observaciones)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [
          id,
          userId,
          'Respuesta con preguntas personalizadas', // Texto genérico
          observaciones_generales || null
        ]
      );

      const idRespuesta = nuevaRespuestaRes.rows[0].id_respuesta;

      // Insertar respuestas a preguntas personalizadas
      for (const respuesta of respuestas) {
        const {
          id_pregunta,
          respuesta_texto,
          respuesta_numerica,
          respuesta_booleana,
          respuesta_opcion
        } = respuesta;

        await pool.query(
          `INSERT INTO respuesta_pregunta_seguimiento 
            (id_pregunta, id_respuesta_seguimiento, id_paciente, respuesta_texto, respuesta_numerica, respuesta_booleana, respuesta_opcion)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            id_pregunta,
            idRespuesta,
            userId,
            respuesta_texto,
            respuesta_numerica,
            respuesta_booleana,
            respuesta_opcion
          ]
        );
      }

      // Actualizar estado del seguimiento a 'en_curso' si estaba pendiente
      if (seguimiento.estado === 'pendiente') {
        await pool.query(
          'UPDATE seguimiento SET estado = $1 WHERE id_seguimiento = $2',
          ['en_curso', id]
        );
      }

      res.status(201).json({
        message: 'Respuestas registradas exitosamente',
        respuesta: nuevaRespuestaRes.rows[0],
        total_respuestas: respuestas.length
      });
    } catch (error) {
      console.error('Error al responder seguimiento personalizada:', error);
      res.status(500).json({ message: 'Error al registrar las respuestas: ' + error.message });
    }
  },

  // POST /api/seguimientos/:id/responder - Paciente responde a un seguimiento
  responderSeguimiento: async (req, res) => {
    const { id } = req.params; // id_seguimiento
    const userId = req.user?.id;
    const userRole = req.user?.rol?.toLowerCase();

    if (userRole !== 'paciente') {
      return res.status(403).json({ message: 'Solo pacientes pueden responder seguimientos' });
    }

    const {
      respuesta,
      observaciones,
      sintomas_reportados,
      cumplimiento,
      archivos_urls
    } = req.body;

    if (!respuesta || respuesta.trim() === '') {
      return res.status(400).json({ message: 'La respuesta es requerida' });
    }

    try {
      // Verificar que el seguimiento existe y pertenece al paciente
      const seguimientoRes = await pool.query(
        'SELECT * FROM seguimiento WHERE id_seguimiento = $1 AND id_paciente = $2',
        [id, userId]
      );

      if (seguimientoRes.rows.length === 0) {
        return res.status(404).json({ message: 'Seguimiento no encontrado o no tiene acceso' });
      }

      const seguimiento = seguimientoRes.rows[0];

      // Verificar si el seguimiento no está vencido o ya completado
      if (seguimiento.estado === 'completado') {
        return res.status(400).json({ message: 'Este seguimiento ya fue completado' });
      }

      // Crear la respuesta
      const nuevaRespuesta = await RespuestaSeguimientoModel.crear({
        id_seguimiento: id,
        id_paciente: userId,
        respuesta: respuesta.trim(),
        observaciones: observaciones?.trim() || null,
        sintomas_reportados: sintomas_reportados?.trim() || null,
        cumplimiento: cumplimiento !== undefined ? cumplimiento : true,
        archivos_urls: archivos_urls || null
      });

      // Actualizar estado del seguimiento a 'en_curso' si estaba pendiente
      if (seguimiento.estado === 'pendiente') {
        await pool.query(
          'UPDATE seguimiento SET estado = $1 WHERE id_seguimiento = $2',
          ['en_curso', id]
        );
      }

      res.status(201).json({
        message: 'Respuesta registrada exitosamente',
        respuesta: nuevaRespuesta
      });
    } catch (error) {
      console.error('Error al responder seguimiento:', error);
      res.status(500).json({ message: 'Error al registrar la respuesta' });
    }
  },

  // GET /api/seguimientos/:id/respuestas - Obtener respuestas de un seguimiento (profesional)
  obtenerRespuestasSeguimiento: async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.rol?.toLowerCase();

    try {
      // Verificar permisos
      if (userRole === 'profesional') {
        // Verificar que el seguimiento pertenece al profesional
        const seguimientoRes = await pool.query(
          'SELECT * FROM seguimiento WHERE id_seguimiento = $1 AND id_profesional = $2',
          [id, userId]
        );

        if (seguimientoRes.rows.length === 0) {
          return res.status(403).json({ message: 'No tiene acceso a este seguimiento' });
        }
      } else if (userRole === 'paciente') {
        // Verificar que el seguimiento pertenece al paciente
        const seguimientoRes = await pool.query(
          'SELECT * FROM seguimiento WHERE id_seguimiento = $1 AND id_paciente = $2',
          [id, userId]
        );

        if (seguimientoRes.rows.length === 0) {
          return res.status(403).json({ message: 'No tiene acceso a este seguimiento' });
        }
      } else {
        return res.status(403).json({ message: 'No tiene permisos para ver estas respuestas' });
      }

      const respuestas = await RespuestaSeguimientoModel.obtenerPorSeguimiento(id);

      res.json(respuestas);
    } catch (error) {
      console.error('Error al obtener respuestas:', error);
      res.status(500).json({ message: 'Error al obtener las respuestas' });
    }
  },

  // GET /api/paciente/respuestas - Obtener todas las respuestas del paciente
  obtenerMisRespuestas: async (req, res) => {
    const userId = req.user?.id;
    const userRole = req.user?.rol?.toLowerCase();

    if (userRole !== 'paciente') {
      return res.status(403).json({ message: 'Solo pacientes pueden acceder a esta información' });
    }

    try {
      const respuestas = await RespuestaSeguimientoModel.obtenerPorPaciente(userId);
      res.json(respuestas);
    } catch (error) {
      console.error('Error al obtener respuestas del paciente:', error);
      res.status(500).json({ message: 'Error al obtener las respuestas' });
    }
  },

  // PUT /api/respuestas/:id - Actualizar una respuesta (paciente)
  actualizarRespuesta: async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.rol?.toLowerCase();

    if (userRole !== 'paciente') {
      return res.status(403).json({ message: 'Solo pacientes pueden actualizar respuestas' });
    }

    try {
      // Verificar que la respuesta pertenece al paciente
      const respuestaExistente = await RespuestaSeguimientoModel.obtenerPorId(id);

      if (!respuestaExistente) {
        return res.status(404).json({ message: 'Respuesta no encontrada' });
      }

      if (respuestaExistente.id_paciente !== userId) {
        return res.status(403).json({ message: 'No tiene permisos para actualizar esta respuesta' });
      }

      const respuestaActualizada = await RespuestaSeguimientoModel.actualizar(id, req.body);

      res.json({
        message: 'Respuesta actualizada exitosamente',
        respuesta: respuestaActualizada
      });
    } catch (error) {
      console.error('Error al actualizar respuesta:', error);
      res.status(500).json({ message: 'Error al actualizar la respuesta' });
    }
  },

  // DELETE /api/respuestas/:id - Eliminar una respuesta (paciente)
  eliminarRespuesta: async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.rol?.toLowerCase();

    if (userRole !== 'paciente') {
      return res.status(403).json({ message: 'Solo pacientes pueden eliminar respuestas' });
    }

    try {
      // Verificar que la respuesta pertenece al paciente
      const respuestaExistente = await RespuestaSeguimientoModel.obtenerPorId(id);

      if (!respuestaExistente) {
        return res.status(404).json({ message: 'Respuesta no encontrada' });
      }

      if (respuestaExistente.id_paciente !== userId) {
        return res.status(403).json({ message: 'No tiene permisos para eliminar esta respuesta' });
      }

      await RespuestaSeguimientoModel.eliminar(id);

      res.json({ message: 'Respuesta eliminada exitosamente' });
    } catch (error) {
      console.error('Error al eliminar respuesta:', error);
      res.status(500).json({ message: 'Error al eliminar la respuesta' });
    }
  },

  // GET /api/seguimientos/:id/estadisticas - Obtener estadísticas de respuestas (profesional)
  obtenerEstadisticas: async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.rol?.toLowerCase();

    if (userRole !== 'profesional') {
      return res.status(403).json({ message: 'Solo profesionales pueden ver estadísticas' });
    }

    try {
      // Verificar que el seguimiento pertenece al profesional
      const seguimientoRes = await pool.query(
        'SELECT * FROM seguimiento WHERE id_seguimiento = $1 AND id_profesional = $2',
        [id, userId]
      );

      if (seguimientoRes.rows.length === 0) {
        return res.status(403).json({ message: 'No tiene acceso a este seguimiento' });
      }

      const estadisticas = await RespuestaSeguimientoModel.obtenerEstadisticas(id);

      res.json(estadisticas);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({ message: 'Error al obtener estadísticas' });
    }
  }
};

module.exports = RespuestaSeguimientoController;
