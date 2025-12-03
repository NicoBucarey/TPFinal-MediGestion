require('dotenv').config();
const pool = require('../db');

async function checkTables() {
  try {
    const result = await pool.query(
      `SELECT table_name 
       FROM information_schema.tables 
       WHERE table_schema = 'public' 
       ORDER BY table_name`
    );
    
    console.log('Tablas existentes:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    return result.rows.map(row => row.table_name);
  } catch (error) {
    console.error('Error al verificar tablas:', error.message);
  } finally {
    await pool.end();
  }
}

checkTables();
