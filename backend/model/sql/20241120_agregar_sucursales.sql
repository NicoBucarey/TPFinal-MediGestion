-- ============================================================
-- MIGRACIÓN: Sistema de Sucursales para MediGestión
-- Fecha: 2024-11-20
-- Descripción: Agrega tabla sucursal y columnas relacionadas
--              en paciente, profesional, turno y turno_periodico
-- ============================================================

-- IMPORTANTE: Este script es idempotente (se puede ejecutar múltiples veces)
-- Si las tablas/columnas ya existen, simplemente las omite

BEGIN;

-- ============================================================
-- 1. CREAR TABLA SUCURSAL
-- ============================================================

CREATE TABLE IF NOT EXISTS sucursal (
    id_sucursal SERIAL PRIMARY KEY,
    numero VARCHAR(20) NOT NULL,
    nombre VARCHAR(150),
    direccion VARCHAR(255) NOT NULL,
    localidad VARCHAR(100) NOT NULL,
    provincia VARCHAR(100) NOT NULL,
    telefono VARCHAR(30),
    email VARCHAR(150),
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uk_sucursal_numero UNIQUE (numero)
);

-- Crear índice para búsquedas por activa
CREATE INDEX IF NOT EXISTS idx_sucursal_activa ON sucursal(activa);

-- ============================================================
-- 2. AGREGAR COLUMNA id_sucursal A TABLAS EXISTENTES
-- ============================================================

-- Agregar id_sucursal a tabla paciente
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='paciente' AND column_name='id_sucursal'
    ) THEN
        ALTER TABLE paciente ADD COLUMN id_sucursal INT;
        RAISE NOTICE 'Columna id_sucursal agregada a tabla paciente';
    ELSE
        RAISE NOTICE 'Columna id_sucursal ya existe en tabla paciente';
    END IF;
END$$;

-- Agregar id_sucursal a tabla profesional
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='profesional' AND column_name='id_sucursal'
    ) THEN
        ALTER TABLE profesional ADD COLUMN id_sucursal INT;
        RAISE NOTICE 'Columna id_sucursal agregada a tabla profesional';
    ELSE
        RAISE NOTICE 'Columna id_sucursal ya existe en tabla profesional';
    END IF;
END$$;

-- Agregar id_sucursal a tabla turno
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='turno' AND column_name='id_sucursal'
    ) THEN
        ALTER TABLE turno ADD COLUMN id_sucursal INT;
        RAISE NOTICE 'Columna id_sucursal agregada a tabla turno';
    ELSE
        RAISE NOTICE 'Columna id_sucursal ya existe en tabla turno';
    END IF;
END$$;

-- Agregar id_sucursal a tabla turno_periodico
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='turno_periodico' AND column_name='id_sucursal'
    ) THEN
        ALTER TABLE turno_periodico ADD COLUMN id_sucursal INT;
        RAISE NOTICE 'Columna id_sucursal agregada a tabla turno_periodico';
    ELSE
        RAISE NOTICE 'Columna id_sucursal ya existe en tabla turno_periodico';
    END IF;
END$$;

-- ============================================================
-- 3. CREAR FOREIGN KEYS (LLAVES FORÁNEAS)
-- ============================================================

-- FK de paciente a sucursal
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name='fk_paciente_sucursal'
    ) THEN
        ALTER TABLE paciente 
        ADD CONSTRAINT fk_paciente_sucursal 
        FOREIGN KEY (id_sucursal) 
        REFERENCES sucursal(id_sucursal) 
        ON DELETE SET NULL;
        RAISE NOTICE 'FK fk_paciente_sucursal creada';
    ELSE
        RAISE NOTICE 'FK fk_paciente_sucursal ya existe';
    END IF;
END$$;

-- FK de profesional a sucursal
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name='fk_profesional_sucursal'
    ) THEN
        ALTER TABLE profesional 
        ADD CONSTRAINT fk_profesional_sucursal 
        FOREIGN KEY (id_sucursal) 
        REFERENCES sucursal(id_sucursal) 
        ON DELETE SET NULL;
        RAISE NOTICE 'FK fk_profesional_sucursal creada';
    ELSE
        RAISE NOTICE 'FK fk_profesional_sucursal ya existe';
    END IF;
END$$;

-- FK de turno a sucursal
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name='fk_turno_sucursal'
    ) THEN
        ALTER TABLE turno 
        ADD CONSTRAINT fk_turno_sucursal 
        FOREIGN KEY (id_sucursal) 
        REFERENCES sucursal(id_sucursal) 
        ON DELETE SET NULL;
        RAISE NOTICE 'FK fk_turno_sucursal creada';
    ELSE
        RAISE NOTICE 'FK fk_turno_sucursal ya existe';
    END IF;
END$$;

-- FK de turno_periodico a sucursal
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name='fk_turno_periodico_sucursal'
    ) THEN
        ALTER TABLE turno_periodico 
        ADD CONSTRAINT fk_turno_periodico_sucursal 
        FOREIGN KEY (id_sucursal) 
        REFERENCES sucursal(id_sucursal) 
        ON DELETE SET NULL;
        RAISE NOTICE 'FK fk_turno_periodico_sucursal creada';
    ELSE
        RAISE NOTICE 'FK fk_turno_periodico_sucursal ya existe';
    END IF;
END$$;

-- ============================================================
-- 4. DATOS DE EJEMPLO (OPCIONAL - Comentar si no se necesita)
-- ============================================================

-- Insertar una sucursal de ejemplo si no hay ninguna
INSERT INTO sucursal (numero, nombre, direccion, localidad, provincia, telefono, email, activa)
SELECT '001', 'Sucursal Central', 'Av. Principal 123', 'Ciudad Autónoma de Buenos Aires', 'Buenos Aires', '011-4444-5555', 'central@medigestion.com', true
WHERE NOT EXISTS (SELECT 1 FROM sucursal);

-- ============================================================
-- 5. VERIFICACIÓN FINAL
-- ============================================================

-- Mostrar información de la tabla sucursal
DO $$
DECLARE
    sucursal_count INT;
BEGIN
    SELECT COUNT(*) INTO sucursal_count FROM sucursal;
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'MIGRACIÓN COMPLETADA EXITOSAMENTE';
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'Tabla sucursal: % registros', sucursal_count;
    RAISE NOTICE 'Columnas agregadas a: paciente, profesional, turno, turno_periodico';
    RAISE NOTICE 'Foreign Keys creadas correctamente';
    RAISE NOTICE '============================================================';
END$$;

COMMIT;

-- ============================================================
-- INSTRUCCIONES DE USO:
-- ============================================================
-- 
-- Para ejecutar este script desde la terminal:
-- 
-- Windows PowerShell:
-- $env:PGPASSWORD="tu_password"; psql -h localhost -U tu_usuario -d nombre_base_datos -f backend/model/sql/20241120_agregar_sucursales.sql
--
-- Linux/Mac:
-- PGPASSWORD=tu_password psql -h localhost -U tu_usuario -d nombre_base_datos -f backend/model/sql/20241120_agregar_sucursales.sql
--
-- O desde psql interactivo:
-- \i backend/model/sql/20241120_agregar_sucursales.sql
--
-- ============================================================
