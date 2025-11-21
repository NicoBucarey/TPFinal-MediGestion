const express = require('express');
const router = express.Router();
const { crearSucursal, listarSucursales, obtenerSucursal, actualizarSucursal, desactivarSucursal } = require('../controllers/sucursalController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de almacenamiento para imágenes de sucursales
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const dir = path.join(__dirname, '..', 'uploads', 'sucursales');
		fs.mkdirSync(dir, { recursive: true });
		cb(null, dir);
	},
	filename: (req, file, cb) => {
		const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname);
		cb(null, unique + ext);
	}
});

const fileFilter = (req, file, cb) => {
	if (/image\/(png|jpg|jpeg|webp)/.test(file.mimetype)) cb(null, true); else cb(new Error('Formato de imagen no soportado'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } }); // 2MB

// Wrapper para capturar errores de Multer y responder 400
const withUpload = (field) => (req, res, next) => {
	upload.single(field)(req, res, (err) => {
		if (err) {
			return res.status(400).json({ error: err.message || 'Error al subir imagen' });
		}
		next();
	});
};

// Todas protegidas por admin (se aplicará auth+admin en server.js al montar)
router.get('/', listarSucursales);
router.post('/', withUpload('imagen'), crearSucursal);
router.get('/:id', obtenerSucursal);
router.put('/:id', withUpload('imagen'), actualizarSucursal);
router.delete('/:id', desactivarSucursal);

module.exports = router;