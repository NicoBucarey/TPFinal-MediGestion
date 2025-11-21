-- ============================================================
-- MIGRACIÓN: Agregar columna de imagen a sucursal
-- Fecha: 2025-11-20
-- Descripción: Añade columna imagen_url para almacenar la ruta del archivo
--               de imagen asociada a cada sucursal.
-- Idempotente: Usa IF NOT EXISTS.
-- ============================================================
BEGIN;

ALTER TABLE sucursal
ADD COLUMN IF NOT EXISTS imagen_url VARCHAR(500);

-- Opcional: índice si se realizan búsquedas frecuentes por imagen (normalmente no necesario)
-- CREATE INDEX IF NOT EXISTS idx_sucursal_imagen_url ON sucursal(imagen_url);

COMMIT;

-- Verificación
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name='sucursal' AND column_name='imagen_url';

-- Uso esperado: almacenar rutas tipo '/uploads/sucursales/<archivo>.jpg'
-- Si se elimina una imagen físicamente, se puede dejar NULL o actualizar.

-- Ejecución PowerShell:
-- $env:PGPASSWORD="tu_password"; psql -h localhost -U tu_usuario -d tu_base -f backend/model/sql/20241120_alter_sucursal_add_imagen.sql
