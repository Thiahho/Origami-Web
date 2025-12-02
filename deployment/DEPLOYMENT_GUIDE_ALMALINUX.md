# Guía de Deployment - Origami Importados
## AlmaLinux 9 - DonWeb Cloud Server

Esta guía te ayudará a desplegar tu aplicación en un servidor cloud de DonWeb con AlmaLinux 9, usando solo línea de comandos.

---

## 📋 Requisitos Previos

1. **Servidor AlmaLinux 9 (64 bits)**
2. **Acceso SSH root o sudo**
3. **Dominio apuntando al servidor** (opcional pero recomendado)
4. **Mínimo 2GB RAM, 20GB disco**

---

## 🚀 Instalación Rápida (Método Automático)

### 1. Conectarse al servidor
```bash
ssh root@TU_IP_SERVIDOR
```

### 2. Subir el proyecto al servidor

**Opción A: Usando SCP (desde tu PC local)**
```bash
# Comprimir el proyecto en tu PC
cd E:\Proyectos
tar -czf origami.tar.gz Origami-Liquid-

# Subir al servidor
scp origami.tar.gz root@TU_IP_SERVIDOR:/root/

# En el servidor, descomprimir
ssh root@TU_IP_SERVIDOR
cd /root
tar -xzf origami.tar.gz
cd Origami-Liquid-
```

**Opción B: Usando Git**
```bash
dnf install -y git
git clone https://github.com/tu-usuario/Origami-Liquid-.git
cd Origami-Liquid-
```

### 3. Ejecutar el script de deployment
```bash
chmod +x deployment/deploy.sh
sudo bash deployment/deploy.sh
```

El script instalará automáticamente:
- ✅ .NET 8.0 Runtime y SDK
- ✅ PostgreSQL
- ✅ Nginx
- ✅ Certbot (SSL)
- ✅ Configuración de SELinux
- ✅ Firewalld

**Tiempo estimado**: 10-15 minutos

---

## ⚙️ Configuración Post-Instalación

### 4. Configurar la Base de Datos PostgreSQL

```bash
# Crear base de datos y usuario
sudo -u postgres psql <<EOF
CREATE DATABASE origami_db;
CREATE USER origami_user WITH PASSWORD 'PASSWORD_SEGURO_123';
GRANT ALL PRIVILEGES ON DATABASE origami_db TO origami_user;
\q
EOF
```

**Importante**: Cambia `PASSWORD_SEGURO_123` por una contraseña fuerte.

### 5. Configurar Connection String del Backend

Edita el archivo de configuración:
```bash
nano /var/www/origami-backend/appsettings.Production.json
```

Agrega la configuración completa:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=origami_db;Username=origami_user;Password=PASSWORD_SEGURO_123"
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
  "AllowedHosts": "tu-dominio.com;www.tu-dominio.com",
  "Security": {
    "RequireHttpsMetadata": true
  }
}
```

**Generar clave JWT segura**:
```bash
openssl rand -base64 64
```

Copia el resultado y úsalo en `Jwt.Key`.

### 6. Ejecutar Migraciones de Base de Datos

```bash
cd /var/www/origami-backend
dotnet ef database update --project /root/Origami-Liquid-/Backend
```

Si `dotnet ef` no está instalado:
```bash
dotnet tool install --global dotnet-ef
export PATH="$PATH:/root/.dotnet/tools"
```

### 7. Configurar Nginx con tu Dominio

```bash
nano /etc/nginx/conf.d/origami.conf
```

Cambia `tu-dominio.com` por tu dominio real:
```nginx
server_name origamiimportados.com www.origamiimportados.com;
```

Verifica y reinicia Nginx:
```bash
nginx -t
systemctl restart nginx
```

### 8. Configurar SSL con Let's Encrypt

```bash
certbot --nginx -d origamiimportados.com -d www.origamiimportados.com
```

Sigue las instrucciones interactivas. Certbot configurará automáticamente HTTPS.

**Renovación automática**:
```bash
systemctl enable certbot-renew.timer
systemctl start certbot-renew.timer
```

### 9. Reiniciar el Backend

```bash
systemctl restart origami-backend
systemctl status origami-backend
```

---

## 📂 Estructura de Archivos en el Servidor

```
/var/www/
├── origami-backend/          # Backend .NET
│   ├── OrigamiBack.dll
│   ├── appsettings.Production.json
│   └── uploads/              # Imágenes subidas
│
└── origami-frontend/         # Frontend estático
    ├── Home.html
    ├── Tienda.html
    ├── admin/
    ├── css/
    ├── js/
    └── img/

/etc/systemd/system/
└── origami-backend.service   # Servicio del backend

/etc/nginx/conf.d/
└── origami.conf              # Configuración de Nginx

/var/log/
├── origami-backend/          # Logs del backend
└── nginx/                    # Logs de Nginx
```

---

## 🛠️ Comandos Útiles para AlmaLinux

### Gestión de Servicios

```bash
# Ver logs del backend en tiempo real
sudo journalctl -u origami-backend -f

# Ver últimos 100 logs del backend
sudo journalctl -u origami-backend -n 100

# Reiniciar servicios
sudo systemctl restart origami-backend
sudo systemctl restart nginx
sudo systemctl restart postgresql

# Ver estado de servicios
sudo systemctl status origami-backend
sudo systemctl status nginx
sudo systemctl status postgresql
```

### Logs de Nginx

```bash
# Errores
sudo tail -f /var/log/nginx/error.log

# Accesos
sudo tail -f /var/log/nginx/access.log
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
```

### SELinux

```bash
# Ver estado de SELinux
getenforce

# Ver contextos de archivos
ls -Z /var/www/origami-backend/

# Cambiar contexto si es necesario
sudo chcon -R -t httpd_sys_rw_content_t /var/www/origami-backend/uploads/

# Ver booleans de SELinux
getsebool -a | grep httpd
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

# 3. En el servidor, extraer y reiniciar
sudo systemctl stop origami-backend
cd /var/www/origami-backend
sudo tar -xzf /tmp/backend.tar.gz
sudo chown -R nginx:nginx /var/www/origami-backend
sudo systemctl start origami-backend
```

**Frontend:**
```bash
# Desde tu PC
scp -r *.html css js img root@TU_IP:/var/www/origami-frontend/

# En el servidor
sudo chown -R nginx:nginx /var/www/origami-frontend
```

---

## 🔒 Checklist de Seguridad

- [ ] Cambiar password de PostgreSQL
- [ ] Generar clave JWT segura (64+ caracteres)
- [ ] Configurar firewall (firewalld)
- [ ] Instalar SSL con Let's Encrypt
- [ ] Deshabilitar acceso root por SSH
- [ ] Configurar fail2ban (opcional)
- [ ] Backup automático de base de datos
- [ ] Actualizar SELinux contexts

### Deshabilitar Root SSH

```bash
# 1. Crear usuario no-root
adduser origami
passwd origami
usermod -aG wheel origami

# 2. Probar acceso SSH con nuevo usuario
ssh origami@TU_IP

# 3. Deshabilitar root
nano /etc/ssh/sshd_config
# Cambiar: PermitRootLogin no

systemctl restart sshd
```

### Instalar Fail2Ban

```bash
dnf install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban

# Configurar para SSH
cat > /etc/fail2ban/jail.local <<EOF
[sshd]
enabled = true
port = ssh
logpath = /var/log/secure
maxretry = 5
bantime = 3600
EOF

systemctl restart fail2ban
```

---

## 🔄 Backup de Base de Datos

### Backup Manual

```bash
# Crear backup
sudo -u postgres pg_dump origami_db | gzip > /root/backups/origami_$(date +%Y%m%d_%H%M%S).sql.gz

# Restaurar backup
gunzip < /root/backups/origami_20241202.sql.gz | sudo -u postgres psql origami_db
```

### Backup Automático Diario

```bash
# Crear directorio
mkdir -p /root/backups

# Crear script
cat > /root/backup-db.sh <<'EOF'
#!/bin/bash
BACKUP_DIR="/root/backups"
mkdir -p $BACKUP_DIR
sudo -u postgres pg_dump origami_db | gzip > $BACKUP_DIR/origami_$(date +%Y%m%d_%H%M%S).sql.gz
find $BACKUP_DIR -name "origami_*.sql.gz" -mtime +7 -delete
echo "Backup completado: $(date)"
EOF

chmod +x /root/backup-db.sh

# Agregar a crontab (diario a las 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /root/backup-db.sh >> /var/log/backup.log 2>&1") | crontab -
```

---

## 🐛 Troubleshooting

### El backend no inicia

```bash
# Ver logs detallados
sudo journalctl -u origami-backend -xe

# Verificar permisos
sudo chown -R nginx:nginx /var/www/origami-backend

# Verificar SELinux
sudo ausearch -m avc -ts recent
```

### Error de conexión a PostgreSQL

```bash
# Verificar que PostgreSQL está corriendo
sudo systemctl status postgresql

# Probar conexión
psql -h localhost -U origami_user -d origami_db

# Ver logs de PostgreSQL
sudo tail -f /var/lib/pgsql/data/log/postgresql-*.log
```

### Nginx error 502 Bad Gateway

```bash
# Verificar que el backend está corriendo
sudo systemctl status origami-backend

# Verificar puerto
ss -tulpn | grep 5000

# Verificar SELinux
sudo setsebool -P httpd_can_network_connect 1
```

### Error de permisos SELinux

```bash
# Ver denials de SELinux
sudo ausearch -m avc -ts recent

# Configurar contextos correctos
sudo semanage fcontext -a -t httpd_sys_rw_content_t "/var/www/origami-backend(/.*)?"
sudo restorecon -Rv /var/www/origami-backend

# Generar política personalizada si es necesario
sudo ausearch -m avc -ts recent | audit2allow -M mypolicy
sudo semodule -i mypolicy.pp
```

### Firewall bloqueando conexiones

```bash
# Ver logs del firewall
sudo journalctl -u firewalld -f

# Verificar reglas
sudo firewall-cmd --list-all

# Ver conexiones bloqueadas
sudo journalctl -k | grep -i dropped
```

---

## 📊 Monitoreo

### Ver uso de recursos

```bash
# CPU y RAM
top
# o
htop  # (instalar con: dnf install -y htop)

# Espacio en disco
df -h

# Uso de memoria
free -h

# Conexiones activas
ss -tulpn
```

### Health Checks

```bash
# Backend API
curl http://localhost:5000/health

# Frontend
curl http://localhost

# Con dominio
curl https://tu-dominio.com/api/health
```

### Estadísticas de Nginx

```bash
# Conexiones activas
cat /var/log/nginx/access.log | wc -l

# Top 10 IPs
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -10

# Códigos de respuesta
awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c | sort -nr
```

---

## 📦 Diferencias clave AlmaLinux vs Ubuntu

| Aspecto | AlmaLinux 9 | Ubuntu |
|---------|-------------|--------|
| Gestor de paquetes | `dnf` | `apt` |
| Firewall | `firewalld` | `ufw` |
| SELinux | Activado por defecto | AppArmor |
| Usuario web | `nginx:nginx` | `www-data:www-data` |
| Nginx config | `/etc/nginx/conf.d/` | `/etc/nginx/sites-available/` |
| PostgreSQL init | `postgresql-setup --initdb` | Automático |

---

## 🎉 ¡Listo!

Tu aplicación debería estar funcionando en:
- **Frontend**: https://tu-dominio.com
- **API**: https://tu-dominio.com/api
- **Admin**: https://tu-dominio.com/admin
- **Health Check**: https://tu-dominio.com/health

### Verificación final:

```bash
# Verificar todos los servicios
sudo systemctl status origami-backend nginx postgresql firewalld

# Verificar puertos
sudo ss -tulpn | grep -E ':(80|443|5000|5432)'

# Verificar firewall
sudo firewall-cmd --list-all

# Verificar SELinux
sudo getenforce
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
echo "=== NGINX ===" && sudo systemctl status nginx --no-pager && \
echo "=== DATABASE ===" && sudo systemctl status postgresql --no-pager && \
echo "=== FIREWALL ===" && sudo firewall-cmd --list-all && \
echo "=== SELINUX ===" && getenforce && \
echo "=== PUERTOS ===" && sudo ss -tulpn | grep -E ':(80|443|5000|5432)'
```
