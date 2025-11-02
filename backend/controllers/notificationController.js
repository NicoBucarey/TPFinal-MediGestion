const pool = require('../db');

const NotificationController = {
  // GET /api/notificaciones?soloNoLeidas=true
  listar: async (req, res) => {
    const userId = req.user?.id;
    const soloNoLeidas = (req.query.soloNoLeidas || 'false') === 'true';

    try {
      let query = `SELECT * FROM notificacion WHERE id_usuario = $1`;
      const params = [userId];
      if (soloNoLeidas) {
        query += ' AND leida = false';
      }
      query += ' ORDER BY fecha_creacion DESC LIMIT 100';
      const { rows } = await pool.query(query, params);
      res.json(rows);
    } catch (err) {
      console.error('Error listando notificaciones', err);
      res.status(500).json({ message: 'Error al listar notificaciones' });
    }
  },

  // PATCH /api/notificaciones/:id/leida
  marcarLeida: async (req, res) => {
    const userId = req.user?.id;
    const { id } = req.params;
    try {
      const { rows } = await pool.query(
        `UPDATE notificacion SET leida = true WHERE id_notificacion = $1 AND id_usuario = $2 RETURNING *`,
        [id, userId]
      );
      if (rows.length === 0) return res.status(404).json({ message: 'Notificación no encontrada' });
      res.json(rows[0]);
    } catch (err) {
      console.error('Error marcando notificación', err);
      res.status(500).json({ message: 'Error al actualizar notificación' });
    }
  }
};

module.exports = NotificationController;
