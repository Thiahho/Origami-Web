#!/bin/bash

# Script de preparación para deployment
# Convierte archivos a formato Unix y verifica requisitos

echo "=== Preparando archivos para deployment ==="

# Convertir line endings a Unix
echo "Convirtiendo line endings a formato Unix..."

# Función para convertir
convert_file() {
    if [ -f "$1" ]; then
        sed -i 's/\r$//' "$1" 2>/dev/null || sed -i'' -e 's/\r$//' "$1"
        echo "  ✓ $1"
    fi
}

# Convertir todos los scripts
convert_file "deployment/deploy.sh"
convert_file "deployment/selinux-policy.sh"

# Dar permisos de ejecución
echo "Configurando permisos de ejecución..."
chmod +x deployment/deploy.sh
chmod +x deployment/selinux-policy.sh

echo ""
echo "✅ Archivos preparados correctamente"
echo ""
echo "Ahora puedes ejecutar:"
echo "  sudo bash deployment/deploy.sh"
