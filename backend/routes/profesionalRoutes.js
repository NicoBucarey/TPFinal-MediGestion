const express = require('express');
const router = express.Router();
const { checkRole } = require('../middleware/auth');
const pool = require('../db');

// Obtener lista de profesionales
router.get('/', checkRole(['secretario', 'paciente']), async (req, res) => {
  try {
    console.log('==========================================');
    console.log('Accediendo a la ruta de profesionales');
    console.log('Usuario:', req.user);
    console.log('Headers:', req.headers);
    console.log('==========================================');
    const query = `
      SELECT 
        u.id_usuario,
        u.nombre,
        u.apellido,
        p.profesion,
        p.especialidad
      FROM usuario u
      INNER JOIN profesional p ON u.id_usuario = p.id_profesional
      INNER JOIN rol r ON u.id_rol = r.id_rol
      WHERE r.nombre = 'profesional'
      ORDER BY u.apellido, u.nombre
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener profesionales:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;