-- Migración: Extender tabla seguimiento para módulo completo de seguimientos post-consulta
-- Ejecutar esta migración en la base de datos PostgreSQL

-- 1. Renombrar y agregar columnas necesarias (idempotente)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'seguimiento' AND column_name = 'fecha_envio'
  ) THEN
    EXECUTE 'ALTER TABLE seguimiento RENAME COLUMN fecha_envio TO fecha_inicio';
  END IF;
END $$;

ALTER TABLE seguimiento 
  ADD COLUMN IF NOT EXISTS id_profesional INT REFERENCES profesional(id_profesional),
  ADD COLUMN IF NOT EXISTS frecuencia_tipo VARCHAR(20) DEFAULT 'unica' CHECK (frecuencia_tipo IN ('unica', 'diaria', 'semanal', 'personalizada')),
  ADD COLUMN IF NOT EXISTS intervalo_dias INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS repeticiones INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS fecha_fin DATE,
  ADD COLUMN IF NOT EXISTS instrucciones TEXT,
  ADD COLUMN IF NOT EXISTS tipo_seguimiento VARCHAR(30) DEFAULT 'texto' CHECK (tipo_seguimiento IN ('texto', 'checklist', 'sintomas', 'archivos')),
  ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_curso', 'completado', 'vencido')),
  ADD COLUMN IF NOT EXISTS respuesta TEXT,
  ADD COLUMN IF NOT EXISTS fecha_respuesta TIMESTAMP,
  ADD COLUMN IF NOT EXISTS fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 2. Remover columnas antiguas si existen y no se usan
-- ALTER TABLE seguimiento DROP COLUMN IF EXISTS enlace;
-- ALTER TABLE seguimiento DROP COLUMN IF EXISTS nota;
-- (Dejamos nota por compatibilidad, se puede mapear a instrucciones)

-- 3. Actualizar columna frecuencia antigua a frecuencia_tipo si hay datos
-- UPDATE seguimiento SET frecuencia_tipo = 'unica' WHERE frecuencia IS NOT NULL;

-- 4. Comentario: La tabla seguimiento ahora soporta:
--    - Frecuencias: única, diaria, semanal, personalizada (intervalo_dias)
--    - Tipos: texto libre, checklist, control de síntomas, adjuntar archivos
--    - Estados: pendiente, en_curso, completado, vencido
--    - Respuestas del paciente con timestamp
