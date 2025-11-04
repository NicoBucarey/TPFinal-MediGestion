const express = require('express');
const router = express.Router();
const { checkRole } = require('../middleware/auth');
const RespuestaSeguimientoController = require('../controllers/respuestaSeguimientoController');

// Paciente responde a un seguimiento
router.post(
  '/seguimientos/:id/responder',
  checkRole(['paciente']),
  RespuestaSeguimientoController.responderSeguimiento
);

// Obtener respuestas de un seguimiento (profesional o paciente dueño)
router.get(
  '/seguimientos/:id/respuestas',
  checkRole(['profesional', 'paciente']),
  RespuestaSeguimientoController.obtenerRespuestasSeguimiento
);

// Obtener todas las respuestas del paciente
router.get(
  '/paciente/respuestas',
  checkRole(['paciente']),
  RespuestaSeguimientoController.obtenerMisRespuestas
);

// Actualizar una respuesta
router.put(
  '/respuestas/:id',
  checkRole(['paciente']),
  RespuestaSeguimientoController.actualizarRespuesta
);

// Eliminar una respuesta
router.delete(
  '/respuestas/:id',
  checkRole(['paciente']),
  RespuestaSeguimientoController.eliminarRespuesta
);

// Obtener estadísticas de respuestas de un seguimiento (profesional)
router.get(
  '/seguimientos/:id/estadisticas',
  checkRole(['profesional']),
  RespuestaSeguimientoController.obtenerEstadisticas
);

module.exports = router;
