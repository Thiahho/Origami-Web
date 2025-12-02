# 🔒 Seguridad - Deployment de Origami Importados

## ⚠️ IMPORTANTE: Archivos que NO debes subir a GitHub

Esta carpeta contiene **archivos template** para deployment. Algunos archivos están marcados como `.example` y **NUNCA deben contener credenciales reales**.

---

## ✅ Archivos SEGUROS para GitHub (ya incluidos)

Estos archivos **SÍ se pueden subir** porque no contienen información sensible:

```
deployment/
├── deploy.sh                           ✅ Script público (sin credenciales)
├── selinux-policy.sh                   ✅ Script público
├── origami-backend.service             ✅ Configuración pública
├── nginx.conf                          ✅ Configuración pública (cambiar dominio después)
├── .env.production.example             ✅ Template (sin credenciales reales)
├── DEPLOYMENT_GUIDE_ALMALINUX.md       ✅ Documentación pública
├── README.md                           ✅ Documentación pública
└── SECURITY.md                         ✅ Este archivo
```

---

## ❌ Archivos que NO DEBES CREAR en GitHub

**NUNCA crees estos archivos en el repositorio público:**

```
deployment/
├── .env.production                     ❌ Credenciales reales
├── .env                                ❌ Credenciales reales
├── config.production.json              ❌ Configuración con passwords
├── secrets/                            ❌ Carpeta de secretos
├── backup/                             ❌ Backups de DB
├── *.key                               ❌ Claves privadas
├── *.pem                               ❌ Certificados SSL
├── *.crt                               ❌ Certificados
└── appsettings.Production.json         ❌ Si tiene credenciales
```

---

## 🛡️ Protección en `.gitignore`

Ya está configurado en `.gitignore` para proteger:

```gitignore
# Archivos de producción con credenciales
deployment/.env.production
deployment/.env
deployment/config.production.json
deployment/secrets/
deployment/backup/
deployment/*.key
deployment/*.pem
deployment/*.crt

# Permitir archivos template
!deployment/.env.production.example
!deployment/*.example
```

---

## 🔐 Información Sensible que NUNCA debes publicar

### 1. Passwords de Base de Datos
```bash
# ❌ MAL - No publicar
DB_PASSWORD=miPasswordReal123

# ✅ BIEN - Usar en .example
DB_PASSWORD=CAMBIA_ESTE_PASSWORD_SEGURO
```

### 2. JWT Secret Keys
```bash
# ❌ MAL - No publicar
JWT_SECRET=abc123realkey456xyz

# ✅ BIEN - Usar en .example
JWT_SECRET=GENERA_CLAVE_SEGURA_CON_openssl_rand_base64_64
```

### 3. Connection Strings
```json
// ❌ MAL - No publicar
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=origami_db;Username=admin;Password=RealPass123"
  }
}

// ✅ BIEN - Usar en .example
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=origami_db;Username=USUARIO;Password=TU_PASSWORD"
  }
}
```

### 4. API Keys externas
```bash
# ❌ MAL
SMTP_PASSWORD=myGmailAppPassword123
STRIPE_SECRET_KEY=sk_live_51ABC...

# ✅ BIEN
SMTP_PASSWORD=tu_app_password
STRIPE_SECRET_KEY=sk_live_TU_CLAVE_AQUI
```

### 5. IPs y Dominios de Producción (opcional ocultar)
```nginx
# Puedes publicar esto, pero considera cambiarlo
server_name tu-dominio.com www.tu-dominio.com;

# O usar placeholder
server_name example.com www.example.com;
```

---

## 📝 Flujo de Trabajo Seguro

### En tu PC (Desarrollo Local)

1. **Crear archivo real de producción** (NO subirlo):
```bash
# Copiar el template
cp deployment/.env.production.example deployment/.env.production

# Editar con credenciales reales
nano deployment/.env.production
```

2. **Verificar que está ignorado**:
```bash
git status --ignored
# Debe aparecer: deployment/.env.production (ignorado)
```

### En el Servidor (Producción)

1. **Crear archivo de configuración manualmente**:
```bash
# En el servidor
nano /var/www/origami-backend/appsettings.Production.json
# Agregar credenciales reales aquí
```

2. **O usar variables de entorno**:
```bash
# Agregar al servicio systemd
nano /etc/systemd/system/origami-backend.service

[Service]
Environment="ConnectionStrings__DefaultConnection=Host=localhost;Database=origami_db;Username=origami_user;Password=RealPassword"
Environment="Jwt__Key=RealJwtSecretKey"
```

---

## ✅ Checklist Antes de Hacer Push a GitHub

Antes de `git push`, verifica:

- [ ] No hay archivos `.env.production` (solo `.env.production.example`)
- [ ] No hay `appsettings.Production.json` con credenciales reales
- [ ] No hay archivos `.key`, `.pem`, `.crt`
- [ ] No hay backups de base de datos (`.sql`, `.dump`)
- [ ] Todos los passwords en `.example` están como placeholders
- [ ] Las JWT keys son ejemplos, no reales
- [ ] No hay IPs privadas del servidor

**Comandos de verificación**:
```bash
# Ver qué archivos se van a subir
git status

# Ver archivos ignorados
git status --ignored

# Ver contenido de archivos staged
git diff --staged

# Buscar posibles secretos
git diff --staged | grep -i "password\|secret\|key"
```

---

## 🚨 ¿Qué hacer si subiste un secreto por error?

### 1. Si acabas de hacer commit (NO push aún)
```bash
# Deshacer el último commit
git reset HEAD~1

# Editar el archivo y quitar el secreto
nano deployment/.env.production

# Agregarlo al .gitignore si no estaba
echo "deployment/.env.production" >> .gitignore

# Volver a commitear
git add .
git commit -m "Add deployment config (without secrets)"
```

### 2. Si ya hiciste push a GitHub

**⚠️ EL SECRETO YA ES PÚBLICO - Debes cambiarlo inmediatamente**

```bash
# 1. Cambiar TODOS los passwords/secrets que subiste
# - Cambiar password de base de datos
# - Regenerar JWT secret key
# - Rotar API keys

# 2. Eliminar el archivo del historial de Git
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch deployment/.env.production" \
  --prune-empty --tag-name-filter cat -- --all

# 3. Forzar push (¡CUIDADO!)
git push origin --force --all

# 4. Notificar a GitHub si es un secreto crítico
# https://docs.github.com/en/code-security/secret-scanning
```

**Mejor opción**: Considera el secreto comprometido y **cámbialo inmediatamente**.

---

## 🔑 Gestión de Secretos (Mejores Prácticas)

### Opción 1: Variables de Entorno en el Servidor
```bash
# En el servidor, agregar al .bashrc o .profile
export DB_PASSWORD="RealPassword123"
export JWT_SECRET="RealJwtKey456"
```

### Opción 2: GitHub Secrets (para CI/CD)
Si usas GitHub Actions:
1. Ve a Settings → Secrets and variables → Actions
2. Agrega tus secretos (DB_PASSWORD, JWT_SECRET, etc.)
3. Úsalos en workflows sin exponerlos

### Opción 3: Azure Key Vault / AWS Secrets Manager
Para producción enterprise, considera servicios de gestión de secretos.

### Opción 4: Archivos locales NO trackeados
```bash
# Crear archivo local
echo "deployment/.env.production" >> .gitignore
cp deployment/.env.production.example deployment/.env.production

# Editar con credenciales reales
nano deployment/.env.production

# Git lo ignorará automáticamente
```

---

## 📊 Niveles de Sensibilidad

| Nivel | Tipo | Ejemplo | Acción |
|-------|------|---------|--------|
| 🔴 **CRÍTICO** | Passwords, Keys privadas | DB password, SSL keys | **NUNCA** publicar |
| 🟠 **ALTO** | API Keys, JWT secrets | Stripe key, JWT secret | **NUNCA** publicar |
| 🟡 **MEDIO** | IPs, Dominios privados | IP del servidor | Considerar ocultar |
| 🟢 **BAJO** | Configuración pública | Puertos, timeouts | OK publicar |

---

## 🎯 Resumen

### ✅ SÍ puedes subir a GitHub:
- Scripts de deployment (`.sh`)
- Configuraciones públicas (`nginx.conf`, `.service`)
- Templates (`.example`)
- Documentación (`.md`)

### ❌ NO subas a GitHub:
- Passwords reales
- JWT secrets reales
- API keys privadas
- Certificados SSL privados
- Backups de base de datos
- Archivos `.env.production` con credenciales

### 🔒 Regla de oro:
**Si tiene credenciales reales, NO va a GitHub. Usa templates (`.example`) con placeholders.**

---

## 📞 Más Información

- [GitHub - Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [OWASP - Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_CheatSheet.html)
- [Git - gitignore documentation](https://git-scm.com/docs/gitignore)

---

**Última actualización**: 2024-12-02
