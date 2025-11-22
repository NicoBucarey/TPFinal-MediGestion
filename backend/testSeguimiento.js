const pool = require('./db');

async function testSeguimientoCreation() {
  try {
    console.log('Probando creación de seguimiento...');
    
    // Datos de prueba
    const testData = {
      turnoId: null,
      pacienteId: 4, // Asumiendo que existe un paciente con ID 4
      userId: 6, // Profesional
      fechaInicio: '2025-11-22',
      frecuenciaTipo: 'unica',
      intervaloDias: null,
      repeticiones: null,
      fechaFin: null,
      estado: 'pendiente'
    };
    
    console.log('Datos de prueba:', testData);
    
    const result = await pool.query(
      `INSERT INTO seguimiento (
          id_turno, id_paciente, id_profesional, fecha_inicio, 
          frecuencia_tipo, intervalo_dias, repeticiones, fecha_fin, estado
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        testData.turnoId,
        testData.pacienteId,
        testData.userId,
        testData.fechaInicio,
        testData.frecuenciaTipo,
        testData.intervaloDias,
        testData.repeticiones,
        testData.fechaFin,
        testData.estado
      ]
    );
    
    console.log('Seguimiento creado exitosamente:', result.rows[0]);
    
  } catch (error) {
    console.error('Error al crear seguimiento:', error);
    console.error('Detalle del error:', error.message);
  } finally {
    pool.end();
  }
}

testSeguimientoCreation();