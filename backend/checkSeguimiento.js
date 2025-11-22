const pool = require('./db');

async function checkSeguimientoStructure() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'seguimiento' 
      ORDER BY ordinal_position
    `);
    
    console.log('Estructura de la tabla seguimiento:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)'} ${row.column_default ? `DEFAULT ${row.column_default}` : ''}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    pool.end();
  }
}

checkSeguimientoStructure();