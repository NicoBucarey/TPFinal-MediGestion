const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function run() {
  const file = path.join(__dirname, 'model', 'sql', 'actualizar_recordatorios.sql');
  try {
    console.log('🚀 Ejecutando SQL: actualizar_recordatorios.sql');
    const sql = fs.readFileSync(file, 'utf8');
    await pool.query(sql);
    console.log('✅ SQL ejecutado correctamente');
  } catch (err) {
    console.error('❌ Error al ejecutar SQL:', err.message);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

run();