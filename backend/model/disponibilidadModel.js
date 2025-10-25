const db = require('../db');

const DisponibilidadModel = {
  obtenerHorariosProfesional: async (profesionalId) => {
    try {
      // Primero verificar que el profesional existe
      const profesionalCheck = await db.query(
        'SELECT id_profesional FROM profesional WHERE id_profesional = $1',
        [profesionalId]
      );

      if (profesionalCheck.rows.length === 0) {
        throw new Error('Profesional no encontrado');
      }

      // Primero obtenemos la disponibilidad general
      const disponibilidadQuery = `
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

      // Luego obtenemos los turnos ya programados para la próxima semana
      const turnosQuery = `
        SELECT fecha, hora_inicio, hora_fin
        FROM turno
        WHERE id_profesional = $1
        AND fecha >= CURRENT_DATE
        AND fecha <= CURRENT_DATE + INTERVAL '7 days'
      `;
      const [disponibilidadResult, turnosResult] = await Promise.all([
        db.query(disponibilidadQuery, [profesionalId]),
        db.query(turnosQuery, [profesionalId])
      ]);
      
      // Si no hay horarios configurados, usar horarios por defecto
      let horarios = disponibilidadResult.rows.length === 0 ? [
        { dia_semana: 'Lunes', hora_inicio: '09:00', hora_fin: '17:00' },
        { dia_semana: 'Martes', hora_inicio: '09:00', hora_fin: '17:00' },
        { dia_semana: 'Miércoles', hora_inicio: '09:00', hora_fin: '17:00' },
        { dia_semana: 'Jueves', hora_inicio: '09:00', hora_fin: '17:00' },
        { dia_semana: 'Viernes', hora_inicio: '09:00', hora_fin: '17:00' }
      ] : disponibilidadResult.rows;
      
      // Agregamos los turnos ocupados
      const turnosOcupados = turnosResult.rows.map(turno => ({
        ...turno,
        estado: 'ocupado'
      }));

      return { 
        horarios,
        turnosOcupados
      };
    } catch (error) {
      console.error('Error en DisponibilidadModel.obtenerHorariosProfesional:', error);
      throw error;
    }
  }
};

module.exports = DisponibilidadModel;