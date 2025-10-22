const db = require('../db');

const DisponibilidadModel = {
  obtenerHorariosProfesional: async (profesionalId) => {
    try {
      const query = `
        SELECT dia_semana, hora_inicio, hora_fin
        FROM disponibilidad
        WHERE id_profesional = $1
        ORDER BY 
          CASE 
            WHEN dia_semana = 'Lunes' THEN 1
            WHEN dia_semana = 'Martes' THEN 2
            WHEN dia_semana = 'Miércoles' THEN 3
            WHEN dia_semana = 'Jueves' THEN 4
            WHEN dia_semana = 'Viernes' THEN 5
            WHEN dia_semana = 'Sábado' THEN 6
            WHEN dia_semana = 'Domingo' THEN 7
          END,
          hora_inicio
      `;
      const result = await db.query(query, [profesionalId]);
      return result.rows;
    } catch (error) {
      console.error('Error en DisponibilidadModel.obtenerHorariosProfesional:', error);
      throw error;
    }
  }
};

module.exports = DisponibilidadModel;