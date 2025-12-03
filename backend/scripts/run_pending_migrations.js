require('dotenv').config();
const pool = require('../db');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Ejecutando migraciones pendientes...\n');

    // Migración 1: Teleconsulta
    console.log('1️⃣ Aplicando migracion_teleconsulta.sql...');
    const teleconsultaSql = fs.readFileSync(
      path.join(__dirname, '../model/sql/migracion_teleconsulta.sql'),
      'utf8'
    );
    await client.query(teleconsultaSql);
    console.log('✅ Teleconsulta aplicada\n');

    // Migración 2: Estados de turno
    console.log('2️⃣ Aplicando migracion_estados_turno.sql...');
    const estadosSql = fs.readFileSync(
      path.join(__dirname, '../model/sql/migracion_estados_turno.sql'),
      'utf8'
    );
    await client.query(estadosSql);
    console.log('✅ Estados de turno aplicados\n');

    console.log('🎉 Todas las migraciones completadas exitosamente');

  } catch (error) {
    console.error('❌ Error ejecutando migraciones:', error.message);
    console.error(error);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
