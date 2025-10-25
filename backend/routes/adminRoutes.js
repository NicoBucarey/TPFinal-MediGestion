const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { checkRole } = require('../middleware/auth');

// Obtener estadísticas generales del dashboard
router.get('/estadisticas', checkRole(['admin']), adminController.getEstadisticasGenerales);

// Obtener reportes con filtros
router.get('/reportes', checkRole(['admin']), adminController.getReportes);

module.exports = router;
