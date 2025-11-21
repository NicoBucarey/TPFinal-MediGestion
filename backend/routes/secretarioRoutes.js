const express = require('express');
const router = express.Router();
const SecretarioController = require('../controllers/secretarioController');
const { checkRole } = require('../middleware/auth');

// Obtener estadísticas para el dashboard
router.get('/estadisticas', checkRole(['secretario']), SecretarioController.obtenerEstadisticas);

// Obtener turnos próximos
router.get('/turnos/proximos', checkRole(['secretario']), SecretarioController.obtenerTurnosProximos);

module.exports = router;