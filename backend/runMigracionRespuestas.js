const fs = require('fs');
const path = require('path');
const pool = require('./db');

const migrationFile = path.join(__dirname, 'model', 'sql', 'migracion_respuestas_seguimiento.sql');

async function runMigration() {
  try {
    console.log('📦 Ejecutando migración: migracion_respuestas_seguimiento.sql');
    
    const sql = fs.readFileSync(migrationFile, 'utf8');
    await pool.query(sql);
    
    console.log('✅ Migración ejecutada exitosamente');
    console.log('   - Tabla respuesta_seguimiento creada');
    console.log('   - Índices creados');
    console.log('   - Datos migrados (si existían)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error.message);
    process.exit(1);
  }
}

runMigration();
