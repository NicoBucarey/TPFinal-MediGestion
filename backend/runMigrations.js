const fs = require('fs');
const path = require('path');
const pool = require('./db');

const files = [
  path.join(__dirname, 'model', 'sql', 'migracion_seguimiento.sql'),
  path.join(__dirname, 'model', 'sql', 'migracion_notificaciones.sql'),
];

async function run() {
  try {
    for (const file of files) {
      console.log('Ejecutando migración:', path.basename(file));
      const sql = fs.readFileSync(file, 'utf8');
      await pool.query(sql);
      console.log('OK:', path.basename(file));
    }
    console.log('Todas las migraciones ejecutadas.');
    process.exit(0);
  } catch (err) {
    console.error('Error en migraciones:', err);
    process.exit(1);
  }
}

run();
