const express = require('express');
const router = express.Router();
const { crearSucursal, listarSucursales, obtenerSucursal, actualizarSucursal, desactivarSucursal } = require('../controllers/sucursalController');

// Todas protegidas por admin (se aplicará auth+admin en server.js al montar)
router.get('/', listarSucursales);
router.post('/', crearSucursal);
router.get('/:id', obtenerSucursal);
router.put('/:id', actualizarSucursal);
router.delete('/:id', desactivarSucursal);

module.exports = router;