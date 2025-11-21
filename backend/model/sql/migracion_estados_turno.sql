-- Migración: Estandarizar estados de turno

-- 1. Actualizar estados existentes para estandarizar
UPDATE turno 
SET estado = 'confirmado' 
WHERE estado = 'programado';

-- 2. Actualizar turnos sin estado a 'pendiente'
UPDATE turno 
SET estado = 'pendiente' 
WHERE estado IS NULL OR estado = '';

-- 3. Agregar restricción de estados válidos
ALTER TABLE turno 
DROP CONSTRAINT IF EXISTS turno_estado_check;

ALTER TABLE turno 
ADD CONSTRAINT turno_estado_check 
CHECK (estado IN ('pendiente', 'confirmado', 'en_curso', 'completado', 'cancelado', 'no_asistio'));

-- 4. Establecer valor por defecto
ALTER TABLE turno 
ALTER COLUMN estado SET DEFAULT 'pendiente';

-- Comentarios sobre los estados:
-- 'pendiente' - Turno recién creado, esperando confirmación
-- 'confirmado' - Turno confirmado, listo para la consulta (usado en recepción)
-- 'en_curso' - Consulta en desarrollo
-- 'completado' - Consulta finalizada con nota clínica
-- 'cancelado' - Turno cancelado por cualquier motivo
-- 'no_asistio' - Paciente no se presentó a la cita

-- ✅ Migración completada