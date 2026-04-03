const db = require('./db');

async function actualizarEstado() {
  try {
    console.log('🔧 Agregando estado enviado_con_advertencia...');
    
    // Eliminar restricción anterior
    await db.query(`
      ALTER TABLE recordatorio 
      DROP CONSTRAINT IF EXISTS recordatorio_estado_check;
    `);
    
    // Agregar nueva restricción
    await db.query(`
      ALTER TABLE recordatorio 
      ADD CONSTRAINT recordatorio_estado_check 
      CHECK (estado IN ('pendiente', 'enviado', 'enviado_con_advertencia', 'fallido'));
    `);
    
    console.log('✅ Restricción de estado actualizada correctamente');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error actualizando restricción:', err.message);
    process.exit(1);
  }
}

actualizarEstado();