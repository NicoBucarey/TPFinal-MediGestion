const db = require('./db');

async function verificarRecordatorios() {
  try {
    console.log('📊 Verificando recordatorios con advertencia...');
    
    const result = await db.query(`
      SELECT id_recordatorio, estado, error_mensaje, fecha_envio 
      FROM recordatorio 
      WHERE estado = 'enviado_con_advertencia' 
      ORDER BY id_recordatorio DESC 
      LIMIT 3
    `);
    
    if (result.rows.length === 0) {
      console.log('   No hay recordatorios con estado enviado_con_advertencia');
    } else {
      console.log('✅ Recordatorios encontrados:');
      result.rows.forEach(r => {
        console.log(`   [${r.id_recordatorio}] - ${r.estado} - ${r.error_mensaje || 'Sin error'} - ${r.fecha_envio}`);
      });
    }
    
    // También verificamos los últimos 3 recordatorios generales
    const allResult = await db.query(`
      SELECT id_recordatorio, estado, error_mensaje 
      FROM recordatorio 
      ORDER BY id_recordatorio DESC 
      LIMIT 5
    `);
    
    console.log('\n📋 Últimos 5 recordatorios:');
    allResult.rows.forEach(r => {
      console.log(`   [${r.id_recordatorio}] - ${r.estado} - ${r.error_mensaje || 'Sin error'}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

verificarRecordatorios();