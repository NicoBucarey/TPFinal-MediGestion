-- Migración segura para sucursales (no destruye datos existentes)
-- Requiere variables de entorno para conexión si se ejecuta externamente.

-- 1. Crear tabla sucursal si no existe
CREATE TABLE IF NOT EXISTS sucursal (
    id_sucursal SERIAL PRIMARY KEY,
    numero VARCHAR(20) NOT NULL,
    nombre VARCHAR(150),
    direccion VARCHAR(255) NOT NULL,
    localidad VARCHAR(100) NOT NULL,
    provincia VARCHAR(100) NOT NULL,
    telefono VARCHAR(30),
    email VARCHAR(150),
    activa BOOLEAN NOT NULL DEFAULT TRUE
);

-- 2. Añadir columnas id_sucursal si no existen
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='paciente' AND column_name='id_sucursal'
    ) THEN
        ALTER TABLE paciente ADD COLUMN id_sucursal INT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='profesional' AND column_name='id_sucursal'
    ) THEN
        ALTER TABLE profesional ADD COLUMN id_sucursal INT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='turno' AND column_name='id_sucursal'
    ) THEN
        ALTER TABLE turno ADD COLUMN id_sucursal INT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='turno_periodico' AND column_name='id_sucursal'
    ) THEN
        ALTER TABLE turno_periodico ADD COLUMN id_sucursal INT;
    END IF;
END$$;

-- 3. Agregar FKs si no existen (chequeo simple por constraint name)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name='fk_paciente_sucursal'
    ) THEN
        ALTER TABLE paciente ADD CONSTRAINT fk_paciente_sucursal FOREIGN KEY (id_sucursal) REFERENCES sucursal(id_sucursal) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name='fk_profesional_sucursal'
    ) THEN
        ALTER TABLE profesional ADD CONSTRAINT fk_profesional_sucursal FOREIGN KEY (id_sucursal) REFERENCES sucursal(id_sucursal) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name='fk_turno_sucursal'
    ) THEN
        ALTER TABLE turno ADD CONSTRAINT fk_turno_sucursal FOREIGN KEY (id_sucursal) REFERENCES sucursal(id_sucursal) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name='fk_turno_periodico_sucursal'
    ) THEN
        ALTER TABLE turno_periodico ADD CONSTRAINT fk_turno_periodico_sucursal FOREIGN KEY (id_sucursal) REFERENCES sucursal(id_sucursal) ON DELETE SET NULL;
    END IF;
END$$;

-- 4. Vista rápida para ver resultado
-- SELECT 'paciente.id_sucursal' AS col, COUNT(*) FROM paciente;
-- SELECT 'profesional.id_sucursal' AS col, COUNT(*) FROM profesional;
-- SELECT 'turno.id_sucursal' AS col, COUNT(*) FROM turno;
-- SELECT 'turno_periodico.id_sucursal' AS col, COUNT(*) FROM turno_periodico;
