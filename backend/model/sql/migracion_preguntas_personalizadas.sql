-- Migración: Crear tablas para preguntas personalizadas en seguimientos
-- Ejecutar esta migración en la base de datos PostgreSQL

-- 1. Función para validar respuestas de escala (debe crearse primero)
CREATE OR REPLACE FUNCTION tipo_respuesta_valida(valor_numerico INT, tipo VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    IF tipo = 'escala' AND valor_numerico IS NOT NULL THEN
        RETURN valor_numerico >= 1 AND valor_numerico <= 10;
    END IF;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 2. Crear tabla para preguntas personalizadas del seguimiento
CREATE TABLE IF NOT EXISTS pregunta_seguimiento (
    id_pregunta SERIAL PRIMARY KEY,
    id_seguimiento INT NOT NULL REFERENCES seguimiento(id_seguimiento) ON DELETE CASCADE,
    texto_pregunta TEXT NOT NULL,
    tipo_respuesta VARCHAR(20) NOT NULL CHECK (tipo_respuesta IN ('texto', 'escala', 'sino', 'opcion')),
    opciones TEXT[], -- Array de opciones para preguntas de opción múltiple
    obligatoria BOOLEAN DEFAULT TRUE,
    orden_pregunta INT DEFAULT 1, -- Para mantener el orden de las preguntas
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pregunta_seguimiento FOREIGN KEY (id_seguimiento) REFERENCES seguimiento(id_seguimiento) ON DELETE CASCADE
);

-- 3. Crear tabla para respuestas a preguntas personalizadas
CREATE TABLE IF NOT EXISTS respuesta_pregunta_seguimiento (
    id_respuesta_pregunta SERIAL PRIMARY KEY,
    id_pregunta INT NOT NULL REFERENCES pregunta_seguimiento(id_pregunta) ON DELETE CASCADE,
    id_respuesta_seguimiento INT NOT NULL REFERENCES respuesta_seguimiento(id_respuesta) ON DELETE CASCADE,
    id_paciente INT NOT NULL REFERENCES paciente(id_paciente),
    respuesta_texto TEXT, -- Para preguntas de texto libre
    respuesta_numerica INT, -- Para escalas 1-10
    respuesta_booleana BOOLEAN, -- Para preguntas Sí/No
    respuesta_opcion VARCHAR(255), -- Para opciones múltiples
    fecha_respuesta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_respuesta_pregunta FOREIGN KEY (id_pregunta) REFERENCES pregunta_seguimiento(id_pregunta) ON DELETE CASCADE,
    CONSTRAINT fk_respuesta_seguimiento FOREIGN KEY (id_respuesta_seguimiento) REFERENCES respuesta_seguimiento(id_respuesta) ON DELETE CASCADE,
    CONSTRAINT fk_respuesta_paciente FOREIGN KEY (id_paciente) REFERENCES paciente(id_paciente) ON DELETE CASCADE,
    CONSTRAINT chk_respuesta_escala CHECK (
        tipo_respuesta_valida(respuesta_numerica, 'escala')
    )
);

-- 4. Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_pregunta_seguimiento_id_seguimiento ON pregunta_seguimiento(id_seguimiento);
CREATE INDEX IF NOT EXISTS idx_pregunta_seguimiento_orden ON pregunta_seguimiento(id_seguimiento, orden_pregunta);
CREATE INDEX IF NOT EXISTS idx_respuesta_pregunta_id_pregunta ON respuesta_pregunta_seguimiento(id_pregunta);
CREATE INDEX IF NOT EXISTS idx_respuesta_pregunta_id_respuesta ON respuesta_pregunta_seguimiento(id_respuesta_seguimiento);
CREATE INDEX IF NOT EXISTS idx_respuesta_pregunta_paciente ON respuesta_pregunta_seguimiento(id_paciente);

-- 5. Comentario: Las nuevas tablas permiten:
--    - Preguntas personalizadas por seguimiento con diferentes tipos de respuesta
--    - Tipos soportados: texto libre, escala 1-10, sí/no, opción múltiple
--    - Respuestas estructuradas según el tipo de pregunta
--    - Orden personalizable de preguntas
--    - Preguntas obligatorias y opcionales

-- ✅ Migración completada