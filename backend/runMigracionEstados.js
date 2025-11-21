const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function ejecutarMigracionEstados() {
  try {
    console.log('🔄 Iniciando migración de estados de turno...');
    
    // Leer el archivo de migración
    const migracionPath = path.join(__dirname, 'model', 'sql', 'migracion_estados_turno.sql');
    const migracionSQL = fs.readFileSync(migracionPath, 'utf8');
    
    // Ejecutar la migración
    await pool.query(migracionSQL);
    
    console.log('✅ Migración de estados ejecutada exitosamente');
    console.log('   - Estados "programado" → "confirmado"');
    console.log('   - Estados nulos → "pendiente"');
    console.log('   - Restricciones de estado agregadas');
    console.log('   - Valor por defecto establecido');
    
    // Mostrar resumen de estados actuales
    const resultado = await pool.query(`
      SELECT estado, COUNT(*) as cantidad 
      FROM turno 
      GROUP BY estado 
      ORDER BY estado
    `);
    
    console.log('\n📊 Estados de turno actuales:');
    resultado.rows.forEach(row => {
      console.log(`   ${row.estado}: ${row.cantidad} turnos`);
    });
    
  } catch (error) {
    console.error('❌ Error ejecutando migración de estados:', error);
  } finally {
    await pool.end();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  ejecutarMigracionEstados();
}

module.exports = { ejecutarMigracionEstados };