require('dotenv').config();
const pool = require('../db');

async function checkColumns() {
  try {
    // Verificar columnas de turno
    console.log('\n=== Verificando tabla TURNO ===');
    const turnoColumns = await pool.query(
      `SELECT column_name, data_type, is_nullable, column_default
       FROM information_schema.columns 
       WHERE table_name = 'turno' 
       ORDER BY ordinal_position`
    );
    turnoColumns.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });

    // Verificar columnas de seguimiento
    console.log('\n=== Verificando tabla SEGUIMIENTO ===');
    const seguimientoColumns = await pool.query(
      `SELECT column_name, data_type, is_nullable
       FROM information_schema.columns 
       WHERE table_name = 'seguimiento' 
       ORDER BY ordinal_position`
    );
    seguimientoColumns.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type}`);
    });

    // Verificar columnas de sucursal
    console.log('\n=== Verificando tabla SUCURSAL ===');
    const sucursalColumns = await pool.query(
      `SELECT column_name, data_type
       FROM information_schema.columns 
       WHERE table_name = 'sucursal' 
       ORDER BY ordinal_position`
    );
    sucursalColumns.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type}`);
    });

    // Verificar columnas de paciente
    console.log('\n=== Verificando tabla PACIENTE ===');
    const pacienteColumns = await pool.query(
      `SELECT column_name, data_type
       FROM information_schema.columns 
       WHERE table_name = 'paciente' 
       ORDER BY ordinal_position`
    );
    pacienteColumns.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type}`);
    });

    // Verificar columnas de profesional
    console.log('\n=== Verificando tabla PROFESIONAL ===');
    const profesionalColumns = await pool.query(
      `SELECT column_name, data_type
       FROM information_schema.columns 
       WHERE table_name = 'profesional' 
       ORDER BY ordinal_position`
    );
    profesionalColumns.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkColumns();
