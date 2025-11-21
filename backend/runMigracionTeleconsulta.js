const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuración de la base de datos
const pool = new Pool({
  user: process.env.DB_USER || 'medigestion_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'medigestion_db',
  password: process.env.DB_PASSWORD || 'admin123',
  port: process.env.DB_PORT || 5432,
});

async function ejecutarMigracionTeleconsulta() {
  try {
    console.log('Iniciando migración para teleconsulta...');
    
    // Leer el archivo de migración
    const migracionPath = path.join(__dirname, 'model', 'sql', 'migracion_teleconsulta.sql');
    const migracionSQL = fs.readFileSync(migracionPath, 'utf8');
    
    // Ejecutar la migración
    await pool.query(migracionSQL);
    
    console.log('✅ Migración de teleconsulta ejecutada exitosamente');
    console.log('   - Columna "tipo" agregada a tabla turno');
    console.log('   - Columna "link_reunion" agregada a tabla turno');
    console.log('   - Columna "plataforma" agregada a tabla turno');
    console.log('   - Turnos existentes actualizados como "presencial"');
    
  } catch (error) {
    console.error('❌ Error ejecutando migración de teleconsulta:', error);
  } finally {
    await pool.end();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  ejecutarMigracionTeleconsulta();
}

module.exports = { ejecutarMigracionTeleconsulta };