#!/bin/bash

# Script de configuración SELinux para Origami Importados
# AlmaLinux 9 / RHEL 9
# Ejecutar con: sudo bash selinux-policy.sh

set -e

echo "=== Configurando SELinux para Origami Importados ==="

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Verificar que SELinux está habilitado
if [ "$(getenforce)" == "Disabled" ]; then
    print_warning "SELinux está deshabilitado. Se recomienda habilitarlo para producción."
    echo "Para habilitar SELinux:"
    echo "1. Edita /etc/selinux/config y cambia SELINUX=enforcing"
    echo "2. Reinicia el servidor: reboot"
    exit 0
fi

print_info "SELinux está en modo: $(getenforce)"

# Directorios de la aplicación
BACKEND_DIR="/var/www/origami-backend"
FRONTEND_DIR="/var/www/origami-frontend"
UPLOADS_DIR="$BACKEND_DIR/uploads"
LOG_DIR="/var/log/origami-backend"

# 1. Configurar contextos para Nginx
print_info "Configurando contextos de archivos para Nginx..."

# Frontend (solo lectura para Nginx)
chcon -R -t httpd_sys_content_t $FRONTEND_DIR

# Backend (lectura/escritura para la aplicación)
chcon -R -t httpd_sys_rw_content_t $BACKEND_DIR

# Uploads (lectura/escritura)
mkdir -p $UPLOADS_DIR
chcon -R -t httpd_sys_rw_content_t $UPLOADS_DIR

# Logs (lectura/escritura)
mkdir -p $LOG_DIR
chcon -R -t httpd_log_t $LOG_DIR

# 2. Configurar booleans de SELinux
print_info "Configurando booleans de SELinux..."

# Permitir que Nginx se conecte a la red (necesario para proxy reverso)
setsebool -P httpd_can_network_connect 1

# Permitir que Nginx actúe como relay
setsebool -P httpd_can_network_relay 1

# Permitir que Nginx se conecte a bases de datos (si usas conexión directa)
# setsebool -P httpd_can_network_connect_db 1

# Permitir envío de emails (si usas SMTP)
# setsebool -P httpd_can_sendmail 1

# 3. Hacer contextos persistentes
print_info "Haciendo contextos persistentes..."

semanage fcontext -a -t httpd_sys_content_t "$FRONTEND_DIR(/.*)?"
semanage fcontext -a -t httpd_sys_rw_content_t "$BACKEND_DIR(/.*)?"
semanage fcontext -a -t httpd_sys_rw_content_t "$UPLOADS_DIR(/.*)?"
semanage fcontext -a -t httpd_log_t "$LOG_DIR(/.*)?"

# 4. Restaurar contextos
print_info "Aplicando contextos..."
restorecon -Rv $FRONTEND_DIR
restorecon -Rv $BACKEND_DIR
restorecon -Rv $UPLOADS_DIR
restorecon -Rv $LOG_DIR

# 5. Permitir que systemd ejecute .NET
print_info "Configurando permisos para .NET runtime..."

# Permitir que el ejecutable de dotnet se ejecute
chcon -t bin_t /usr/bin/dotnet || true

# 6. Verificar configuración
print_info "Verificando configuración..."

echo ""
echo "=== Booleans de SELinux configurados ==="
getsebool httpd_can_network_connect
getsebool httpd_can_network_relay

echo ""
echo "=== Contextos de archivos ==="
ls -Z $FRONTEND_DIR | head -5
ls -Z $BACKEND_DIR | head -5

echo ""
print_info "Configuración de SELinux completada!"
print_warning "Si tienes problemas, revisa los logs de SELinux con:"
echo "  sudo ausearch -m avc -ts recent"
echo ""
print_warning "Para generar una política personalizada desde los denials:"
echo "  sudo ausearch -m avc -ts recent | audit2allow -M mypolicy"
echo "  sudo semodule -i mypolicy.pp"
