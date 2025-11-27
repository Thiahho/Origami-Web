# 🔌 Configuración de APIs para Producción - Origami Importados

Este documento explica cómo configurar todas las APIs y servicios externos necesarios para que el sistema funcione correctamente en producción.

## 📊 RESUMEN EJECUTIVO

✅ **El admin panel YA ESTÁ conectado al backend API**
✅ **Usa axios para todas las peticiones HTTP**
✅ **Detecta automáticamente ambiente (desarrollo/producción)**

**LO QUE FALTA:**
- ⚠️ Configurar credenciales de Gmail/SMTP en producción
- ⚠️ Obtener claves de Cloudflare Turnstile (CAPTCHA)
- ⚠️ Actualizar URL de API en producción (cambiar dominio)

---

## 1. 🗄️ CONFIGURACIÓN DEL BACKEND

### A. Base de Datos PostgreSQL

**Ya configurado en desarrollo:**
```
Host: localhost
Database: bdOrigami
Usuario: postgres
Password: 456789 (⚠️ CAMBIAR en producción)
```

**Para producción - Crear usuario dedicado:**

```sql
-- 1. Conectarse a PostgreSQL como superuser
psql -U postgres

-- 2. Crear usuario para producción
CREATE USER origami_prod WITH PASSWORD 'TU_PASSWORD_SEGURO_AQUI';

-- 3. Dar permisos sobre la base de datos
GRANT CONNECT ON DATABASE bdOrigami TO origami_prod;
GRANT USAGE ON SCHEMA public TO origami_prod;

-- 4. Dar permisos sobre tablas
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO origami_prod;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO origami_prod;

-- 5. Para tablas futuras
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO origami_prod;
```

**Actualizar en `.env.production`:**
```env
DATABASE_CONNECTION_STRING=Host=TU_SERVIDOR;Port=5432;Database=bdOrigami;Username=origami_prod;Password=TU_PASSWORD_SEGURO;Pooling=true;MinPoolSize=5;MaxPoolSize=20
```

### B. JWT Secret

**✅ YA GENERADO** en `.env.production`:
```env
JWT_SECRET=O1/eLwgn5j8KmNwKwMiWVnYSYRAXeeZ99T0C1Im9/uuW5/wvHQ0Nq1uhsc14mKGJpb4jQrX/AGspbAMsx/8LEQ==6294e312f0df46e29d1118de03b33b0f
```

⚠️ **IMPORTANTE:** Este secret es ÚNICO para tu instalación. NO compartirlo.

---

## 2. 📧 CONFIGURACIÓN DE SMTP (Formulario de Contacto)

El formulario de contacto en `/Nosotros/nosotros.html` envía emails a través del backend.

### Opción A: Gmail (Recomendado para empezar)

**Paso 1: Habilitar autenticación de 2 pasos**
1. Ir a: https://myaccount.google.com/security
2. Activar "Verificación en dos pasos"

**Paso 2: Generar contraseña de aplicación**
1. Ir a: https://myaccount.google.com/apppasswords
2. Seleccionar:
   - Aplicación: "Correo"
   - Dispositivo: "Otro" → Escribir "Origami Backend"
3. Copiar la contraseña de 16 caracteres (formato: `xxxx xxxx xxxx xxxx`)

**Paso 3: Actualizar `.env.production`**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=origami.importadosok@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx  # ← Tu contraseña de aplicación aquí
EMAIL_DESTINO=origami.importadosok@gmail.com
```

### Opción B: SendGrid (100 emails/día gratis)

1. Registrarse en: https://sendgrid.com/
2. Crear API Key:
   - Settings → API Keys → Create API Key
   - Tipo: Full Access
   - Copiar la API Key

3. Configurar en `.env.production`:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey  # ← Literal "apikey"
SMTP_PASSWORD=TU_API_KEY_AQUI  # ← Pegar API Key
EMAIL_DESTINO=origami.importadosok@gmail.com
```

### Opción C: Resend (Recomendado - 100 emails/día gratis)

1. Registrarse en: https://resend.com/
2. Crear API Key en dashboard
3. Verificar dominio (opcional, puedes usar `onboarding@resend.dev`)

**Nota:** Resend requiere código custom. Por ahora, usar Gmail o SendGrid.

---

## 3. 🛡️ CONFIGURACIÓN DE CLOUDFLARE TURNSTILE (CAPTCHA)

Turnstile es **gratis e ilimitado** y protege el formulario de contacto.

### Obtener Claves

**Paso 1: Crear cuenta en Cloudflare**
- Ir a: https://dash.cloudflare.com/
- Registrarse o iniciar sesión (100% gratis)

**Paso 2: Crear sitio de Turnstile**
1. En el dashboard, ir a: **Turnstile**
2. Click en **"Add Site"**
3. Configurar:
   ```
   Site name: Origami Importados
   Domain: origamiimportados.com  (tu dominio real)
   Widget Mode: Managed (recomendado)
   ```
4. Click en **"Create"**

**Paso 3: Copiar claves**

Te dará dos claves:
- **Site Key** (pública) → Para el frontend
- **Secret Key** (privada) → Para el backend

### Configurar Backend

Editar `.env.production`:
```env
TURNSTILE_SECRET_KEY=0x1234567890abcdef1234567890abcdef12345678  # ← Tu Secret Key aquí
```

### Configurar Frontend

Editar `Nosotros/js/contacto.js` línea 11:
```javascript
// Reemplazar con tu Site Key real
const TURNSTILE_SITE_KEY = "0x4AAAA...";  # ← Tu Site Key aquí
```

### Claves de Testing (Solo Desarrollo)

**Para desarrollo local, usar estas keys especiales:**

Backend (`.env.development`):
```env
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

Frontend (`contacto.js`):
```javascript
const TURNSTILE_SITE_KEY = "1x00000000000000000000AA";
```

⚠️ **IMPORTANTE:** Estas keys SIEMPRE pasan la verificación. Solo para testing.

---

## 4. 🔌 CONFIGURACIÓN DEL ADMIN PANEL

### Conexión con Backend API

**✅ YA ESTÁ CONFIGURADO** en `admin/js/config.js`:

```javascript
development: {
  apiUrl: "http://localhost:5015",  // Desarrollo local
  apiTimeout: 30000,
  enableLogging: true,
},
production: {
  apiUrl: "https://api.origamiimportados.com",  // ⚠️ CAMBIAR esto
  apiTimeout: 30000,
  enableLogging: false,
}
```

### ⚠️ ACCIÓN REQUERIDA: Actualizar URL de Producción

**Opción A: Mismo dominio**
Si el backend está en el mismo servidor que el frontend:

```javascript
production: {
  apiUrl: "https://origamiimportados.com",  // Mismo dominio
}
```

**Opción B: Subdominio**
Si usas un subdominio para la API:

```javascript
production: {
  apiUrl: "https://api.origamiimportados.com",  // Subdominio
}
```

**Y configurar en `.env.production`:**
```env
CORS_ORIGINS=https://origamiimportados.com,https://www.origamiimportados.com
```

### Endpoints Disponibles

El admin panel usa estos endpoints del backend:

**Autenticación:**
- `POST /Admin/login` - Login de admin
- `POST /Admin/logout` - Logout
- `GET /Admin/verify` - Verificar sesión

**Productos:**
- `GET /api/Producto` - Listar productos
- `GET /api/Producto/{id}` - Ver producto
- `POST /api/Producto` - Crear producto
- `PUT /api/Producto/{id}` - Actualizar producto
- `DELETE /api/Producto/{id}` - Eliminar producto

**Variantes:**
- `GET /api/Producto/{id}/variantes` - Listar variantes
- `POST /api/Producto/variante` - Crear variante
- `PUT /api/Producto/variante/{id}` - Actualizar variante
- `DELETE /api/Producto/variante/{id}` - Eliminar variante

**Categorías:**
- `GET /api/Categoria` - Listar categorías
- `POST /api/Categoria` - Crear categoría
- `PUT /api/Categoria/{id}` - Actualizar categoría
- `DELETE /api/Categoria/{id}` - Eliminar categoría

**Marcas:**
- `GET /api/Marca` - Listar marcas
- `POST /api/Marca` - Crear marca
- `PUT /api/Marca/{id}` - Actualizar marca
- `DELETE /api/Marca/{id}` - Eliminar marca

**Condiciones:**
- `GET /api/Condiciones` - Listar condiciones
- `POST /api/Condiciones` - Crear condición
- `PUT /api/Condiciones/{id}` - Actualizar condición
- `DELETE /api/Condiciones/{id}` - Eliminar condición

---

## 5. 🚀 CONFIGURACIÓN DE CORS

Para que el frontend pueda comunicarse con el backend, CORS debe estar bien configurado.

**En `.env.production`:**
```env
# Solo permitir tus dominios de producción (separados por coma, sin espacios)
CORS_ORIGINS=https://origamiimportados.com,https://www.origamiimportados.com
```

**Si usas subdominio para API:**
```env
CORS_ORIGINS=https://origamiimportados.com,https://www.origamiimportados.com,https://api.origamiimportados.com
```

---

## 6. ✅ CHECKLIST DE CONFIGURACIÓN

### Backend (.env.production)
- [ ] `DATABASE_CONNECTION_STRING` - Usuario y password de producción
- [ ] `JWT_SECRET` - Ya generado (no cambiar)
- [ ] `CORS_ORIGINS` - Dominios de producción
- [ ] `SMTP_HOST` - Configurado
- [ ] `SMTP_USER` - Email configurado
- [ ] `SMTP_PASSWORD` - Contraseña de aplicación de Gmail
- [ ] `EMAIL_DESTINO` - Email destino
- [ ] `TURNSTILE_SECRET_KEY` - Secret Key de Cloudflare

### Frontend
- [ ] `admin/js/config.js` línea 28 - URL de API en producción
- [ ] `Nosotros/js/contacto.js` línea 11 - Site Key de Turnstile

### Base de Datos
- [ ] Usuario `origami_prod` creado
- [ ] Permisos otorgados
- [ ] Conexión probada

---

## 7. 🧪 TESTING

### Probar Email (Desarrollo)

1. Configurar Gmail en `.env.development`:
```env
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_DESTINO=tu_email@gmail.com
```

2. Iniciar backend:
```bash
cd Backend
dotnet run
```

3. Ir a: `http://localhost:5015/Nosotros/nosotros.html`
4. Completar y enviar el formulario
5. Verificar que llegue el email

### Probar Admin Panel (Desarrollo)

1. Iniciar backend:
```bash
cd Backend
dotnet run
```

2. Ir a: `http://localhost:5015/admin/dashboard.html`
3. Login:
   - Email: `admin@origami.com` (o el que tengas en BD)
   - Password: `origami2025` (o el que tengas)

4. Verificar:
   - Dashboard carga datos
   - Productos se listan
   - Puedes crear/editar/eliminar

### Probar CAPTCHA (Desarrollo)

Usando las keys de testing, el CAPTCHA siempre pasa:
- Backend: `TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA`
- Frontend: `TURNSTILE_SITE_KEY = "1x00000000000000000000AA"`

---

## 8. 📝 NOTAS IMPORTANTES

### Seguridad

1. **NUNCA** subir `.env.production` al repositorio
2. **NUNCA** exponer las API keys en el código frontend
3. **SIEMPRE** usar HTTPS en producción
4. **SIEMPRE** cambiar las credenciales por defecto

### Performance

- Rate limiting ya configurado (5 req/min en producción)
- Connection pooling en PostgreSQL configurado
- Axios timeout de 30 segundos

### Monitoreo

Verificar logs del backend en producción:
```bash
tail -f Backend/logs/origamiback-YYYYMMDD.log
```

---

## 9. 🆘 TROUBLESHOOTING

### "Admin no puede hacer login"

✅ Verificar:
1. Backend está corriendo
2. URL en `admin/js/config.js` es correcta
3. CORS está bien configurado
4. Usuario existe en base de datos

```sql
-- Verificar usuarios
SELECT * FROM usuarios WHERE rol = 'ADMIN';
```

### "Formulario de contacto no envía emails"

✅ Verificar:
1. `SMTP_USER` y `SMTP_PASSWORD` en `.env.production`
2. Contraseña de aplicación de Gmail es correcta
3. Autenticación de 2 pasos activada en Gmail
4. Logs del backend: `Backend/logs/`

### "CAPTCHA no aparece"

✅ Verificar:
1. Script cargado: `<script src="https://challenges.cloudflare.com/turnstile/v0/api.js">`
2. Site Key correcta en `contacto.js`
3. Consola del navegador (F12) para errores

### "Error de CORS"

✅ Verificar:
1. `CORS_ORIGINS` en `.env.production` tiene el dominio correcto
2. No hay espacios en la lista de dominios
3. Incluye `https://` en los dominios

---

## 10. 📞 RESUMEN DE CREDENCIALES A CONFIGURAR

| Servicio | Donde obtenerlo | Donde configurarlo |
|----------|----------------|-------------------|
| **PostgreSQL** | Crear usuario en BD | `.env.production` |
| **JWT Secret** | ✅ Ya generado | `.env.production` |
| **Gmail SMTP** | https://myaccount.google.com/apppasswords | `.env.production` |
| **Turnstile Secret** | https://dash.cloudflare.com/ | `.env.production` |
| **Turnstile Site Key** | https://dash.cloudflare.com/ | `contacto.js` línea 11 |
| **API URL** | Tu dominio de producción | `admin/js/config.js` línea 28 |

---

¿Necesitas ayuda con alguna configuración específica? Revisa este documento paso a paso.
