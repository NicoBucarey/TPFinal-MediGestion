#!/usr/bin/env node
/*
  Ejecuta una migración simple para agregar la columna imagen_url a la tabla sucursal
  usando la configuración de base de datos existente (dotenv + db.js).
*/

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../db');

(async () => {
  console.log('Iniciando migración: agregar columna imagen_url a sucursal');
  try {
    const sql = `ALTER TABLE sucursal ADD COLUMN IF NOT EXISTS imagen_url VARCHAR(500);`;
    await pool.query(sql);
    console.log('OK: Columna imagen_url verificada/creada.');
    process.exit(0);
  } catch (err) {
    console.error('Error al ejecutar migración:', err.code, err.message);
    process.exit(1);
  }
})();
