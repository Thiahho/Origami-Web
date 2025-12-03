# Guía de Deployment - Origami Importados

## AlmaLinux 9 - DonWeb Cloud Server

Esta guía te ayudará a desplegar tu aplicación en un servidor cloud de DonWeb con AlmaLinux 9, usando solo línea de comandos.

---

## 📋 Requisitos Previos

1. **Servidor AlmaLinux 9 (64 bits)**
2. **Acceso SSH root o sudo**
3. **Dominio apuntando al servidor** (opcional pero recomendado)
4. **Mínimo 2GB RAM, 20GB disco**
5. **Archivo BDOrigami.sql** con el esquema y datos de tu base de datos

---

## 🚀 Instalación Rápida (Método Automático)

### 1. Conectarse al servidor

```bash
ssh root@TU_IP_SERVIDOR
# O si tienes puerto personalizado
ssh -p PUERTO root@TU_IP_SERVIDOR
```

### 2. Subir el proyecto al servidor

**Opción A: Usando SCP (desde tu PC local en Windows)**

```bash
# En tu PC Windows (PowerShell o CMD)
cd E:\Proyectos

# Comprimir el proyecto
tar -czf origami.tar.gz Origami-Liquid-

# Subir al servidor
scp origami.tar.gz root@TU_IP_SERVIDOR:/root/
# O con puerto personalizado:
scp -P PUERTO origami.tar.gz root@TU_IP_SERVIDOR:/root/

# En el servidor, descomprimir
ssh root@TU_IP_SERVIDOR
cd /root
tar -xzf origami.tar.gz
cd Origami-Liquid-
```

**Opción B: Usando Git**

```bash
# En el servidor
dnf install -y git
git clone https://github.com/tu-usuario/Origami-Liquid-.git
cd Origami-Liquid-
```

### 3. Subir el archivo BDOrigami.sql (IMPORTANTE)

**Debes subir tu archivo de base de datos antes de ejecutar el deployment:**

```bash
# Desde tu PC Windows
scp BDOrigami.sql root@TU_IP_SERVIDOR:/root/Origami-Liquid-/deployment/database/
# O con puerto personalizado:
scp -P 5760 BDOrigami.sql root@TU_IP_SERVIDOR:/root/Origami-Liquid-/deployment/database/
```

### 4. Convertir line endings y ejecutar deployment

```bash
# En el servidor
cd /root/Origami-Liquid-

# IMPORTANTE: Convertir archivos de Windows a Unix
sed -i 's/\r$//' deployment/deploy.sh
sed -i 's/\r$//' deployment/selinux-policy.sh

# Dar permisos de ejecución
chmod +x deployment/deploy.sh
chmod +x deployment/selinux-policy.sh

# Ejecutar deployment automático
sudo bash deployment/deploy.sh
```

El script instalará automáticamente:

- ✅ .NET 8.0 Runtime y SDK
- ✅ PostgreSQL
- ✅ Nginx
- ✅ Certbot (SSL)
- ✅ Configuración de SELinux
- ✅ Firewalld
- ✅ Base de datos desde BDOrigami.sql (si está en deployment/database/)

**Tiempo estimado**: 10-15 minutos

---

## ⚙️ Configuración Post-Instalación

### 5. Cambiar password de base de datos

El script creó la base de datos con password temporal `CHANGE_THIS_PASSWORD`. **Cámbialo inmediatamente**:

```bash
# Cambiar password del usuario de PostgreSQL
sudo -u postgres psql -c "ALTER USER origami_user WITH PASSWORD 'TU_PASSWORD_SEGURO_AQUI';"

# Verifica que el cambio funcionó
sudo -u postgres psql -c "\du"
```

### 6. Verificar importación de BDOrigami.sql

```bash
# Conectarse a la base de datos
sudo -u postgres psql -d origami_db

-- Ver todas las tablas importadas
\dt

-- Ver cantidad de registros en tablas principales
SELECT 'Productos' as tabla, COUNT(*) as registros FROM productos
UNION ALL
SELECT 'Categorías', COUNT(*) FROM categorias
UNION ALL
SELECT 'Marcas', COUNT(*) FROM marcas
UNION ALL
SELECT 'Usuarios', COUNT(*) FROM usuarios;

-- Ver estructura de una tabla
\d productos

-- Salir
\q
```

Si BDOrigami.sql **no se importó** (no estaba en `deployment/database/`):

```bash
# Subir el archivo ahora
scp BDOrigami.sql root@TU_IP:/tmp/

# En el servidor, importar manualmente
sudo -u postgres psql -d origami_db -f /tmp/BDOrigami.sql
```

### 7. Configurar Connection String del Backend

Edita el archivo de configuración del backend con el password que configuraste:

```bash
nano /var/www/origami-backend/appsettings.Production.json
```

Agrega la configuración completa (usa el password del paso 5):

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=origami_db;Username=origami_user;Password=TU_PASSWORD_SEGURO_AQUI"
  },
  "Jwt": {
    "Key": "CLAVE_JWT_SUPER_SEGURA_MINIMO_64_CARACTERES_AQUI",
    "Issuer": "OrigamiImportados",
    "Audience": "OrigamiImportadosAPI",
    "ExpirationMinutes": 60
  },
  "Serilog": {
    "MinimumLevel": {
      "Default": "Warning",
      "Override": {
        "Microsoft.AspNetCore": "Warning",
        "Microsoft.EntityFrameworkCore": "Warning"
      }
    }
  },
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Error"
    }
  },
  "AllowedHosts": "tu-dominio.com;www.tu-dominio.com",
  "Security": {
    "RequireHttpsMetadata": true,
    "RequireSecureCookies": true
  },
  "Swagger": {
    "EnabledInProduction": false
  }
}
```

**Generar clave JWT segura**:

```bash
openssl rand -base64 64
```

Copia el resultado y úsalo en `Jwt.Key`.

### 8. Configurar Nginx con tu Dominio

```bash
nano /etc/nginx/conf.d/origami.conf
```

Busca y cambia estas líneas:

```nginx
# Cambiar esta línea:
server_name tu-dominio.com www.tu-dominio.com;

# Por tu dominio real:
server_name origamiimportados.com www.origamiimportados.com;
```

Verifica la configuración y reinicia Nginx:

```bash
nginx -t
systemctl restart nginx
```

### 9. Configurar SSL con Let's Encrypt

```bash
certbot --nginx -d origamiimportados.com -d www.origamiimportados.com
```

Sigue las instrucciones interactivas:

1. Ingresa tu email
2. Acepta los términos
3. Elige si quieres compartir tu email (opcional)
4. Certbot configurará automáticamente HTTPS

**Renovación automática**:

```bash
systemctl enable certbot-renew.timer
systemctl start certbot-renew.timer
systemctl status certbot-renew.timer
```

### 10. Reiniciar el Backend

```bash
systemctl restart origami-backend
systemctl status origami-backend

# Ver logs en tiempo real
journalctl -u origami-backend -f
```

---

## 📂 Estructura de Archivos en el Servidor

```
/var/www/
├── origami-backend/          # Backend .NET
│   ├── OrigamiBack.dll
│   ├── appsettings.json
│   ├── appsettings.Production.json  # ← Configuraste aquí
│   └── uploads/              # Imágenes subidas (crear si no existe)
│
└── origami-frontend/         # Frontend estático
    ├── Home.html
    ├── Tienda.html
    ├── DetalleProducto.html
    ├── admin/
    ├── css/
    ├── js/
    ├── img/
    ├── Navbar/
    ├── Footer/
    └── components/

/etc/systemd/system/
└── origami-backend.service   # Servicio del backend

/etc/nginx/conf.d/
└── origami.conf              # Configuración de Nginx

/var/log/
├── origami-backend/          # Logs del backend
└── nginx/                    # Logs de Nginx
    ├── access.log
    └── error.log

/var/lib/pgsql/data/
└── log/                      # Logs de PostgreSQL
```

---

## 🛠️ Comandos Útiles para AlmaLinux

### Gestión de Servicios

```bash
# Ver logs del backend en tiempo real
sudo journalctl -u origami-backend -f

# Ver últimos 100 logs del backend
sudo journalctl -u origami-backend -n 100

# Ver logs con errores
sudo journalctl -u origami-backend -p err

# Reiniciar servicios
sudo systemctl restart origami-backend
sudo systemctl restart nginx
sudo systemctl restart postgresql

# Ver estado de servicios
sudo systemctl status origami-backend
sudo systemctl status nginx
sudo systemctl status postgresql

# Ver todos los servicios a la vez
sudo systemctl status origami-backend nginx postgresql --no-pager
```

### Logs de Nginx

```bash
# Errores
sudo tail -f /var/log/nginx/error.log

# Accesos
sudo tail -f /var/log/nginx/access.log

# Últimas 50 líneas de errores
sudo tail -n 50 /var/log/nginx/error.log
```

### Firewall (firewalld)

```bash
# Ver estado del firewall
sudo firewall-cmd --list-all

# Abrir puerto personalizado
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --reload

# Ver puertos abiertos
sudo firewall-cmd --list-ports

# Ver servicios permitidos
sudo firewall-cmd --list-services

# Cerrar un puerto
sudo firewall-cmd --permanent --remove-port=8080/tcp
sudo firewall-cmd --reload
```

### SELinux

```bash
# Ver estado de SELinux
getenforce

# Ver contextos de archivos
ls -Z /var/www/origami-backend/
ls -Z /var/www/origami-frontend/

# Cambiar contexto si es necesario
sudo chcon -R -t httpd_sys_rw_content_t /var/www/origami-backend/uploads/

# Ver booleans de SELinux
getsebool -a | grep httpd

# Ver denials de SELinux (errores)
sudo ausearch -m avc -ts recent

# Generar política desde denials
sudo ausearch -m avc -ts recent | audit2allow -M mypolicy
sudo semodule -i mypolicy.pp
```

### Base de Datos PostgreSQL

```bash
# Conectarse a PostgreSQL
sudo -u postgres psql

# Conectarse a una base específica
sudo -u postgres psql -d origami_db

# Ejecutar comando SQL directo
sudo -u postgres psql -d origami_db -c "SELECT COUNT(*) FROM productos;"

# Listar bases de datos
sudo -u postgres psql -c "\l"

# Listar usuarios
sudo -u postgres psql -c "\du"

# Ver tamaño de la base de datos
sudo -u postgres psql -c "SELECT pg_size_pretty(pg_database_size('origami_db'));"

# Backup de base de datos
sudo -u postgres pg_dump origami_db > backup_$(date +%Y%m%d).sql

# Backup comprimido
sudo -u postgres pg_dump origami_db | gzip > backup_$(date +%Y%m%d).sql.gz

# Restaurar backup
sudo -u postgres psql -d origami_db -f backup_20241202.sql

# Restaurar desde backup comprimido
gunzip < backup_20241202.sql.gz | sudo -u postgres psql -d origami_db
```

### Actualizar la Aplicación

**Backend:**

```bash
# 1. Desde tu PC, compilar y comprimir
cd E:\Proyectos\Origami-Liquid-\Backend
dotnet publish -c Release -o bin/publish
cd bin/publish
tar -czf backend.tar.gz *

# 2. Subir al servidor
scp backend.tar.gz root@TU_IP:/tmp/
# O con puerto personalizado:
scp -P PUERTO backend.tar.gz root@TU_IP:/tmp/

# 3. En el servidor, detener backend
sudo systemctl stop origami-backend

# 4. Hacer backup del backend actual (opcional pero recomendado)
sudo cp -r /var/www/origami-backend /var/www/origami-backend.backup.$(date +%Y%m%d)

# 5. Extraer nueva versión
cd /var/www/origami-backend
sudo tar -xzf /tmp/backend.tar.gz

# 6. Restaurar permisos
sudo chown -R nginx:nginx /var/www/origami-backend

# 7. Reiniciar backend
sudo systemctl start origami-backend
sudo systemctl status origami-backend
```

**Frontend:**

```bash
# Desde tu PC
scp -r *.html css js img Navbar Footer components admin root@TU_IP:/tmp/frontend/
# O con puerto:
scp -P PUERTO -r *.html css js img root@TU_IP:/tmp/frontend/

# En el servidor
sudo cp -r /tmp/frontend/* /var/www/origami-frontend/
sudo chown -R nginx:nginx /var/www/origami-frontend
```

---

## 🔒 Checklist de Seguridad

- [ ] Cambiar password de PostgreSQL (paso 5)
- [ ] Generar clave JWT segura (64+ caracteres)
- [ ] Configurar firewall (firewalld) - ✅ Ya configurado por script
- [ ] Instalar SSL con Let's Encrypt (paso 9)
- [ ] Deshabilitar acceso root por SSH
- [ ] Configurar fail2ban (opcional)
- [ ] Backup automático de base de datos
- [ ] Actualizar SELinux contexts - ✅ Ya configurado por script
- [ ] Cambiar `AllowedHosts` en appsettings.Production.json

### Deshabilitar Root SSH

```bash
# 1. Crear usuario no-root
adduser origami
passwd origami

# 2. Agregar a sudo (wheel group en AlmaLinux)
usermod -aG wheel origami

# 3. Probar acceso SSH con nuevo usuario (en otra terminal)
ssh origami@TU_IP

# 4. Una vez confirmado que funciona, deshabilitar root
nano /etc/ssh/sshd_config

# Buscar y cambiar:
PermitRootLogin no

# Reiniciar SSH
systemctl restart sshd
```

### Instalar Fail2Ban

```bash
# Instalar
dnf install -y fail2ban

# Configurar para SSH
cat > /etc/fail2ban/jail.local <<EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
logpath = /var/log/secure
EOF

# Iniciar y habilitar
systemctl enable fail2ban
systemctl start fail2ban

# Ver estado
fail2ban-client status
fail2ban-client status sshd
```

---

## 🔄 Backup Automático de Base de Datos

### Crear script de backup

```bash
# Crear directorio para backups
mkdir -p /root/backups

# Crear script
cat > /root/backup-db.sh <<'EOF'
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup de la base de datos
sudo -u postgres pg_dump origami_db | gzip > $BACKUP_DIR/origami_$DATE.sql.gz

# Eliminar backups más antiguos de 7 días
find $BACKUP_DIR -name "origami_*.sql.gz" -mtime +7 -delete

echo "Backup completado: $DATE"
EOF

# Dar permisos de ejecución
chmod +x /root/backup-db.sh

# Probar el script
/root/backup-db.sh

# Ver backups creados
ls -lh /root/backups/
```

### Programar backup automático diario

```bash
# Editar crontab
crontab -e

# Agregar esta línea (ejecuta diario a las 2 AM)
0 2 * * * /root/backup-db.sh >> /var/log/backup.log 2>&1

# Verificar que se agregó
crontab -l
```

### Restaurar desde backup

```bash
# Listar backups disponibles
ls -lh /root/backups/

# Restaurar un backup específico
gunzip < /root/backups/origami_20241202_020000.sql.gz | sudo -u postgres psql -d origami_db
```

---

## 🐛 Troubleshooting

### El backend no inicia

```bash
# Ver logs detallados
sudo journalctl -u origami-backend -xe

# Ver últimos errores
sudo journalctl -u origami-backend -p err -n 50

# Verificar permisos
sudo chown -R nginx:nginx /var/www/origami-backend

# Verificar que .NET está instalado
dotnet --version

# Probar ejecutar manualmente
cd /var/www/origami-backend
sudo -u nginx dotnet OrigamiBack.dll
```

### Error de conexión a PostgreSQL

```bash
# Verificar que PostgreSQL está corriendo
sudo systemctl status postgresql

# Probar conexión
sudo -u postgres psql -d origami_db

# Con el usuario de la aplicación
psql -h localhost -U origami_user -d origami_db

# Ver logs de PostgreSQL
sudo tail -f /var/lib/pgsql/data/log/postgresql-*.log

# Verificar que el usuario existe
sudo -u postgres psql -c "\du"

# Ver conexiones activas
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity WHERE datname = 'origami_db';"
```

### Nginx error 502 Bad Gateway

```bash
# Verificar que el backend está corriendo
sudo systemctl status origami-backend

# Verificar puerto 5000
sudo ss -tulpn | grep 5000
sudo netstat -tulpn | grep 5000

# Verificar SELinux
sudo setsebool -P httpd_can_network_connect 1
sudo ausearch -m avc -ts recent

# Ver logs de Nginx
sudo tail -f /var/log/nginx/error.log

# Probar conexión local al backend
curl http://localhost:5000/health
curl http://localhost:5000/api
```

### Error de permisos SELinux

```bash
# Ver denials de SELinux
sudo ausearch -m avc -ts recent

# Configurar contextos correctos
sudo semanage fcontext -a -t httpd_sys_rw_content_t "/var/www/origami-backend(/.*)?"
sudo restorecon -Rv /var/www/origami-backend

# Permitir conexiones de red para Nginx
sudo setsebool -P httpd_can_network_connect 1
sudo setsebool -P httpd_can_network_relay 1

# Generar política personalizada si es necesario
sudo ausearch -m avc -ts recent | audit2allow -M mypolicy
sudo semodule -i mypolicy.pp

# Ejecutar script de configuración de SELinux
sudo bash deployment/selinux-policy.sh
```

### Firewall bloqueando conexiones

```bash
# Ver logs del firewall
sudo journalctl -u firewalld -f

# Verificar reglas
sudo firewall-cmd --list-all

# Ver conexiones bloqueadas
sudo journalctl -k | grep -i dropped

# Abrir puertos HTTP/HTTPS si no están abiertos
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### Error "line endings" al ejecutar scripts

```bash
# Convertir scripts de Windows a Unix
sed -i 's/\r$//' deployment/deploy.sh
sed -i 's/\r$//' deployment/selinux-policy.sh

# O instalar dos2unix
dnf install -y dos2unix
dos2unix deployment/*.sh
```

### Base de datos no importó BDOrigami.sql

```bash
# Verificar si existe el archivo
ls -lh deployment/database/BDOrigami.sql

# Si no existe, subirlo
scp BDOrigami.sql root@TU_IP:/tmp/

# Importar manualmente
sudo -u postgres psql -d origami_db -f /tmp/BDOrigami.sql

# Ver si hay errores
sudo -u postgres psql -d origami_db -f /tmp/BDOrigami.sql -v ON_ERROR_STOP=1
```

---

## 📊 Monitoreo

### Ver uso de recursos

```bash
# CPU y RAM
top

# Versión mejorada
htop  # Instalar con: dnf install -y htop

# Espacio en disco
df -h

# Uso de memoria
free -h

# Procesos del backend
ps aux | grep dotnet

# Conexiones de red activas
ss -tulpn

# Ver uso de CPU por proceso
ps aux --sort=-%cpu | head -10

# Ver uso de RAM por proceso
ps aux --sort=-%mem | head -10
```

### Health Checks

```bash
# Backend API
curl http://localhost:5000/health

# Frontend
curl http://localhost

# Con dominio
curl https://origamiimportados.com/api/health

# Ver headers de respuesta
curl -I https://origamiimportados.com
```

### Estadísticas de Nginx

```bash
# Total de peticiones
cat /var/log/nginx/access.log | wc -l

# Top 10 IPs que más acceden
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -10

# Códigos de respuesta HTTP
awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c | sort -nr

# URLs más visitadas
awk '{print $7}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -20

# Peticiones por hora
awk '{print $4}' /var/log/nginx/access.log | cut -d: -f2 | sort | uniq -c
```

---

## 📦 Diferencias clave AlmaLinux vs Ubuntu

| Aspecto                | AlmaLinux 9                 | Ubuntu                        |
| ---------------------- | --------------------------- | ----------------------------- |
| Gestor de paquetes     | `dnf`                       | `apt`                         |
| Firewall               | `firewalld`                 | `ufw`                         |
| SELinux                | Activado por defecto        | AppArmor                      |
| Usuario web            | `nginx:nginx`               | `www-data:www-data`           |
| Nginx config           | `/etc/nginx/conf.d/`        | `/etc/nginx/sites-available/` |
| PostgreSQL init        | `postgresql-setup --initdb` | Automático                    |
| Logs de sistema        | `journalctl`                | `journalctl` / `/var/log/`    |
| Servicio de tiempo     | `chronyd`                   | `systemd-timesyncd`           |
| Herramientas de red    | `ss`, `ip`                  | `netstat`, `ifconfig`         |
| Gestor de paquetes pip | `dnf install python3-pip`   | `apt install python3-pip`     |

---

## 🎉 ¡Listo!

Tu aplicación debería estar funcionando en:

- **Frontend**: https://origamiimportados.com
- **API**: https://origamiimportados.com/api
- **Admin**: https://origamiimportados.com/admin
- **Health Check**: https://origamiimportados.com/health

### Verificación final:

```bash
# Verificar todos los servicios
sudo systemctl status origami-backend nginx postgresql firewalld --no-pager

# Verificar puertos abiertos
sudo ss -tulpn | grep -E ':(80|443|5000|5432)'

# Verificar firewall
sudo firewall-cmd --list-all

# Verificar SELinux
sudo getenforce

# Verificar base de datos
sudo -u postgres psql -d origami_db -c "SELECT COUNT(*) FROM productos;"

# Prueba completa
curl -I https://origamiimportados.com
curl https://origamiimportados.com/health
```

---

## 📞 Soporte

Si tienes problemas:

1. **Logs del backend**: `sudo journalctl -u origami-backend -f`
2. **Logs de Nginx**: `sudo tail -f /var/log/nginx/error.log`
3. **SELinux denials**: `sudo ausearch -m avc -ts recent`
4. **Firewall**: `sudo firewall-cmd --list-all`
5. **PostgreSQL**: `sudo tail -f /var/lib/pgsql/data/log/postgresql-*.log`

**Comandos de diagnóstico rápido**:

```bash
# Todo en uno
echo "=== BACKEND ===" && sudo systemctl status origami-backend --no-pager && \
echo "" && echo "=== NGINX ===" && sudo systemctl status nginx --no-pager && \
echo "" && echo "=== DATABASE ===" && sudo systemctl status postgresql --no-pager && \
echo "" && echo "=== FIREWALL ===" && sudo firewall-cmd --list-all && \
echo "" && echo "=== SELINUX ===" && getenforce && \
echo "" && echo "=== PUERTOS ===" && sudo ss -tulpn | grep -E ':(80|443|5000|5432)' && \
echo "" && echo "=== DISCO ===" && df -h && \
echo "" && echo "=== MEMORIA ===" && free -h
```

---

**Última actualización**: 2024-12-02
