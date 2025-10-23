const db = require('../db');

const PacienteModel = {
  buscarUnificado: async (termino) => {
    try {
      const searchValue = `%${termino}%`;
      
      const query = `
        SELECT 
          u.id_usuario,
          u.nombre,
          u.apellido,
          u.mail as email,
          p.dni,
          p.fecha_nac
        FROM usuario u
        INNER JOIN paciente p ON u.id_usuario = p.id_paciente
        WHERE 
          p.dni::text LIKE $1 OR
          LOWER(u.apellido) LIKE LOWER($1) OR
          LOWER(u.nombre) LIKE LOWER($1) OR
          LOWER(u.mail) LIKE LOWER($1)
        ORDER BY u.apellido, u.nombre
        LIMIT 50`;

      console.log('Query a ejecutar:', query);
      console.log('Valor de búsqueda:', searchValue);
      
      const result = await db.query(query, [searchValue]);
      return result.rows;
    } catch (error) {
      console.error('Error en PacienteModel.buscarUnificado:', error);
      throw error;
    }
  }
};

module.exports = PacienteModel;