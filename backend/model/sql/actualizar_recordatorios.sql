-- Agregar campos a la tabla recordatorio para mejorar el sistema
ALTER TABLE recordatorio
ADD COLUMN tipo VARCHAR(50) CHECK (tipo IN ('confirmacion', 'recordatorio_24h')),
ADD COLUMN estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'enviado', 'fallido')),
ADD COLUMN intentos INT DEFAULT 0,
ADD COLUMN error_mensaje TEXT;

-- Comentario: 
-- tipo: 'confirmacion' = mensaje inmediato al crear el turno
--       'recordatorio_24h' = mensaje 24 horas antes del turno
-- estado: 'pendiente' = no enviado aún
--         'enviado' = enviado exitosamente
--         'fallido' = falló el envío
