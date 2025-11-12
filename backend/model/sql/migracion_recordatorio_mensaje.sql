-- Migración: Aumentar tamaño de campo mensaje en tabla recordatorio
-- Para soportar mensajes más largos de teleconsultas

-- Aumentar el tamaño del campo mensaje de VARCHAR(255) a TEXT
ALTER TABLE recordatorio 
  ALTER COLUMN mensaje TYPE TEXT;

-- Comentario actualizado
COMMENT ON COLUMN recordatorio.mensaje IS 'Mensaje del recordatorio (texto largo para teleconsultas)';

-- ✅ Migración completada