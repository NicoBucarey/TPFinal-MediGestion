const pool = require('./db');

async function checkTables() {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('Tablas en la base de datos:');
    result.rows.forEach(row => console.log('- ' + row.table_name));
    
    // Verificar específicamente seguimiento y preguntas
    const seguimiento = await pool.query("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'seguimiento')");
    const preguntas = await pool.query("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pregunta_seguimiento')");
    
    console.log('\nVerificaciones específicas:');
    console.log('Tabla seguimiento existe:', seguimiento.rows[0].exists);
    console.log('Tabla pregunta_seguimiento existe:', preguntas.rows[0].exists);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    pool.end();
  }
}

checkTables();