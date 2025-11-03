const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function run() {
  try {
    console.log('Ejecutando migración: migracion_turno_motivo.sql');
    const sql = fs.readFileSync(path.join(__dirname, 'model', 'sql', 'migracion_turno_motivo.sql'), 'utf8');
    await pool.query(sql);
    console.log('✅ Migración ejecutada exitosamente');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error en migración:', err);
    process.exit(1);
  }
}

run();
