# 📧 Configuración del Sistema de Contacto

El sistema de contacto ha sido migrado de **EmailJS** a un sistema backend robusto con las siguientes características:

## ✨ Características

- ✅ **Backend propio** - No dependes de servicios externos
- ✅ **Cloudflare Turnstile (CAPTCHA)** - Protección contra bots y spam
- ✅ **Honeypot** - Campo invisible para detectar bots automáticamente
- ✅ **Rate Limiting** - Máximo 5 mensajes por minuto por IP
- ✅ **Validaciones completas** - Email válido, longitud de mensaje (20-2000 caracteres)
- ✅ **SMTP flexible** - Soporta Gmail, SendGrid, AWS SES, Mailgun, etc.
- ✅ **Respuestas seguras** - Mensajes genéricos para no ayudar a spammers

## 🔧 Configuración Paso a Paso

### 1. Obtener Claves de Cloudflare Turnstile (CAPTCHA)

Turnstile es **gratis e ilimitado** y reemplaza a reCAPTCHA.

1. Ve a: https://dash.cloudflare.com/
2. Regístrate o inicia sesión
3. Selecciona tu cuenta → **Turnstile**
4. Click en **"Add Site"**
5. Configura:
   - **Site name:** Origami Contacto
   - **Domain:** Tu dominio (ej: `origamiimportados.com`) o `localhost` para testing
   - **Widget Mode:** Managed (recomendado)
6. Obtendrás dos claves:
   - **Site Key** (pública) → va en el frontend
   - **Secret Key** (privada) → va en el backend

#### Claves de Testing (para desarrollo):
```
Site Key: 1x00000000000000000000AA
Secret Key: 1x0000000000000000000000000000000AA
```
**Importante:** Estas claves SIEMPRE pasan la verificación. Úsalas solo en desarrollo.

### 2. Configurar Gmail para SMTP

#### Opción A: Gmail (Recomendado para empezar)

1. **Habilitar autenticación de 2 pasos:**
   - Ve a: https://myaccount.google.com/security
   - Activa "Verificación en dos pasos"

2. **Generar contraseña de aplicación:**
   - Ve a: https://myaccount.google.com/apppasswords
   - Selecciona app: "Correo"
   - Selecciona dispositivo: "Otro" → escribe "Origami Backend"
   - Copia la contraseña de 16 caracteres generada

3. **Configurar variables de entorno** (ver paso 3)

#### Opción B: Mailtrap (Solo para testing sin enviar emails reales)

1. Regístrate gratis en: https://mailtrap.io
2. Ve a **Email Testing** → **Inboxes** → **My Inbox**
3. Copia las credenciales SMTP:
   ```
   Host: sandbox.smtp.mailtrap.io
   Port: 2525
   Username: [tu usuario]
   Password: [tu password]
   ```

#### Opción C: Otros proveedores

- **SendGrid**: https://sendgrid.com/ (100 emails/día gratis)
- **Resend**: https://resend.com/ (100 emails/día gratis, muy recomendado)
- **AWS SES**: https://aws.amazon.com/ses/ (62,000 emails/mes gratis)
- **Mailgun**: https://www.mailgun.com/ (5,000 emails/mes gratis)

### 3. Configurar Variables de Entorno

#### Para Desarrollo Local:

1. Copia el archivo de ejemplo:
   ```bash
   cd Backend
   cp .env.development.example .env.development
   ```

2. Edita `.env.development` y completa:
   ```env
   # SMTP (Gmail)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=tu_email@gmail.com
   SMTP_PASSWORD=tu_password_de_aplicacion_de_16_caracteres
   EMAIL_DESTINO=origami.importadosok@gmail.com

   # Turnstile (testing keys)
   TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
   ```

#### Para Producción:

1. Copia el archivo de ejemplo:
   ```bash
   cd Backend
   cp .env.production.example .env.production
   ```

2. Edita `.env.production` y completa:
   ```env
   # SMTP (Gmail)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=origami.importadosok@gmail.com
   SMTP_PASSWORD=xxxx xxxx xxxx xxxx
   EMAIL_DESTINO=origami.importadosok@gmail.com

   # Turnstile (tus claves reales)
   TURNSTILE_SECRET_KEY=0x0000000000000000000000000000000000000
   ```

3. **En Render / tu servidor:**
   - Ve a **Environment** → **Environment Variables**
   - Agrega las mismas variables de `.env.production`

### 4. Configurar Site Key en el Frontend

Edita `Nosotros/js/contacto.js` línea 11:

```javascript
// Reemplaza con tu Site Key real
const TURNSTILE_SITE_KEY = "1x00000000000000000000AA"; // 🔑 Cámbiala en producción
```

### 5. Probar el Sistema

1. **Iniciar el backend:**
   ```bash
   cd Backend
   dotnet run
   ```

2. **Abrir el formulario:**
   ```
   http://localhost:5015/Nosotros/nosotros.html
   ```

3. **Completar el formulario:**
   - Nombre: Tu nombre (mínimo 2 caracteres)
   - Email: email@valido.com
   - Mensaje: Al menos 20 caracteres
   - Completar el CAPTCHA
   - Click en "Enviar"

4. **Verificar:**
   - Deberías ver: "¡Mensaje enviado exitosamente!"
   - Revisa tu email (el de `EMAIL_DESTINO`)
   - Verifica logs del backend

## 🛡️ Seguridad Implementada

### 1. Campo Honeypot
```html
<!-- Campo oculto que los bots llenan pero los humanos no ven -->
<input type="text" name="website" id="website" style="position: absolute; left: -9999px" />
```
Si este campo tiene contenido → rechazar silenciosamente con 200 OK

### 2. CAPTCHA (Cloudflare Turnstile)
- Verifica que el usuario es humano
- Validación server-to-server (imposible de falsificar)

### 3. Rate Limiting por IP
- **Desarrollo:** 100 req/min
- **Producción:** 5 req/min
- Respuesta 429 si se excede

### 4. Validaciones Backend
```csharp
[Required]
[StringLength(100, MinimumLength = 2)]
public string Name { get; set; }

[Required]
[EmailAddress]
public string Email { get; set; }

[Required]
[StringLength(2000, MinimumLength = 20)]
public string Message { get; set; }
```

## 📊 Endpoints

### POST `/api/contacto`

**Request Body:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "message": "Hola, quisiera información sobre sus productos...",
  "website": "",
  "turnstileToken": "0.abc123..."
}
```

**Respuestas:**

✅ **200 OK** - Mensaje enviado
```json
{
  "message": "Mensaje enviado exitosamente. Te responderemos pronto."
}
```

❌ **400 Bad Request** - Datos inválidos
```json
{
  "message": "Datos inválidos"
}
```

❌ **429 Too Many Requests** - Rate limit excedido
```json
{
  "message": "Has enviado demasiados mensajes. Por favor, espera un momento e intenta nuevamente."
}
```

❌ **503 Service Unavailable** - Error SMTP
```json
{
  "message": "Error temporal al procesar tu mensaje. Por favor, intenta más tarde o contáctanos por WhatsApp."
}
```

## 🔍 Testing

### Probar con CAPTCHA de testing:
```javascript
// En contacto.js línea 11, usa:
const TURNSTILE_SITE_KEY = "1x00000000000000000000AA";

// Y en .env.development:
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

### Probar Honeypot:
Abre la consola del navegador y ejecuta:
```javascript
document.getElementById('website').value = 'spam';
// Luego envía el formulario → debería devolver 200 OK sin enviar email
```

### Probar Rate Limiting:
Envía 6 mensajes seguidos → el 6to debería dar error 429

## 📝 Logs

El backend logea:
- ✅ Mensajes enviados exitosamente
- ⚠️ Bots detectados por honeypot
- ⚠️ CAPTCHA inválidos
- ❌ Errores SMTP

Revisa `Backend/logs/origamiback-YYYYMMDD.log`

## 🚀 Despliegue en Render

1. **Agregar variables de entorno en Render:**
   - SMTP_HOST=smtp.gmail.com
   - SMTP_PORT=587
   - SMTP_USER=origami.importadosok@gmail.com
   - SMTP_PASSWORD=(tu contraseña de aplicación)
   - EMAIL_DESTINO=origami.importadosok@gmail.com
   - TURNSTILE_SECRET_KEY=(tu secret key real)

2. **Actualizar Site Key en el frontend** antes de hacer push

3. **Probar en producción**

## ❓ Troubleshooting

### "Turnstile no configurado"
- ✅ Verifica que `TURNSTILE_SECRET_KEY` esté en las variables de entorno
- ✅ En desarrollo, funciona sin CAPTCHA (por seguridad se permite)

### "SMTP no configurado"
- ✅ Verifica que `SMTP_USER` y `SMTP_PASSWORD` estén configurados
- ✅ Si usas Gmail, verifica que la contraseña de aplicación sea correcta

### Emails no llegan
- ✅ Revisa la carpeta de spam
- ✅ Verifica los logs del backend
- ✅ Prueba con Mailtrap primero

### CAPTCHA no aparece
- ✅ Verifica que el script de Turnstile se cargue: `<script src="https://challenges.cloudflare.com/turnstile/v0/api.js">`
- ✅ Abre la consola del navegador y busca errores

---

## 📞 Soporte

Si tienes problemas, revisa:
1. Logs del backend: `Backend/logs/`
2. Consola del navegador (F12)
3. Network tab para ver la petición a `/api/contacto`
