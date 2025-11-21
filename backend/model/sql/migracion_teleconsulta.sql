-- Migración: Agregar columnas para teleconsulta y tipos de turno

-- Agregar columna tipo para distinguir entre presencial, teleconsulta, periodico
ALTER TABLE turno 
ADD COLUMN IF NOT EXISTS tipo VARCHAR(50) DEFAULT 'presencial';

-- Agregar columna para almacenar el link de reunión de teleconsulta
ALTER TABLE turno 
ADD COLUMN IF NOT EXISTS link_reunion TEXT;

-- Agregar columna para especificar la plataforma de teleconsulta
ALTER TABLE turno 
ADD COLUMN IF NOT EXISTS plataforma VARCHAR(100) DEFAULT 'Jitsi Meet';

-- Actualizar turnos existentes que no tienen tipo definido
UPDATE turno 
SET tipo = 'presencial' 
WHERE tipo IS NULL;

-- Comentario: Los tipos válidos son:
-- 'presencial' - Consulta presencial tradicional
-- 'teleconsulta' - Consulta virtual por video
-- 'periodico' - Turno que se repite en el tiempo