-- Migración: Agregar columna motivo_consulta a tabla turno

ALTER TABLE turno 
ADD COLUMN IF NOT EXISTS motivo_consulta TEXT;
