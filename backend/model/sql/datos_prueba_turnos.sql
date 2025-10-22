-- Agregar nuevos campos a la tabla disponibilidad
ALTER TABLE disponibilidad
ADD COLUMN duracion_turno INTEGER NOT NULL DEFAULT 30,
ADD COLUMN intervalo_turnos INTEGER NOT NULL DEFAULT 0,
ADD COLUMN activo BOOLEAN NOT NULL DEFAULT true;

-- Crear nueva tabla para excepciones
CREATE TABLE disponibilidad_excepciones (
    id_excepcion SERIAL PRIMARY KEY,
    id_profesional INT REFERENCES profesional(id_profesional),
    fecha DATE NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('no_disponible', 'horario_especial')),
    hora_inicio TIME,
    hora_fin TIME,
    CONSTRAINT hora_valida CHECK (
        (tipo = 'no_disponible' AND hora_inicio IS NULL AND hora_fin IS NULL) OR
        (tipo = 'horario_especial' AND hora_inicio IS NOT NULL AND hora_fin IS NOT NULL)
    )
);