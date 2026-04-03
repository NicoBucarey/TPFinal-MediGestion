const pool = require('../db');

(async () => {
  try {
    const result = await pool.query(`
      SELECT id_recordatorio, id_turno, estado, intentos, error_mensaje, fecha_envio
      FROM recordatorio
      ORDER BY id_recordatorio DESC
      LIMIT 20
    `);

    console.log(JSON.stringify(result.rows, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    await pool.end();
  }
})();
