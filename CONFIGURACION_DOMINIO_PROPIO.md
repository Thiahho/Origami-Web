# 🌐 Configuración de Dominio Propio - Origami Importados

Tienes un dominio propio, ¡excelente! Esta guía te explica cómo configurarlo con Render + Vercel.

## 📊 OPCIÓN RECOMENDADA: Usar Tu Dominio Propio

### ✅ Ventajas de usar tu dominio:

1. **Profesional** - `origamiimportados.com` vs `origami-importados.vercel.app`
2. **SEO** - Mejor posicionamiento en Google
3. **Branding** - Tu marca, tu dominio
4. **Credibilidad** - Los clientes confían más
5. **Email profesional** - `admin@origamiimportados.com`
6. **Control total** - Puedes cambiar de proveedor cuando quieras

### ⚠️ Desventajas (mínimas):

1. Configuración inicial (15-30 minutos)
2. Propagación DNS (puede tardar hasta 48 horas, usualmente 1-2 horas)
3. Render Free no permite custom domain (necesitas Starter $7/mo)

---

## 🎯 ARQUITECTURA RECOMENDADA

Voy a recomendarte la mejor estructura para tu dominio:

```
┌─────────────────────────────────────────────────────────┐
│                  TU DOMINIO                             │
│              origamiimportados.com                      │
└─────────────────────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │                               │
         ▼                               ▼
┌──────────────────┐           ┌──────────────────┐
│    FRONTEND      │           │     BACKEND      │
│     (Vercel)     │           │     (Render)     │
├──────────────────┤           ├──────────────────┤
│ origami...com    │           │ api.origami...   │
│ www.origami...   │           │                  │
└──────────────────┘           └──────────────────┘
```

### Subdominios recomendados:

| Subdominio | Servicio | Uso |
|------------|----------|-----|
| `origamiimportados.com` | **Vercel** | Sitio principal |
| `www.origamiimportados.com` | **Vercel** | Alias del principal |
| `api.origamiimportados.com` | **Render** | Backend API |

---

## 📝 CONFIGURACIÓN PASO A PASO

### PASO 1: Configurar Frontend en Vercel (10 minutos)

#### 1.1. Agregar dominio en Vercel

1. **Ir a Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Seleccionar tu proyecto: `origami-importados`

2. **Settings → Domains → Add Domain:**
   ```
   origamiimportados.com
   ```

3. **Vercel te mostrará:**
   ```
   ⚠️ To use this domain, configure your DNS provider:

   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

4. **GUARDAR ESTA INFORMACIÓN** para el siguiente paso

#### 1.2. Configurar DNS de tu dominio

**Dependiendo de dónde compraste el dominio:**

##### Si es GoDaddy:

1. Ir a: https://dcc.godaddy.com/manage/
2. Buscar tu dominio → Click en DNS
3. **Agregar/Editar registros:**

   **Registro A (dominio raíz):**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   TTL: 1 Hour (o 600 segundos)
   ```

   **Registro CNAME (www):**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   TTL: 1 Hour
   ```

##### Si es Namecheap:

1. Ir a: https://ap.www.namecheap.com/
2. Domain List → Manage → Advanced DNS
3. **Agregar registros:**

   ```
   Type: A Record
   Host: @
   Value: 76.76.21.21
   TTL: Automatic

   Type: CNAME Record
   Host: www
   Value: cname.vercel-dns.com
   TTL: Automatic
   ```

##### Si es Cloudflare (Recomendado):

1. Ir a: https://dash.cloudflare.com/
2. Seleccionar tu dominio → DNS → Records
3. **Agregar registros:**

   ```
   Type: A
   Name: @
   Content: 76.76.21.21
   Proxy: ✅ Proxied (naranja) - Recomendado para CDN gratis

   Type: CNAME
   Name: www
   Content: cname.vercel-dns.com
   Proxy: ✅ Proxied
   ```

   ⚠️ **Si usas Cloudflare con proxy:**
   - Beneficios: CDN gratis, protección DDoS, SSL automático
   - En Vercel puede tardar más en verificar el dominio
   - Solución: Temporalmente desactivar proxy (nube gris), verificar, reactivar

#### 1.3. Verificar en Vercel

1. **Volver a Vercel → Domains**
2. **Esperar 1-2 minutos** (puede tardar hasta 48 horas)
3. **Cuando veas:** ✅ Valid Configuration
4. **SSL automático:** Vercel configura HTTPS automáticamente

#### 1.4. Configurar redirect www → dominio principal

En Vercel, por defecto:
- `origamiimportados.com` es el principal
- `www.origamiimportados.com` redirige automáticamente

Si quieres cambiar esto:
- Settings → Domains → Click en los 3 puntos → Set as Primary

---

### PASO 2: Configurar Backend en Render (15 minutos)

⚠️ **IMPORTANTE:** Render Free NO permite custom domains. Necesitas:
- **Render Starter:** $7/mo (backend always-on + custom domain)

#### Opción A: Usar dominio custom (Recomendado - $7/mo)

##### 2.1. Upgrade a Render Starter

1. **Ir a Render Dashboard**
2. **Tu servicio** → Settings → Plan
3. **Upgrade to Starter** ($7/mo)
   - Always-on (no cold starts)
   - 512 MB RAM
   - Custom domain incluido

##### 2.2. Agregar custom domain

1. **Settings → Custom Domain**
2. **Agregar:**
   ```
   api.origamiimportados.com
   ```

3. **Render te mostrará:**
   ```
   Add the following CNAME record to your DNS:

   Type: CNAME
   Name: api
   Value: origami-backend-api.onrender.com
   ```

##### 2.3. Configurar DNS

**En tu proveedor de dominio** (GoDaddy, Namecheap, Cloudflare):

```
Type: CNAME
Name: api
Value: origami-backend-api.onrender.com
TTL: 1 Hour (o Automatic)
```

**Si usas Cloudflare:**
```
Type: CNAME
Name: api
Content: origami-backend-api.onrender.com
Proxy: ❌ DNS Only (nube gris) - Render requiere DNS directo
```

##### 2.4. Verificar SSL

Render configura SSL automáticamente (Let's Encrypt):
- Esperar 5-10 minutos
- Verificar: `https://api.origamiimportados.com/health`

#### Opción B: Mantener URL de Render (Gratis)

Si no quieres pagar $7/mo:

1. **Usar URL de Render:** `https://origami-backend-api.onrender.com`
2. **Ventajas:**
   - Gratis
   - SSL automático
   - Funciona perfectamente
3. **Desventajas:**
   - Menos profesional
   - URL larga
   - Cold starts (15 min inactividad)

**Esta opción es TOTALMENTE VÁLIDA para empezar.**

---

### PASO 3: Actualizar Configuraciones (5 minutos)

Ahora que tienes tus dominios configurados, actualizar el código:

#### 3.1. Actualizar URL del Backend

**Editar:** `admin/js/config.js` línea 30

**Si elegiste Opción A (custom domain):**
```javascript
production: {
  apiUrl: "https://api.origamiimportados.com",
  apiTimeout: 30000,
  enableLogging: false,
}
```

**Si elegiste Opción B (Render URL):**
```javascript
production: {
  apiUrl: "https://origami-backend-api.onrender.com",
  apiTimeout: 30000,
  enableLogging: false,
}
```

#### 3.2. Actualizar CORS en Render

**Render Dashboard** → tu servicio → Environment → Variables

**Editar `CORS_ORIGINS`:**

```env
CORS_ORIGINS=https://origamiimportados.com,https://www.origamiimportados.com
```

⚠️ **Importante:**
- Sin espacios entre comas
- Incluir `https://`
- Ambos dominios (con y sin www)

#### 3.3. Actualizar Cloudflare Turnstile

**Cloudflare Dashboard** → Turnstile → Editar sitio

**Domains:** Cambiar de:
```
origami-importados.vercel.app
```

A:
```
origamiimportados.com
www.origamiimportados.com
```

#### 3.4. Deploy cambios

```bash
git add .
git commit -m "Update to custom domain"
git push
```

- Vercel auto-deploya en 1-2 minutos
- Render auto-deploya en 5-10 minutos

---

### PASO 4: Verificación Final (5 minutos)

#### 4.1. Verificar Frontend

```
✅ https://origamiimportados.com
✅ https://www.origamiimportados.com (debería redirigir)
✅ https://origamiimportados.com/admin/dashboard.html
```

#### 4.2. Verificar Backend

**Si usas custom domain:**
```
✅ https://api.origamiimportados.com/health
```

**Si usas Render URL:**
```
✅ https://origami-backend-api.onrender.com/health
```

#### 4.3. Verificar Conexión

1. Abrir: `https://origamiimportados.com/admin/dashboard.html`
2. Login con: `admin@origami.com` / `origami2025`
3. Abrir consola (F12) → Network tab
4. Verificar peticiones van a tu API (custom domain o Render)
5. ✅ Login exitoso = Todo funciona!

---

## 💰 COMPARACIÓN DE COSTOS

### Opción 1: Custom Domain (Recomendado)

| Servicio | Costo | Beneficios |
|----------|-------|-----------|
| **Dominio** | $10-15/año | Ya lo tienes |
| **Vercel** | Gratis | Hosting frontend + SSL |
| **Render Starter** | $7/mo | Backend always-on + custom domain |
| **PostgreSQL** | $7/mo | Después de 90 días |
| **TOTAL** | **$14/mo** | Profesional, sin cold starts |

**URLs finales:**
- Frontend: `https://origamiimportados.com`
- Backend: `https://api.origamiimportados.com`

### Opción 2: Dominio solo para Frontend

| Servicio | Costo | Beneficios |
|----------|-------|-----------|
| **Dominio** | $10-15/año | Ya lo tienes |
| **Vercel** | Gratis | Hosting frontend + SSL |
| **Render Free** | Gratis (90 días) | Backend básico |
| **PostgreSQL** | $7/mo | Después de 90 días |
| **TOTAL** | **$7/mo** | Frontend profesional |

**URLs finales:**
- Frontend: `https://origamiimportados.com`
- Backend: `https://origami-backend-api.onrender.com`

### Opción 3: Todo con URLs de plataforma (Gratis)

| Servicio | Costo | Limitaciones |
|----------|-------|-------------|
| **Vercel** | Gratis | Solo URLs de Vercel |
| **Render** | Gratis (90 días) | Cold starts, solo 90 días BD gratis |
| **TOTAL** | **Gratis** → $7/mo | URLs largas, cold starts |

**URLs finales:**
- Frontend: `https://origami-importados.vercel.app`
- Backend: `https://origami-backend-api.onrender.com`

---

## 🎯 MI RECOMENDACIÓN

### Para empezar (Primeros 1-3 meses):

**Opción 2:** Dominio solo para frontend ($7/mo después de 90 días)

**Por qué:**
- ✅ Frontend profesional con tu dominio
- ✅ Costo mínimo
- ✅ Backend funciona bien (aunque sea URL larga)
- ✅ Puedes upgradear cuando tengas tráfico

**Cómo hacerlo:**
1. Configurar dominio en Vercel (PASO 1)
2. Usar Render Free con su URL (Opción B del PASO 2)
3. Total: Gratis primeros 90 días, luego $7/mo

### Cuando tengas tráfico constante (3+ meses):

**Opción 1:** Custom domain completo ($14/mo)

**Por qué:**
- ✅ 100% profesional
- ✅ No más cold starts
- ✅ Backend siempre disponible
- ✅ URLs limpias y consistentes

---

## 📋 CHECKLIST DE CONFIGURACIÓN

### Dominio en Vercel (Frontend)
- [ ] Dominio agregado en Vercel
- [ ] Registro A configurado en DNS (@)
- [ ] Registro CNAME configurado (www)
- [ ] Dominio verificado (✅ en Vercel)
- [ ] SSL activo (candado verde)
- [ ] `https://origamiimportados.com` carga correctamente

### Dominio en Render (Backend) - OPCIONAL
- [ ] Upgrade a Render Starter ($7/mo)
- [ ] Custom domain agregado (api.origamiimportados.com)
- [ ] Registro CNAME configurado en DNS
- [ ] SSL activo en Render
- [ ] `https://api.origamiimportados.com/health` responde

### Código actualizado
- [ ] `admin/js/config.js` con URL correcta
- [ ] `CORS_ORIGINS` en Render con dominio real
- [ ] Turnstile con dominios actualizados
- [ ] Cambios pusheados a GitHub
- [ ] Auto-deploy completado en Vercel y Render

---

## 🆘 TROUBLESHOOTING

### "Mi dominio no funciona después de 2 horas"

1. ✅ Verificar DNS con: https://dnschecker.org/
   - Buscar: `origamiimportados.com`
   - Debe apuntar a IP de Vercel
2. ✅ Limpiar caché del navegador (Ctrl + Shift + R)
3. ✅ Probar en modo incógnito
4. ✅ Esperar hasta 48 horas (raro pero posible)

### "SSL no funciona / Certificate error"

1. ✅ Esperar 10-30 minutos (Vercel/Render generan SSL automático)
2. ✅ Verificar que DNS esté propagado
3. ✅ En Cloudflare: SSL/TLS mode debe ser "Full"

### "www no funciona pero dominio raíz sí"

1. ✅ Verificar registro CNAME de `www`
2. ✅ En Vercel, ambos dominios deben aparecer
3. ✅ Verificar con: https://dnschecker.org/ → buscar `www.origamiimportados.com`

### "Backend con custom domain no funciona"

1. ✅ Verificar que tienes Render Starter (no Free)
2. ✅ Registro CNAME debe apuntar a `origami-backend-api.onrender.com`
3. ✅ En Cloudflare, proxy debe estar DESACTIVADO (nube gris)
4. ✅ Esperar 5-10 minutos para SSL

---

## ✅ RESUMEN

**TU DOMINIO: `origamiimportados.com`**

**Configuración recomendada:**

```
┌─────────────────────────────────────────────┐
│   origamiimportados.com (Frontend)          │
│   └─ Vercel (Gratis + SSL)                  │
│                                              │
│   api.origamiimportados.com (Backend)       │
│   └─ Render Starter ($7/mo) - OPCIONAL      │
│                                              │
│   O usar: origami-backend-api.onrender.com  │
│   └─ Render Free (Gratis 90 días)           │
└─────────────────────────────────────────────┘
```

**Siguiente paso:** Seguir la guía `DEPLOYMENT_RENDER_VERCEL.md` con tu dominio configurado.
