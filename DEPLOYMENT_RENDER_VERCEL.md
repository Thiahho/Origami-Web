# 🚀 Guía de Deployment - Render + Vercel

Esta guía te llevará paso a paso para deployar el proyecto Origami Importados:
- **Backend API (.NET)** en **Render.com**
- **Frontend (HTML/JS/CSS)** en **Vercel.com**

## 📋 PREREQUISITOS

Antes de empezar, necesitas:

1. ✅ Cuenta en GitHub (para conectar repositorios)
2. ✅ Cuenta en Render.com (gratis)
3. ✅ Cuenta en Vercel.com (gratis)
4. ✅ Credenciales de Gmail para SMTP
5. ✅ Claves de Cloudflare Turnstile (CAPTCHA)

**Tiempo estimado total:** 30-45 minutos

---

## PARTE 1: 🗄️ DEPLOY DEL BACKEND EN RENDER

### Paso 1: Preparar el Repositorio (5 minutos)

1. **Crear repositorio en GitHub:**
   ```bash
   # En tu computadora
   cd E:\Proyectos\Origami-Liquid-
   git init
   git add .
   git commit -m "Initial commit - Origami Importados"
   ```

2. **Crear repo en GitHub:**
   - Ir a: https://github.com/new
   - Nombre: `origami-liquid` (o el que prefieras)
   - Privacidad: **Privado** (recomendado para proteger credenciales)
   - NO inicializar con README

3. **Subir código:**
   ```bash
   git remote add origin https://github.com/TU-USUARIO/origami-liquid.git
   git branch -M main
   git push -u origin main
   ```

⚠️ **IMPORTANTE:** Verifica que `.env.production` NO se haya subido:
```bash
git status --ignored
# Si ves .env.production, DETENTE y agrégalo a .gitignore
```

### Paso 2: Crear Base de Datos en Render (5 minutos)

1. **Ir a Render Dashboard:**
   - https://dashboard.render.com/

2. **Crear PostgreSQL Database:**
   - Click en **"New +"** → **PostgreSQL**
   - Configurar:
     ```
     Name: origami-db
     Database: bdOrigami
     User: origami_prod
     Region: Oregon (o el más cercano a tus usuarios)
     Plan: Free (⚠️ solo 90 días gratis, luego $7/mes)
     ```
   - Click en **"Create Database"**

3. **Esperar a que se cree** (1-2 minutos)

4. **Copiar Connection String:**
   - En la página de la base de datos, encontrar **"Internal Database URL"**
   - Copiar (formato: `postgresql://user:pass@host:5432/db`)
   - **GUARDAR** para el siguiente paso

### Paso 3: Configurar Gmail SMTP (5 minutos)

**Si aún no lo hiciste:**

1. **Ir a:** https://myaccount.google.com/security
2. **Activar** "Verificación en dos pasos"
3. **Ir a:** https://myaccount.google.com/apppasswords
4. **Generar contraseña:**
   - App: Correo
   - Dispositivo: Otro → "Origami Backend"
5. **Copiar** la contraseña de 16 caracteres
6. **GUARDAR** para el siguiente paso

### Paso 4: Configurar Cloudflare Turnstile (10 minutos)

**Si aún no lo hiciste:**

1. **Ir a:** https://dash.cloudflare.com/
2. **Crear cuenta** (gratis) o iniciar sesión
3. **Ir a Turnstile:**
   - En el menú lateral: **Turnstile**
   - Click en **"Add Site"**

4. **Configurar sitio:**
   ```
   Site name: Origami Importados
   Domain: origami-importados.vercel.app (temporal, cambiar después)
   Widget Mode: Managed
   ```
   - Click en **"Create"**

5. **Copiar las claves:**
   - **Site Key** (pública): `0x4AAA...` → Para el frontend
   - **Secret Key** (privada): `0x4BBB...` → Para el backend
   - **GUARDAR AMBAS**

### Paso 5: Deploy del Backend en Render (10 minutos)

1. **En Render Dashboard:**
   - Click en **"New +"** → **Web Service**
   - **Conectar repositorio de GitHub**
   - Seleccionar: `origami-liquid`
   - Click en **"Connect"**

2. **Configurar el servicio:**
   ```
   Name: origami-backend-api
   Region: Oregon (mismo que la BD)
   Branch: main
   Root Directory: Backend
   Runtime: Docker
   Dockerfile Path: Backend/Dockerfile
   Plan: Free (⚠️ se suspende después de 15 min de inactividad)
   ```

3. **Variables de Entorno** (⚠️ IMPORTANTE):

   Click en **"Advanced"** → **Environment Variables** → Agregar:

   ```env
   ASPNETCORE_ENVIRONMENT=Production
   ASPNETCORE_URLS=http://0.0.0.0:10000

   # Database (pegar el Internal Database URL del paso 2)
   DATABASE_CONNECTION_STRING=postgresql://origami_prod:password@...

   # JWT (Render puede generar automáticamente)
   JWT_SECRET=<click en "Generate" para crear uno aleatorio>
   JWT_ISSUER=OrigamiImportados-API-Production
   JWT_AUDIENCE=OrigamiImportados-Client-Production

   # CORS (actualizar después con tu dominio de Vercel)
   CORS_ORIGINS=https://origami-importados.vercel.app

   # Swagger (dejar vacío)
   SWAGGER_PASSWORD=

   # Logging
   LOG_LEVEL=Warning

   # SMTP (pegar password del paso 3)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=origami.importadosok@gmail.com
   SMTP_PASSWORD=xxxx xxxx xxxx xxxx
   EMAIL_DESTINO=origami.importadosok@gmail.com

   # Turnstile (pegar Secret Key del paso 4)
   TURNSTILE_SECRET_KEY=0x4BBB...
   ```

4. **Iniciar deployment:**
   - Click en **"Create Web Service"**
   - Esperar 5-10 minutos (primera vez tarda más)

5. **Verificar deployment:**
   - Ver logs en tiempo real
   - Cuando veas: **"Your service is live 🎉"**
   - Copiar la URL: `https://origami-backend-api.onrender.com`

6. **Probar el backend:**
   ```
   https://origami-backend-api.onrender.com/health
   ```
   Debería responder:
   ```json
   {
     "status": "Healthy",
     "checks": { ... }
   }
   ```

### Paso 6: Migrar Base de Datos (5 minutos)

El backend en Render necesita que se apliquen las migraciones:

**Opción A: Desde Render Shell (Recomendado)**

1. En Render Dashboard → tu servicio → **Shell** (tab)
2. Ejecutar:
   ```bash
   dotnet ef database update
   ```

**Opción B: Desde tu computadora (si tienes acceso directo a la BD)**

1. Copiar el **External Database URL** de Render
2. En tu computadora:
   ```bash
   cd Backend
   # Reemplazar <URL> con el External Database URL
   dotnet ef database update --connection "<URL>"
   ```

3. **Verificar que se crearon las tablas:**
   - En Render → PostgreSQL → Connect (tab)
   - Ejecutar: `\dt` para ver las tablas

### Paso 7: Crear Usuario Administrador (5 minutos)

Necesitas crear un usuario admin para poder acceder al panel:

1. **Conectarse a PostgreSQL desde Render:**
   - Render → PostgreSQL → Connect
   - Copiar y ejecutar el comando `psql`

2. **Crear usuario admin:**
   ```sql
   -- Generar hash de password con BCrypt (usar https://bcrypt-generator.com/)
   -- Password: "origami2025" → Hash: $2a$11$...

   INSERT INTO usuarios (email, clavehash, rol, nombre, fechacreacion, activo)
   VALUES (
     'admin@origami.com',
     '$2a$11$9rIvK8Jz7qP8F5xL9QhZXeKGJkZQWq9Yv6xZvP8F5xL9QhZXeKGJk',
     'ADMIN',
     'Administrador',
     NOW(),
     true
   );
   ```

3. **Guardar credenciales:**
   ```
   Email: admin@origami.com
   Password: origami2025  (o el que hayas usado)
   ```

---

## PARTE 2: 🌐 DEPLOY DEL FRONTEND EN VERCEL

### Paso 1: Actualizar URL del Backend (2 minutos)

Antes de deployar, actualizar la URL del backend:

1. **Editar** `admin/js/config.js` línea 30:
   ```javascript
   apiUrl: "https://origami-backend-api.onrender.com",
   ```

2. **Commit y push:**
   ```bash
   git add admin/js/config.js
   git commit -m "Update API URL to Render"
   git push
   ```

### Paso 2: Deploy en Vercel (5 minutos)

1. **Ir a:** https://vercel.com/

2. **Conectar GitHub:**
   - Click en **"Add New Project"**
   - **Import Git Repository**
   - Seleccionar: `origami-liquid`
   - Click en **"Import"**

3. **Configurar proyecto:**
   ```
   Project Name: origami-importados
   Framework Preset: Other
   Root Directory: ./  (raíz del proyecto)
   Build Command: (dejar vacío o "npm run build")
   Output Directory: (dejar vacío)
   ```

4. **Variables de Entorno** (opcional para Vercel):

   Vercel no necesita variables de entorno porque todo está en el código,
   pero si quieres agregar algunas:

   - Click en **"Environment Variables"**
   - No es necesario agregar nada por ahora

5. **Deploy:**
   - Click en **"Deploy"**
   - Esperar 1-2 minutos
   - Cuando veas: **"Congratulations!"**
   - Copiar la URL: `https://origami-importados.vercel.app`

### Paso 3: Actualizar CORS en Render (2 minutos)

Ahora que tienes la URL de Vercel, actualizar CORS en el backend:

1. **Ir a Render Dashboard** → tu servicio
2. **Environment** → Variables de entorno
3. **Editar** `CORS_ORIGINS`:
   ```
   https://origami-importados.vercel.app,https://origami-importados-git-main-tu-usuario.vercel.app
   ```
   (Vercel crea URLs automáticas por branch, agregar las necesarias)

4. **Guardar** (el servicio se reiniciará automáticamente)

### Paso 4: Actualizar Turnstile Site Key (2 minutos)

Actualizar la Site Key en el formulario de contacto:

1. **Editar** `Nosotros/js/contacto.js` línea 11:
   ```javascript
   const TURNSTILE_SITE_KEY = "0x4AAA...";  // ← Tu Site Key aquí
   ```

2. **Commit y push:**
   ```bash
   git add Nosotros/js/contacto.js
   git commit -m "Update Turnstile site key"
   git push
   ```

3. **Vercel auto-deploya** (1 minuto)

### Paso 5: Actualizar Dominio en Turnstile (2 minutos)

Actualizar el dominio permitido en Cloudflare:

1. **Ir a:** https://dash.cloudflare.com/ → Turnstile
2. **Editar tu sitio** "Origami Importados"
3. **Domains:** Agregar:
   ```
   origami-importados.vercel.app
   ```
4. **Guardar**

---

## PARTE 3: ✅ VERIFICACIÓN Y TESTING

### Verificar Backend (Render)

1. **Health Check:**
   ```
   https://origami-backend-api.onrender.com/health
   ```
   ✅ Debería responder: `{"status":"Healthy"}`

2. **Swagger (si habilitado):**
   ```
   https://origami-backend-api.onrender.com/swagger
   ```

3. **Logs:**
   - Render Dashboard → tu servicio → Logs
   - Verificar que no haya errores

### Verificar Frontend (Vercel)

1. **Página principal:**
   ```
   https://origami-importados.vercel.app
   ```
   ✅ Debería cargar correctamente

2. **Admin login:**
   ```
   https://origami-importados.vercel.app/admin/dashboard.html
   ```
   - Usar: `admin@origami.com` / `origami2025`
   - ✅ Debería permitir login

3. **Formulario de contacto:**
   ```
   https://origami-importados.vercel.app/Nosotros/nosotros.html
   ```
   - Completar y enviar
   - ✅ Debería enviar email

### Verificar Conexión Frontend ↔ Backend

1. **Abrir consola del navegador** (F12)
2. **Ir al admin panel** y hacer login
3. **Verificar en Network tab:**
   - Petición a: `https://origami-backend-api.onrender.com/Admin/login`
   - Status: `200 OK`
   - Response: Token JWT

---

## 🔧 CONFIGURACIÓN POST-DEPLOYMENT

### Dominio Personalizado (Opcional)

Si tienes un dominio propio (ej: `origamiimportados.com`):

**En Vercel:**
1. Settings → Domains → Add Domain
2. Agregar: `origamiimportados.com` y `www.origamiimportados.com`
3. Configurar DNS según instrucciones de Vercel

**En Render:**
- El plan Free no permite dominios custom
- Upgrade a Starter ($7/mo) para custom domain

**Actualizar CORS:**
```env
CORS_ORIGINS=https://origamiimportados.com,https://www.origamiimportados.com
```

**Actualizar Turnstile:**
- Agregar `origamiimportados.com` en Cloudflare

### Monitoreo

**UptimeRobot (Gratis):**
1. Ir a: https://uptimerobot.com/
2. Agregar monitor:
   - URL: `https://origami-backend-api.onrender.com/health/live`
   - Tipo: HTTP(s)
   - Intervalo: 5 minutos
   - Alertas: Email

**Render Logs:**
- Dashboard → tu servicio → Logs
- Ver en tiempo real

**Vercel Analytics:**
- Automático en todos los proyectos
- Dashboard → tu proyecto → Analytics

---

## 💰 COSTOS

### Plan Gratuito (Actual)

| Servicio | Plan | Limitaciones | Costo |
|----------|------|-------------|-------|
| **Render PostgreSQL** | Free | 90 días gratis, luego $7/mo | **$0** → $7/mo |
| **Render Web Service** | Free | Se suspende tras 15 min inactivo | **$0** |
| **Vercel** | Hobby | 100GB bandwidth/mes | **$0** |
| **Cloudflare Turnstile** | Free | Ilimitado | **$0** |
| **Gmail SMTP** | Free | 500 emails/día | **$0** |
| **TOTAL** | | | **$0/mes** (90 días) |

### Plan Recomendado (Producción Real)

| Servicio | Plan | Beneficios | Costo |
|----------|------|-----------|-------|
| **Render PostgreSQL** | Starter | 256MB, backups | **$7/mo** |
| **Render Web Service** | Starter | Always-on, 512MB RAM | **$7/mo** |
| **Vercel** | Pro | Más bandwidth | **$20/mo** |
| **TOTAL** | | | **$34/mo** |

---

## ⚠️ LIMITACIONES DEL PLAN GRATUITO

### Render Free Tier:

1. **Web Service se suspende** después de 15 minutos de inactividad
   - Primera petición después de suspensión: 30-60 segundos (cold start)
   - Solución: Upgrade a Starter ($7/mo) para always-on

2. **PostgreSQL gratis solo 90 días**
   - Después: $7/mo obligatorio
   - No hay alternativa gratuita en Render

3. **512 MB RAM** (suficiente para .NET pequeño)
   - Si necesitas más: Upgrade a Standard ($25/mo)

### Vercel Free Tier:

1. **100 GB bandwidth/mes**
   - Suficiente para ~100k visitas/mes
   - Después: automáticamente pausan

2. **Sin custom domain SSL avanzado**
   - SSL gratis con custom domain
   - Pero sin opciones avanzadas

---

## 🔄 ACTUALIZACIONES

### Actualizar Backend (Render)

Render auto-deploya cuando haces push a GitHub:

```bash
# Hacer cambios en Backend/
git add .
git commit -m "Update backend"
git push
# Render auto-deploya en ~5 minutos
```

### Actualizar Frontend (Vercel)

Vercel auto-deploya cuando haces push:

```bash
# Hacer cambios en frontend
git add .
git commit -m "Update frontend"
git push
# Vercel auto-deploya en ~1 minuto
```

---

## 🆘 TROUBLESHOOTING

### "Backend no responde en Render"

1. ✅ Verificar logs: Dashboard → Logs
2. ✅ Verificar variables de entorno
3. ✅ Verificar que DATABASE_CONNECTION_STRING es correcta
4. ✅ Esperar 60 segundos (cold start)

### "Frontend no puede conectar con backend"

1. ✅ Verificar URL en `admin/js/config.js`
2. ✅ Verificar CORS en Render env vars
3. ✅ Verificar en Network tab (F12) qué error da
4. ✅ Verificar que backend esté online: `/health`

### "Emails no se envían"

1. ✅ Verificar SMTP_PASSWORD en Render
2. ✅ Verificar logs del backend
3. ✅ Probar con Mailtrap primero (sandbox)

### "CAPTCHA no funciona"

1. ✅ Verificar Site Key en `contacto.js`
2. ✅ Verificar Secret Key en Render env vars
3. ✅ Verificar dominio en Cloudflare Turnstile

---

## 📞 CHECKLIST FINAL

### Backend (Render)
- [ ] PostgreSQL creada y conectada
- [ ] Migraciones aplicadas (`dotnet ef database update`)
- [ ] Usuario admin creado en BD
- [ ] Variables de entorno configuradas (11 variables)
- [ ] Health check responde: `/health`
- [ ] Logs sin errores

### Frontend (Vercel)
- [ ] URL del backend actualizada en `config.js`
- [ ] Site Key de Turnstile actualizada en `contacto.js`
- [ ] Deploy exitoso
- [ ] Página principal carga
- [ ] Admin login funciona
- [ ] Productos se cargan desde API

### Integraciones
- [ ] CORS configurado correctamente
- [ ] Turnstile permite el dominio de Vercel
- [ ] Emails se envían correctamente
- [ ] Admin panel conecta con backend API

---

## 🎉 ¡LISTO!

Tu aplicación está deployada en:

- **Frontend:** https://origami-importados.vercel.app
- **Backend:** https://origami-backend-api.onrender.com
- **Admin:** https://origami-importados.vercel.app/admin/dashboard.html

**Credenciales de admin:**
- Email: `admin@origami.com`
- Password: `origami2025`

---

## 📚 RECURSOS

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Turnstile Docs:** https://developers.cloudflare.com/turnstile/
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
