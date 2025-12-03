# Base de Datos - Origami Importados

Esta carpeta contiene el esquema y datos iniciales de la base de datos PostgreSQL.

---

## 📁 Archivos

### `BDOrigami.sql` (colocar aquí)
Archivo SQL que contiene:
- Esquema completo de la base de datos (tablas, índices, constraints)
- Datos iniciales (categorías, marcas, productos, etc.)
- Configuración inicial del sistema

---

## 📝 Instrucciones de Uso

### Opción 1: Deployment Automático (Recomendado)

El script `deploy.sh` importará automáticamente `BDOrigami.sql` si está en esta carpeta.

**Pasos:**
1. Coloca `BDOrigami.sql` en `deployment/database/`
2. Ejecuta el script de deployment:
   ```bash
   sudo bash deployment/deploy.sh
   ```

El script detectará el archivo y lo importará automáticamente.

---

### Opción 2: Importación Manual

Si ya desplegaste la aplicación y necesitas importar/restaurar la base de datos:

```bash
# 1. Conectarse al servidor
ssh root@TU_IP_SERVIDOR

# 2. Subir el archivo SQL (desde tu PC)
scp BDOrigami.sql root@TU_IP:/tmp/

# 3. En el servidor, importar
sudo -u postgres psql -d origami_db -f /tmp/BDOrigami.sql
```

---

## 🔄 Actualizar la Base de Datos

Si ya existe la base de datos y quieres actualizarla:

### Opción A: Recrear desde cero (⚠️ Borra todos los datos)

```bash
# CUIDADO: Esto eliminará TODOS los datos
sudo -u postgres psql <<EOF
DROP DATABASE IF EXISTS origami_db;
CREATE DATABASE origami_db OWNER origami_user;
\q
EOF

# Importar nuevamente
sudo -u postgres psql -d origami_db -f deployment/database/BDCodian.sql
```

### Opción B: Ejecutar migraciones incrementales

Si tienes cambios específicos, crea scripts de migración:

```bash
# deployment/database/migrations/001_add_new_table.sql
# deployment/database/migrations/002_update_products.sql
```

Ejecutar:
```bash
sudo -u postgres psql -d origami_db -f deployment/database/migrations/001_add_new_table.sql
```

---

## 🔍 Verificar Importación

Después de importar, verifica que todo esté correcto:

```bash
# Conectarse a la base de datos
sudo -u postgres psql -d origami_db

-- Ver todas las tablas
\dt

-- Ver cantidad de registros en tablas principales
SELECT 'Productos' as tabla, COUNT(*) as registros FROM productos
UNION ALL
SELECT 'Categorías', COUNT(*) FROM categorias
UNION ALL
SELECT 'Marcas', COUNT(*) FROM marcas
UNION ALL
SELECT 'Usuarios', COUNT(*) FROM usuarios;

-- Salir
\q
```

Deberías ver las tablas y registros importados.

---

## 📊 Estructura Esperada

El archivo `BDOrigami.sql` debería contener algo similar a:

```sql
-- Crear tablas
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    ...
);

CREATE TABLE marcas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    ...
);

CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    categoria_id INT REFERENCES categorias(id),
    marca_id INT REFERENCES marcas(id),
    ...
);

-- Insertar datos iniciales
INSERT INTO categorias (nombre) VALUES
    ('Electrónica'),
    ('Hogar'),
    ('Deportes');

INSERT INTO productos (nombre, categoria_id, marca_id, precio) VALUES
    ('Producto 1', 1, 1, 1500.00),
    ('Producto 2', 2, 2, 2500.00);
```

---

## 🛡️ Seguridad

### ⚠️ IMPORTANTE: NO subir a GitHub si contiene datos sensibles

Si `BDOrigami.sql` contiene:
- ❌ Datos de clientes reales
- ❌ Passwords de usuarios reales
- ❌ Información personal (PII)
- ❌ Datos de producción

**NO lo subas a GitHub**. Ya está protegido en `.gitignore`:

```gitignore
# En .gitignore
deployment/database/*.sql
!deployment/database/schema.sql  # Solo esquema sin datos
!deployment/database/README.md
```

### ✅ Qué SÍ puedes subir a GitHub:

- Schema vacío (solo estructura, sin datos)
- Datos de ejemplo/demo (ficticios)
- Scripts de migración

---

## 💾 Backup de Base de Datos

### Crear backup

```bash
# Backup completo con datos
sudo -u postgres pg_dump origami_db > backup_$(date +%Y%m%d).sql

# Solo esquema (sin datos)
sudo -u postgres pg_dump --schema-only origami_db > schema_only.sql

# Solo datos (sin esquema)
sudo -u postgres pg_dump --data-only origami_db > data_only.sql

# Backup comprimido
sudo -u postgres pg_dump origami_db | gzip > backup_$(date +%Y%m%d).sql.gz
```

### Restaurar backup

```bash
# Desde archivo .sql
sudo -u postgres psql -d origami_db -f backup_20241202.sql

# Desde archivo comprimido
gunzip < backup_20241202.sql.gz | sudo -u postgres psql -d origami_db
```

---

## 🔧 Troubleshooting

### Error: "database already exists"

```bash
# Eliminar base de datos existente
sudo -u postgres psql -c "DROP DATABASE origami_db;"

# Volver a crearla
sudo -u postgres psql -c "CREATE DATABASE origami_db OWNER origami_user;"

# Importar
sudo -u postgres psql -d origami_db -f BDCodian.sql
```

### Error: "role does not exist"

```bash
# Crear el usuario primero
sudo -u postgres psql -c "CREATE USER origami_user WITH PASSWORD 'tu_password';"

# Dar permisos
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE origami_db TO origami_user;"
```

### Error: "permission denied"

```bash
# Verificar permisos del archivo
chmod 644 BDCodian.sql

# Verificar que PostgreSQL puede leerlo
sudo -u postgres cat BDCodian.sql > /dev/null
```

### Ver errores durante importación

```bash
# Importar con verbose
sudo -u postgres psql -d origami_db -f BDCodian.sql -v ON_ERROR_STOP=1
```

---

## 📋 Checklist de Importación

Antes de importar en producción:

- [ ] Hacer backup de la base de datos actual
- [ ] Verificar que el archivo SQL es válido
- [ ] Probar importación en ambiente de desarrollo
- [ ] Revisar que no haya datos sensibles en producción
- [ ] Detener la aplicación backend durante la importación
- [ ] Importar el SQL
- [ ] Verificar las tablas y datos
- [ ] Reiniciar la aplicación backend
- [ ] Probar la aplicación

---

## 📞 Comandos Útiles

```bash
# Ver tamaño de la base de datos
sudo -u postgres psql -c "SELECT pg_size_pretty(pg_database_size('origami_db'));"

# Ver todas las tablas y sus tamaños
sudo -u postgres psql -d origami_db -c "\dt+"

# Ver usuarios/roles
sudo -u postgres psql -c "\du"

# Ver conexiones activas
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity WHERE datname = 'origami_db';"

# Matar conexiones activas (antes de DROP DATABASE)
sudo -u postgres psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'origami_db' AND pid <> pg_backend_pid();"
```

---

## 🎯 Resumen

1. **Coloca** `BDOrigami.sql` en `deployment/database/`
2. **Ejecuta** `sudo bash deployment/deploy.sh` (importará automáticamente)
3. **Verifica** con `sudo -u postgres psql -d origami_db`
4. **NO subas** a GitHub si contiene datos sensibles

---

**Última actualización**: 2024-12-02
