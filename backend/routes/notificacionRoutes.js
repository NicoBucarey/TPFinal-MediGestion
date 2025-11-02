const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');

router.get('/', NotificationController.listar);
router.patch('/:id/leida', NotificationController.marcarLeida);

module.exports = router;
