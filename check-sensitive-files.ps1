# ==============================================================================
# SCRIPT DE VERIFICACION DE ARCHIVOS SENSIBLES
# ==============================================================================
# Ejecutar antes de hacer git push para verificar que no se suban credenciales
# ==============================================================================

Write-Host "Verificando archivos sensibles antes de commit..." -ForegroundColor Cyan
Write-Host ""

$hasErrors = $false
$hasWarnings = $false

# ===== VERIFICAR ARCHIVOS .ENV =====
Write-Host "Verificando archivos .env..." -ForegroundColor Yellow

$envFiles = @()
$envFiles += Get-ChildItem -Path . -Filter "*.env" -Recurse -File -ErrorAction SilentlyContinue
$envFiles += Get-ChildItem -Path . -Filter ".env.development" -Recurse -File -ErrorAction SilentlyContinue
$envFiles += Get-ChildItem -Path . -Filter ".env.production" -Recurse -File -ErrorAction SilentlyContinue

if ($envFiles.Count -gt 0) {
    Write-Host "   ERROR: Archivos .env encontrados (NO deben estar en git):" -ForegroundColor Red
    foreach ($file in $envFiles) {
        Write-Host "      - $($file.FullName)" -ForegroundColor Red
    }
    $hasErrors = $true
}
else {
    Write-Host "   OK: No se encontraron archivos .env" -ForegroundColor Green
}

# ===== VERIFICAR APPSETTINGS CON CREDENCIALES =====
Write-Host ""
Write-Host "Verificando appsettings.*.json..." -ForegroundColor Yellow

$appSettings = Get-ChildItem -Path . -Filter "appsettings.*.json" -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.Name -ne "appsettings.json" }

if ($appSettings.Count -gt 0) {
    Write-Host "   ADVERTENCIA: Archivos appsettings encontrados:" -ForegroundColor DarkYellow
    foreach ($file in $appSettings) {
        Write-Host "      - $($file.FullName)" -ForegroundColor DarkYellow
    }
    $hasWarnings = $true
}
else {
    Write-Host "   OK: No se encontraron archivos appsettings adicionales" -ForegroundColor Green
}

# ===== VERIFICAR CERTIFICADOS Y KEYS =====
Write-Host ""
Write-Host "Verificando certificados y keys..." -ForegroundColor Yellow

$certExtensions = @("*.key", "*.pem", "*.crt", "*.pfx", "*.p12")
$certFiles = @()

foreach ($ext in $certExtensions) {
    $certFiles += Get-ChildItem -Path . -Filter $ext -Recurse -File -ErrorAction SilentlyContinue
}

if ($certFiles.Count -gt 0) {
    Write-Host "   ERROR: Certificados/keys encontrados:" -ForegroundColor Red
    foreach ($file in $certFiles) {
        Write-Host "      - $($file.FullName)" -ForegroundColor Red
    }
    $hasErrors = $true
}
else {
    Write-Host "   OK: No se encontraron certificados o keys" -ForegroundColor Green
}

# ===== VERIFICAR ARCHIVOS DE PASSWORDS =====
Write-Host ""
Write-Host "Verificando archivos de passwords..." -ForegroundColor Yellow

$passwordFiles = @("passwords.txt", "credentials.txt", "pins.txt", "secrets.txt", "api-keys.txt")
$foundPassFiles = @()

foreach ($fileName in $passwordFiles) {
    $foundPassFiles += Get-ChildItem -Path . -Filter $fileName -Recurse -File -ErrorAction SilentlyContinue
}

if ($foundPassFiles.Count -gt 0) {
    Write-Host "   ERROR: Archivos de passwords encontrados:" -ForegroundColor Red
    foreach ($file in $foundPassFiles) {
        Write-Host "      - $($file.FullName)" -ForegroundColor Red
    }
    $hasErrors = $true
}
else {
    Write-Host "   OK: No se encontraron archivos de passwords" -ForegroundColor Green
}

# ===== RESUMEN FINAL =====
Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan

if ($hasErrors -eq $true) {
    Write-Host "RESULTADO: VERIFICACION FALLIDA - NO HACER COMMIT" -ForegroundColor Red
    Write-Host ""
    Write-Host "Se encontraron archivos sensibles que NO deben subirse a git." -ForegroundColor Red
    Write-Host "Por favor, revisar y eliminar los archivos marcados arriba." -ForegroundColor Red
    Write-Host ""
    Write-Host "Comandos utiles:" -ForegroundColor Yellow
    Write-Host "  git reset HEAD archivo" -ForegroundColor Yellow
    Write-Host "  Editar .gitignore y agregar el patron correspondiente" -ForegroundColor Yellow
    Write-Host "================================================================" -ForegroundColor Cyan
    exit 1
}
elseif ($hasWarnings -eq $true) {
    Write-Host "RESULTADO: VERIFICACION CON ADVERTENCIAS" -ForegroundColor DarkYellow
    Write-Host ""
    Write-Host "Se encontraron archivos que deberias revisar manualmente." -ForegroundColor DarkYellow
    Write-Host "Asegurate de que no contengan credenciales reales." -ForegroundColor DarkYellow
    Write-Host "================================================================" -ForegroundColor Cyan
    exit 0
}
else {
    Write-Host "RESULTADO: VERIFICACION EXITOSA - SEGURO PARA COMMIT" -ForegroundColor Green
    Write-Host ""
    Write-Host "No se detectaron archivos sensibles." -ForegroundColor Green
    Write-Host "Puedes proceder con git commit y git push." -ForegroundColor Green
    Write-Host "================================================================" -ForegroundColor Cyan
    exit 0
}
