const fs = require('fs');
const path = require('path');
const pool = require('./db');

(async function() {
  try {
    const file = path.join(__dirname, 'model', 'sql', 'migracion_notificaciones.sql');
    console.log('Ejecutando migración:', path.basename(file));
    const sql = fs.readFileSync(file, 'utf8');
    await pool.query(sql);
    console.log('OK');
    process.exit(0);
  } catch (err) {
    console.error('Error migrando notificaciones:', err);
    process.exit(1);
  }
})();
