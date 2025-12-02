# Deployment - Origami Importados
## AlmaLinux 9 Cloud Server (DonWeb)

Archivos de configuración para desplegar la aplicación en un servidor AlmaLinux 9 sin panel administrativo.

---

## 📁 Archivos Incluidos

```
deployment/
├── deploy.sh                           # Script de instalación automática
├── origami-backend.service             # Servicio systemd para el backend
├── nginx.conf                          # Configuración de Nginx
├── selinux-policy.sh                   # Configuración de SELinux
├── .env.production.example             # Variables de entorno (ejemplo)
├── DEPLOYMENT_GUIDE_ALMALINUX.md       # Guía completa paso a paso
└── README.md                           # Este archivo
```

---

## 🚀 Instalación Rápida

### 1. Subir proyecto al servidor

```bash
# Desde tu PC local (Windows)
cd E:\Proyectos
tar -czf origami.tar.gz Origami-Liquid-
scp origami.tar.gz root@TU_IP_SERVIDOR:/root/
```

### 2. En el servidor, ejecutar deployment

```bash
ssh root@TU_IP_SERVIDOR
cd /root
tar -xzf origami.tar.gz
cd Origami-Liquid-

# Ejecutar instalación
chmod +x deployment/deploy.sh
sudo bash deployment/deploy.sh
```

### 3. Configurar base de datos

```bash
# Crear DB y usuario
sudo -u postgres psql -c "CREATE DATABASE origami_db;"
sudo -u postgres psql -c "CREATE USER origami_user WITH PASSWORD 'TU_PASSWORD';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE origami_db TO origami_user;"
```

### 4. Editar configuración del backend

```bash
nano /var/www/origami-backend/appsettings.Production.json
```

Agregar:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=origami_db;Username=origami_user;Password=TU_PASSWORD"
  },
  "Jwt": {
    "Key": "GENERA_CLAVE_SEGURA_CON_openssl_rand_base64_64",
    "Issuer": "OrigamiImportados",
    "Audience": "OrigamiImportadosAPI",
    "ExpirationMinutes": 60
  }
}
```

### 5. Configurar dominio y SSL

```bash
# Editar Nginx
nano /etc/nginx/conf.d/origami.conf
# Cambiar: server_name tu-dominio.com www.tu-dominio.com;

# Reiniciar Nginx
systemctl restart nginx

# Instalar SSL
certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
```

### 6. Reiniciar servicios

```bash
systemctl restart origami-backend
systemctl status origami-backend
```

---

## 📖 Documentación Completa

Para una guía detallada con troubleshooting, monitoreo y comandos útiles:
👉 **[DEPLOYMENT_GUIDE_ALMALINUX.md](./DEPLOYMENT_GUIDE_ALMALINUX.md)**

---

## ✅ Verificación Post-Instalación

```bash
# Verificar servicios
systemctl status origami-backend
systemctl status nginx
systemctl status postgresql

# Verificar puertos
ss -tulpn | grep -E ':(80|443|5000)'

# Verificar firewall
firewall-cmd --list-all

# Verificar SELinux
getenforce
```

---

## 🔧 Comandos Útiles

### Ver logs
```bash
# Backend
journalctl -u origami-backend -f

# Nginx
tail -f /var/log/nginx/error.log
```

### Reiniciar servicios
```bash
systemctl restart origami-backend
systemctl restart nginx
```

### Actualizar aplicación
```bash
# Backend
cd /var/www/origami-backend
# Subir nuevos archivos compilados
systemctl restart origami-backend

# Frontend
# Subir archivos HTML/CSS/JS a /var/www/origami-frontend
```

---

## 🛡️ Seguridad

- ✅ Firewall configurado (firewalld)
- ✅ SELinux en modo enforcing
- ✅ SSL con Let's Encrypt
- ✅ Servicio corriendo como usuario no-root (nginx)
- ⚠️ Cambiar passwords por defecto
- ⚠️ Generar JWT secret seguro

---

## 🐛 Troubleshooting Rápido

### Backend no inicia
```bash
journalctl -u origami-backend -xe
chown -R nginx:nginx /var/www/origami-backend
```

### Error 502 Bad Gateway
```bash
systemctl status origami-backend
setsebool -P httpd_can_network_connect 1
```

### Error de permisos SELinux
```bash
ausearch -m avc -ts recent
bash deployment/selinux-policy.sh
```

---

## 📊 Estructura en el Servidor

```
/var/www/
├── origami-backend/          # Backend .NET
│   ├── OrigamiBack.dll
│   ├── appsettings.Production.json
│   └── uploads/
└── origami-frontend/         # Frontend estático
    ├── *.html
    ├── css/
    ├── js/
    └── img/

/etc/nginx/conf.d/
└── origami.conf              # Config Nginx

/etc/systemd/system/
└── origami-backend.service   # Servicio
```

---

## 🔄 Backup Automático

```bash
# Ejecutar una vez
mkdir -p /root/backups
cat > /root/backup-db.sh <<'EOF'
#!/bin/bash
sudo -u postgres pg_dump origami_db | gzip > /root/backups/origami_$(date +%Y%m%d).sql.gz
find /root/backups -name "*.sql.gz" -mtime +7 -delete
EOF
chmod +x /root/backup-db.sh

# Agregar a cron (diario a las 2 AM)
(crontab -l; echo "0 2 * * * /root/backup-db.sh") | crontab -
```

---

## 📞 Soporte

**Logs principales**:
- Backend: `journalctl -u origami-backend -f`
- Nginx: `/var/log/nginx/error.log`
- PostgreSQL: `/var/lib/pgsql/data/log/`
- SELinux: `ausearch -m avc -ts recent`

**Diagnóstico completo**:
```bash
systemctl status origami-backend nginx postgresql --no-pager
firewall-cmd --list-all
getenforce
ss -tulpn | grep -E ':(80|443|5000|5432)'
```

---

## 🎯 Stack Tecnológico

- **OS**: AlmaLinux 9 (64 bits)
- **Web Server**: Nginx
- **Backend**: ASP.NET Core 8.0
- **Database**: PostgreSQL
- **Runtime**: .NET 8.0
- **SSL**: Let's Encrypt (Certbot)
- **Firewall**: firewalld
- **Security**: SELinux (enforcing)

---

## 📝 Notas Importantes

1. **SELinux**: AlmaLinux tiene SELinux habilitado por defecto. Usa `selinux-policy.sh` para configurarlo.
2. **Firewall**: Se usa `firewalld` en lugar de `ufw`.
3. **Usuario web**: Nginx corre como `nginx:nginx` (no `www-data`).
4. **PostgreSQL**: Requiere inicialización con `postgresql-setup --initdb`.
5. **Nginx config**: Va en `/etc/nginx/conf.d/` (no `sites-available`).

---

¡Listo para deployment! 🚀
