const pool = require('./db');

async function checkPacientes() {
  try {
    console.log('Verificando pacientes existentes...');
    
    const pacientes = await pool.query(`
      SELECT u.id_usuario, u.nombre, u.apellido, u.mail, p.id_paciente
      FROM usuario u
      JOIN paciente p ON p.id_paciente = u.id_usuario
      JOIN rol r ON r.id_rol = u.id_rol
      WHERE r.nombre = 'paciente'
      LIMIT 10
    `);
    
    console.log(`Pacientes encontrados: ${pacientes.rows.length}`);
    pacientes.rows.forEach(p => {
      console.log(`- ID: ${p.id_usuario}, Nombre: ${p.nombre} ${p.apellido}, Email: ${p.mail}`);
    });
    
    // También verificar profesionales
    const profesionales = await pool.query(`
      SELECT u.id_usuario, u.nombre, u.apellido
      FROM usuario u
      JOIN rol r ON r.id_rol = u.id_rol
      WHERE r.nombre = 'profesional'
      LIMIT 5
    `);
    
    console.log(`\nProfesionales encontrados: ${profesionales.rows.length}`);
    profesionales.rows.forEach(p => {
      console.log(`- ID: ${p.id_usuario}, Nombre: ${p.nombre} ${p.apellido}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    pool.end();
  }
}

checkPacientes();