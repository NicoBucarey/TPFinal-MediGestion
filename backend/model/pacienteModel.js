const db = require('../db');

const PacienteModel = {
  buscarPorCriterio: async (criterio, valor) => {
    try {
      console.log('Buscando con criterio:', criterio, 'valor:', valor);
      
      let query = `
        SELECT 
          u.id_usuario,
          u.nombre,
          u.apellido,
          u.mail as email,
          p.dni,
          p.fecha_nac
        FROM usuario u
        INNER JOIN paciente p ON u.id_usuario = p.id_paciente
        WHERE `;

      let searchValue;
      switch (criterio) {
        case 'dni':
          query += 'p.dni::text LIKE $1';
          searchValue = `%${valor}%`;
          break;
        case 'apellido':
          query += 'LOWER(u.apellido) LIKE LOWER($1)';
          searchValue = `%${valor}%`;
          break;
        case 'email':
          query += 'LOWER(u.mail) LIKE LOWER($1)';
          searchValue = `%${valor}%`;
          break;
        default:
          throw new Error('Criterio de búsqueda inválido');
      }

      console.log('Query a ejecutar:', query);
      console.log('Valor de búsqueda:', searchValue);
      
      const result = await db.query(query, [searchValue]);
      return result.rows;
    } catch (error) {
      console.error('Error en PacienteModel.buscarPorCriterio:', error);
      throw error;
    }
  }
};

module.exports = PacienteModel;