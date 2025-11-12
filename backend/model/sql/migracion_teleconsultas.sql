-- Migración: Agregar soporte para teleconsultas en tabla turno
-- Ejecutar esta migración en la base de datos PostgreSQL

-- 1. Agregar columnas para teleconsultas
ALTER TABLE turno 
  ADD COLUMN IF NOT EXISTS tipo VARCHAR(20) DEFAULT 'presencial' CHECK (tipo IN ('presencial', 'teleconsulta')),
  ADD COLUMN IF NOT EXISTS link_reunion TEXT,
  ADD COLUMN IF NOT EXISTS plataforma VARCHAR(50) DEFAULT 'jitsi';

-- 2. Crear índice para mejorar consultas por tipo
CREATE INDEX IF NOT EXISTS idx_turno_tipo ON turno(tipo);

-- 3. Comentarios sobre las nuevas columnas
COMMENT ON COLUMN turno.tipo IS 'Tipo de consulta: presencial o teleconsulta';
COMMENT ON COLUMN turno.link_reunion IS 'URL de la reunión virtual para teleconsultas';
COMMENT ON COLUMN turno.plataforma IS 'Plataforma de videollamada utilizada (jitsi, zoom, etc.)';

-- ✅ Migración completada