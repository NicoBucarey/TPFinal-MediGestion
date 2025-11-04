const pool = require('./db');

async function test() {
  try {
    const query = `
      SELECT 
        rs.*,
        u.nombre || ' ' || u.apellido as nombre_paciente,
        u.mail as email_paciente
      FROM respuesta_seguimiento rs
      JOIN usuario u ON u.id_usuario = rs.id_paciente
      WHERE rs.id_seguimiento = $1
      ORDER BY rs.fecha_respuesta DESC
    `;

    console.log('Executing query...');
    const result = await pool.query(query, [2]);
    console.log('✅ Query successful!');
    console.log('Rows:', result.rows);
  } catch (error) {
    console.error('❌ Query failed:');
    console.error('Message:', error.message);
    console.error('Detail:', error.detail);
    console.error('Stack:', error.stack);
  }
  process.exit(0);
}

test();
