const express = require('express');
const router = express.Router();
const perfilController = require('../controllers/perfilController');

// Rutas de perfil (protegidas por autenticación en server.js)
// Obtener perfil del usuario autenticado
router.get('/', perfilController.obtenerPerfil);

// Actualizar perfil del usuario autenticado
router.put('/', perfilController.actualizarPerfil);

// Actualizar contraseña del usuario autenticado
router.put('/password', perfilController.actualizarPassword);

module.exports = router;
