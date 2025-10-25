const pool = require('../db');

const adminController = {
  // Obtener estadísticas generales del dashboard
  async getEstadisticasGenerales(req, res) {
    try {
      // Total de usuarios por rol
      const usuariosQuery = await pool.query(`
        SELECT r.nombre as rol, COUNT(u.id_usuario) as total
        FROM usuario u
        JOIN rol r ON u.id_rol = r.id_rol
        GROUP BY r.nombre
      `);

      // Total de turnos del mes actual
      const turnosMesQuery = await pool.query(`
        SELECT COUNT(*) as total
        FROM turno
        WHERE EXTRACT(MONTH FROM fecha) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM fecha) = EXTRACT(YEAR FROM CURRENT_DATE)
      `);

      // Profesionales activos (que tienen turnos este mes)
      const profesionalesActivosQuery = await pool.query(`
        SELECT COUNT(DISTINCT id_profesional) as total
        FROM turno
        WHERE EXTRACT(MONTH FROM fecha) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM fecha) = EXTRACT(YEAR FROM CURRENT_DATE)
      `);

      // Total de pacientes
      const pacientesQuery = await pool.query(`
        SELECT COUNT(*) as total
        FROM paciente
      `);

      const usuarios = usuariosQuery.rows;
      const totalUsuarios = usuarios.reduce((sum, item) => sum + parseInt(item.total), 0);
      const profesionales = usuarios.find(u => u.rol === 'profesional')?.total || 0;
      const pacientes = pacientesQuery.rows[0].total;

      res.json({
        totalUsuarios,
        turnosMes: turnosMesQuery.rows[0].total,
        profesionalesActivos: profesionalesActivosQuery.rows[0].total,
        totalPacientes: pacientes,
        totalProfesionales: profesionales,
        usuariosPorRol: usuarios
      });
    } catch (error) {
      console.error('Error al obtener estadísticas generales:', error);
      res.status(500).json({ message: 'Error al obtener estadísticas' });
    }
  },

  // Obtener reportes con filtros
  async getReportes(req, res) {
    try {
      const { periodo = 'mes' } = req.query;

      // Calcular fecha de inicio según el período
      let fechaInicio;
      const fechaFin = new Date();
      
      switch(periodo) {
        case 'semana':
          fechaInicio = new Date();
          fechaInicio.setDate(fechaInicio.getDate() - 7);
          break;
        case 'mes':
          fechaInicio = new Date();
          fechaInicio.setMonth(fechaInicio.getMonth() - 1);
          break;
        case 'trimestre':
          fechaInicio = new Date();
          fechaInicio.setMonth(fechaInicio.getMonth() - 3);
          break;
        case 'año':
          fechaInicio = new Date();
          fechaInicio.setFullYear(fechaInicio.getFullYear() - 1);
          break;
        default:
          fechaInicio = new Date();
          fechaInicio.setMonth(fechaInicio.getMonth() - 1);
      }

      // Turnos totales
      const turnosTotalesQuery = await pool.query(`
        SELECT COUNT(*) as total
        FROM turno
        WHERE fecha >= $1 AND fecha <= $2
      `, [fechaInicio, fechaFin]);

      // Turnos cancelados
      const turnosCanceladosQuery = await pool.query(`
        SELECT COUNT(*) as total
        FROM turno
        WHERE fecha >= $1 AND fecha <= $2 AND estado = 'cancelado'
      `, [fechaInicio, fechaFin]);

      // Pacientes únicos atendidos
      const pacientesAtendidosQuery = await pool.query(`
        SELECT COUNT(DISTINCT id_paciente) as total
        FROM turno
        WHERE fecha >= $1 AND fecha <= $2 AND estado = 'completado'
      `, [fechaInicio, fechaFin]);

      // Turnos por día
      const turnosPorDiaQuery = await pool.query(`
        SELECT DATE(fecha) as dia, COUNT(*) as total
        FROM turno
        WHERE fecha >= $1 AND fecha <= $2
        GROUP BY DATE(fecha)
        ORDER BY dia ASC
      `, [fechaInicio, fechaFin]);

      // Turnos por profesional
      const turnosPorProfesionalQuery = await pool.query(`
        SELECT 
          u.nombre || ' ' || u.apellido as profesional,
          p.especialidad,
          COUNT(t.id_turno) as total
        FROM turno t
        JOIN profesional p ON t.id_profesional = p.id_profesional
        JOIN usuario u ON p.id_profesional = u.id_usuario
        WHERE t.fecha >= $1 AND t.fecha <= $2
        GROUP BY u.nombre, u.apellido, p.especialidad
        ORDER BY total DESC
        LIMIT 10
      `, [fechaInicio, fechaFin]);

      // Turnos por especialidad
      const turnosPorEspecialidadQuery = await pool.query(`
        SELECT 
          p.especialidad,
          COUNT(t.id_turno) as total
        FROM turno t
        JOIN profesional p ON t.id_profesional = p.id_profesional
        WHERE t.fecha >= $1 AND t.fecha <= $2
        GROUP BY p.especialidad
        ORDER BY total DESC
      `, [fechaInicio, fechaFin]);

      // Estado de turnos
      const estadoTurnosQuery = await pool.query(`
        SELECT 
          estado,
          COUNT(*) as total
        FROM turno
        WHERE fecha >= $1 AND fecha <= $2
        GROUP BY estado
      `, [fechaInicio, fechaFin]);

      // Calcular tasa de ocupación (turnos confirmados/completados vs total de slots disponibles)
      const tasaOcupacion = turnosTotalesQuery.rows[0].total > 0 
        ? Math.round(((turnosTotalesQuery.rows[0].total - turnosCanceladosQuery.rows[0].total) / turnosTotalesQuery.rows[0].total) * 100)
        : 0;

      res.json({
        periodo,
        fechaInicio,
        fechaFin,
        metricas: {
          turnosTotales: parseInt(turnosTotalesQuery.rows[0].total),
          turnosCancelados: parseInt(turnosCanceladosQuery.rows[0].total),
          pacientesAtendidos: parseInt(pacientesAtendidosQuery.rows[0].total),
          tasaOcupacion
        },
        turnosPorDia: turnosPorDiaQuery.rows,
        turnosPorProfesional: turnosPorProfesionalQuery.rows,
        turnosPorEspecialidad: turnosPorEspecialidadQuery.rows,
        estadoTurnos: estadoTurnosQuery.rows
      });
    } catch (error) {
      console.error('Error al obtener reportes:', error);
      res.status(500).json({ message: 'Error al obtener reportes' });
    }
  }
};

module.exports = adminController;
