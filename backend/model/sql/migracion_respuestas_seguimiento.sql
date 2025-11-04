-- Migración: Crear tabla para respuestas de seguimiento del paciente
-- Ejecutar esta migración en la base de datos PostgreSQL

-- 1. Crear tabla respuesta_seguimiento
CREATE TABLE IF NOT EXISTS respuesta_seguimiento (
    id_respuesta SERIAL PRIMARY KEY,
    id_seguimiento INT NOT NULL REFERENCES seguimiento(id_seguimiento) ON DELETE CASCADE,
    id_paciente INT NOT NULL REFERENCES paciente(id_paciente),
    respuesta TEXT NOT NULL,
    archivos_urls TEXT[], -- Array de URLs de archivos adjuntos (opcional)
    fecha_respuesta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observaciones TEXT, -- Notas adicionales del paciente
    sintomas_reportados TEXT, -- Si es seguimiento tipo 'sintomas'
    cumplimiento BOOLEAN DEFAULT TRUE, -- Si cumplió con las instrucciones
    CONSTRAINT fk_seguimiento FOREIGN KEY (id_seguimiento) REFERENCES seguimiento(id_seguimiento) ON DELETE CASCADE,
    CONSTRAINT fk_paciente FOREIGN KEY (id_paciente) REFERENCES paciente(id_paciente) ON DELETE CASCADE
);

-- 2. Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_respuesta_seguimiento_id_seguimiento ON respuesta_seguimiento(id_seguimiento);
CREATE INDEX IF NOT EXISTS idx_respuesta_seguimiento_id_paciente ON respuesta_seguimiento(id_paciente);
CREATE INDEX IF NOT EXISTS idx_respuesta_seguimiento_fecha ON respuesta_seguimiento(fecha_respuesta);

-- 3. Comentario: La tabla respuesta_seguimiento permite:
--    - Múltiples respuestas por seguimiento (seguimientos periódicos)
--    - Adjuntar archivos (fotos, documentos)
--    - Reportar síntomas específicos
--    - Indicar cumplimiento de instrucciones
--    - Observaciones adicionales del paciente

-- 4. Migrar datos existentes de seguimiento.respuesta si existen
INSERT INTO respuesta_seguimiento (id_seguimiento, id_paciente, respuesta, fecha_respuesta)
SELECT 
    s.id_seguimiento, 
    s.id_paciente, 
    s.respuesta, 
    COALESCE(s.fecha_respuesta, CURRENT_TIMESTAMP)
FROM seguimiento s
WHERE s.respuesta IS NOT NULL 
  AND s.respuesta <> ''
  AND NOT EXISTS (
    SELECT 1 FROM respuesta_seguimiento rs 
    WHERE rs.id_seguimiento = s.id_seguimiento 
      AND rs.id_paciente = s.id_paciente
  );

-- 5. Opcional: Limpiar campos respuesta/fecha_respuesta de seguimiento (si se desea usar solo la nueva tabla)
-- UPDATE seguimiento SET respuesta = NULL, fecha_respuesta = NULL WHERE respuesta IS NOT NULL;

-- ✅ Migración completada
