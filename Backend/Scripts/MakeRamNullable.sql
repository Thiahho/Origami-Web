-- Script para hacer la columna ram nullable en PostgreSQL
-- Ejecutar en la base de datos bdOrigami

-- Verificar el estado actual de la columna
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'ProductosVariantes'
  AND column_name = 'ram';

-- Hacer la columna nullable
ALTER TABLE "ProductosVariantes"
ALTER COLUMN "ram" DROP NOT NULL;

-- Verificar que se aplicó correctamente
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'ProductosVariantes'
  AND column_name = 'ram';

-- Opcional: Actualizar registros existentes que tengan ram vacío
-- UPDATE "ProductosVariantes" SET "ram" = NULL WHERE "ram" = '';
