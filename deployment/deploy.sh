#!/bin/bash

# Script de deployment para Origami Importados
# AlmaLinux 9 / RHEL 9
# Ejecutar con: sudo bash deploy.sh

set -e  # Detener si hay errores

echo "=== Deployment de Origami Importados - AlmaLinux 9 ==="

# Variables
APP_NAME="origami-backend"
BACKEND_DIR="/var/www/origami-backend"
FRONTEND_DIR="/var/www/origami-frontend"
SERVICE_NAME="origami-backend.service"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que se está ejecutando como root
if [ "$EUID" -ne 0 ]; then
    print_error "Por favor ejecuta este script como root (sudo)"
    exit 1
fi

# Verificar que es AlmaLinux/RHEL
if [ ! -f /etc/redhat-release ]; then
    print_warning "Este script está optimizado para AlmaLinux/RHEL"
fi

# 1. Actualizar el sistema
print_info "Actualizando sistema..."
dnf update -y

# 2. Instalar repositorio de .NET
print_info "Configurando repositorio de .NET..."
dnf install -y wget
wget https://packages.microsoft.com/config/rhel/9/packages-microsoft-prod.rpm -O packages-microsoft-prod.rpm
rpm -Uvh packages-microsoft-prod.rpm
rm -f packages-microsoft-prod.rpm

# 3. Instalar EPEL (Extra Packages for Enterprise Linux)
print_info "Instalando repositorio EPEL..."
dnf install -y epel-release

# 4. Instalar dependencias necesarias
print_info "Instalando dependencias..."
dnf install -y nginx postgresql-server postgresql-contrib dotnet-runtime-8.0 dotnet-sdk-8.0 certbot python3-certbot-nginx git

# 5. Inicializar y configurar PostgreSQL
print_info "Inicializando PostgreSQL..."
postgresql-setup --initdb
systemctl enable postgresql
systemctl start postgresql

# 6. Crear directorios
print_info "Creando directorios..."
mkdir -p $BACKEND_DIR
mkdir -p $FRONTEND_DIR
mkdir -p /var/log/origami-backend

# 7. Copiar archivos del backend
print_info "Desplegando backend..."
if [ -d "Backend" ]; then
    cd Backend
    dotnet publish -c Release -o $BACKEND_DIR
    cd ..
else
    print_error "No se encuentra el directorio Backend"
    exit 1
fi

# 8. Copiar archivos del frontend
print_info "Desplegando frontend..."
cp -r *.html $FRONTEND_DIR/ 2>/dev/null || true
cp -r css $FRONTEND_DIR/ 2>/dev/null || true
cp -r js $FRONTEND_DIR/ 2>/dev/null || true
cp -r scripts $FRONTEND_DIR/ 2>/dev/null || true
cp -r img $FRONTEND_DIR/ 2>/dev/null || true
cp -r Navbar $FRONTEND_DIR/ 2>/dev/null || true
cp -r Footer $FRONTEND_DIR/ 2>/dev/null || true
cp -r Nosotros $FRONTEND_DIR/ 2>/dev/null || true
cp -r admin $FRONTEND_DIR/ 2>/dev/null || true
cp -r auth $FRONTEND_DIR/ 2>/dev/null || true
cp -r components $FRONTEND_DIR/ 2>/dev/null || true

# 9. Configurar permisos (nginx:nginx en AlmaLinux)
print_info "Configurando permisos..."
chown -R nginx:nginx $BACKEND_DIR
chown -R nginx:nginx $FRONTEND_DIR
chown -R nginx:nginx /var/log/origami-backend
chmod -R 755 $FRONTEND_DIR
chmod -R 750 $BACKEND_DIR

# 10. Configurar SELinux para .NET
print_info "Configurando SELinux..."
setsebool -P httpd_can_network_connect 1
setsebool -P httpd_can_network_relay 1
chcon -R -t httpd_sys_content_t $FRONTEND_DIR
chcon -R -t httpd_sys_rw_content_t $BACKEND_DIR

# 11. Copiar y habilitar servicio systemd
print_info "Configurando servicio systemd..."
cp deployment/origami-backend.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable $SERVICE_NAME
systemctl start $SERVICE_NAME

# 12. Configurar Nginx
print_info "Configurando Nginx..."
cp deployment/nginx.conf /etc/nginx/conf.d/origami.conf
nginx -t && systemctl enable nginx && systemctl restart nginx

# 13. Configurar firewall (firewalld en AlmaLinux)
print_info "Configurando firewall..."
systemctl enable firewalld
systemctl start firewalld
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --permanent --add-service=ssh
firewall-cmd --reload

# 14. Verificar estado de servicios
print_info "Verificando servicios..."
systemctl status $SERVICE_NAME --no-pager
systemctl status nginx --no-pager

print_info "¡Deployment completado!"
echo ""
print_warning "Próximos pasos:"
echo "1. Edita /etc/nginx/conf.d/origami.conf y cambia 'tu-dominio.com' por tu dominio real"
echo "2. Crea la base de datos PostgreSQL:"
echo "   sudo -u postgres psql -c \"CREATE DATABASE origami_db;\""
echo "   sudo -u postgres psql -c \"CREATE USER origami_user WITH PASSWORD 'tu_password';\""
echo "   sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE origami_db TO origami_user;\""
echo "3. Edita $BACKEND_DIR/appsettings.Production.json con tu connection string"
echo "4. Reinicia el backend: sudo systemctl restart $SERVICE_NAME"
echo "5. Configura SSL con: sudo certbot --nginx -d tu-dominio.com"
echo ""
print_info "Logs del backend: sudo journalctl -u $SERVICE_NAME -f"
print_info "Logs de Nginx: sudo tail -f /var/log/nginx/error.log"
print_info "Estado del firewall: sudo firewall-cmd --list-all"
