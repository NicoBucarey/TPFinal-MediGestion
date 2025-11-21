const pool = require('../db');

const SecretarioController = {
  // Obtener estadísticas para el dashboard del secretario
  obtenerEstadisticas: async (req, res) => {
    try {
      const hoy = new Date().toISOString().split('T')[0];
      const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      
      // Turnos de hoy
      const turnosHoyQuery = `
        SELECT COUNT(*) as total 
        FROM turno 
        WHERE fecha = $1 AND estado != 'cancelado'
      `;
      
      // Turnos del mes
      const turnosMesQuery = `
        SELECT COUNT(*) as total 
        FROM turno 
        WHERE fecha >= $1 AND estado != 'cancelado'
      `;
      
      // Pacientes atendidos (turnos completados del mes)
      const pacientesAtendidosQuery = `
        SELECT COUNT(DISTINCT id_paciente) as total 
        FROM turno 
        WHERE fecha >= $1 AND estado = 'completado'
      `;
      
      // Turnos pendientes
      const turnosPendientesQuery = `
        SELECT COUNT(*) as total 
        FROM turno 
        WHERE estado = 'pendiente' AND fecha >= $1
      `;
      
      const [turnosHoy, turnosMes, pacientesAtendidos, turnosPendientes] = await Promise.all([
        pool.query(turnosHoyQuery, [hoy]),
        pool.query(turnosMesQuery, [inicioMes]),
        pool.query(pacientesAtendidosQuery, [inicioMes]),
        pool.query(turnosPendientesQuery, [hoy])
      ]);
      
      res.json({
        turnosHoy: parseInt(turnosHoy.rows[0].total) || 0,
        turnosMes: parseInt(turnosMes.rows[0].total) || 0,
        pacientesAtendidos: parseInt(pacientesAtendidos.rows[0].total) || 0,
        turnosPendientes: parseInt(turnosPendientes.rows[0].total) || 0
      });
    } catch (error) {
      console.error('Error en SecretarioController.obtenerEstadisticas:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  },

  // Obtener turnos próximos para el dashboard
  obtenerTurnosProximos: async (req, res) => {
    try {
      const ahora = new Date();
      const hoy = ahora.toISOString().split('T')[0];
      const horaActual = ahora.toTimeString().split(' ')[0];
      
      const query = `
        SELECT 
          t.id_turno,
          t.fecha,
          t.hora_inicio,
          t.hora_fin,
          t.estado,
          up.nombre as paciente_nombre,
          up.apellido as paciente_apellido,
          upr.nombre as profesional_nombre,
          upr.apellido as profesional_apellido
        FROM turno t
        LEFT JOIN usuario up ON t.id_paciente = up.id_usuario
        LEFT JOIN usuario upr ON t.id_profesional = upr.id_usuario
        WHERE t.estado IN ('pendiente', 'confirmado')
        AND t.fecha = $1 
        AND t.hora_inicio > $2
        ORDER BY t.hora_inicio ASC
        LIMIT 10
      `;
      
      const result = await pool.query(query, [hoy, horaActual]);
      res.json(result.rows);
    } catch (error) {
      console.error('Error en SecretarioController.obtenerTurnosProximos:', error);
      res.status(500).json({ error: 'Error al obtener turnos próximos' });
    }
  }
};

module.exports = SecretarioController;