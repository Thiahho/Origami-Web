# 🏪 Origami Importados - E-commerce Platform

Plataforma de e-commerce moderna para Origami Importados, especializada en dispositivos electrónicos importados.

## 🚀 Stack Tecnológico

### Backend
- **.NET 8.0** - API REST
- **PostgreSQL 15** - Base de datos
- **Entity Framework Core** - ORM
- **JWT** - Autenticación
- **BCrypt** - Hashing de passwords
- **Serilog** - Logging estructurado
- **Cloudflare Turnstile** - CAPTCHA

### Frontend
- **HTML5 / CSS3 / JavaScript** - Vanilla (sin frameworks)
- **Glass-morphism Design** - UI moderna
- **Axios** - Cliente HTTP
- **Font Awesome 6** - Iconografía

### Deployment
- **Render.com** - Backend hosting
- **Vercel.com** - Frontend hosting
- **Docker** - Containerización

---

## 📁 Estructura del Proyecto

```
Origami-Liquid-/
├── Backend/                    # API .NET 8.0
│   ├── Controllers/            # REST API endpoints
│   ├── Services/               # Lógica de negocio
│   ├── Data/                   # DbContext, configuración EF
│   ├── Models/                 # Entidades de BD
│   ├── DTOs/                   # Data Transfer Objects
│   ├── Middleware/             # JWT, Rate Limiting
│   ├── Migrations/             # Migraciones de EF Core
│   ├── Dockerfile              # Imagen Docker
│   └── .env.production         # Variables de entorno (NO commitear)
│
├── admin/                      # Panel de administración
│   ├── dashboard.html          # Dashboard principal
│   ├── js/                     # Lógica del admin
│   │   ├── config.js           # Configuración de API
│   │   ├── api-service.js      # Cliente API (axios)
│   │   ├── auth.js             # Autenticación
│   │   ├── products.js         # CRUD productos
│   │   ├── categories.js       # CRUD categorías
│   │   └── marcas.js           # CRUD marcas
│   └── auth/                   # Login del admin
│
├── js/                         # JavaScript público
│   ├── config.js               # Config global
│   ├── detalleproducto.js      # Detalle de producto
│   ├── cart.js                 # Carrito de compras
│   └── navbar-loader.js        # Navbar dinámico
│
├── Nosotros/                   # Página de contacto
│   └── js/contacto.js          # Formulario con CAPTCHA
│
├── img/                        # Imágenes optimizadas
├── components/                 # Componentes reutilizables
├── Navbar/                     # Navbar global
├── Footer/                     # Footer global
│
├── render.yaml                 # Config para Render
├── vercel.json                 # Config para Vercel
├── package.json                # Requerido por Vercel
├── Dockerfile                  # Docker del backend
│
└── Documentación/
    ├── DEPLOYMENT_RENDER_VERCEL.md
    ├── CONFIGURACION_APIS.md
    ├── CONFIGURACION_DOMINIO_PROPIO.md
    └── CONFIGURACION_CONTACTO.md
```

---

## ⚙️ Configuración Local

### Prerequisitos

- .NET 8.0 SDK
- PostgreSQL 15+
- Git

### 1. Clonar repositorio

```bash
git clone https://github.com/TU-USUARIO/origami-liquid.git
cd origami-liquid
```

### 2. Configurar Base de Datos

```bash
# Crear base de datos
createdb bdOrigami

# Aplicar migraciones
cd Backend
dotnet ef database update
```

### 3. Configurar variables de entorno

```bash
# Copiar plantilla
cd Backend
cp .env.development.example .env.development

# Editar .env.development con tus credenciales
```

### 4. Ejecutar Backend

```bash
cd Backend
dotnet run
# API disponible en: http://localhost:5015
```

### 5. Abrir Frontend

```bash
# Abrir en navegador:
http://localhost:5015/Home.html
```

---

## 🔌 APIs y Servicios Externos

### Cloudflare Turnstile (CAPTCHA)
- **Gratis e ilimitado**
- Registrarse en: https://dash.cloudflare.com/
- Ver: `CONFIGURACION_CONTACTO.md`

### Gmail SMTP (Emails)
- Usar contraseña de aplicación
- Guía: https://myaccount.google.com/apppasswords
- Ver: `CONFIGURACION_APIS.md`

---

## 🚀 Deployment

### Deployment en Render + Vercel

**Guía completa:** `DEPLOYMENT_RENDER_VERCEL.md`

**Resumen rápido:**

1. **Backend en Render:**
   - Conectar repositorio GitHub
   - Render detecta automáticamente `render.yaml`
   - Configurar variables de entorno
   - Deploy automático

2. **Frontend en Vercel:**
   - Conectar repositorio GitHub
   - Vercel detecta automáticamente `vercel.json`
   - Deploy automático en cada push

### Configurar Dominio Propio

**Guía completa:** `CONFIGURACION_DOMINIO_PROPIO.md`

---

## 🔒 Seguridad

### Archivos Sensibles (NO commitear)

- ❌ `.env.development`
- ❌ `.env.production`
- ❌ `appsettings.Production.json`
- ❌ Certificados (`.key`, `.pem`, `.crt`)
- ❌ Archivos de passwords

### Verificar antes de commit

```powershell
# Ejecutar script de verificación
.\check-sensitive-files.ps1
```

---

## 📊 Características

### Frontend Público
- ✅ Catálogo de productos dinámico
- ✅ Detalle de producto con variantes (RAM, Storage, Color)
- ✅ Carrito de compras (localStorage)
- ✅ Formulario de contacto con CAPTCHA
- ✅ Responsive design
- ✅ Glass-morphism UI

### Panel de Administración
- ✅ Dashboard con métricas
- ✅ CRUD de productos
- ✅ CRUD de categorías
- ✅ CRUD de marcas
- ✅ CRUD de condiciones de producto
- ✅ Gestión de variantes
- ✅ Sistema de cotizaciones
- ✅ Autenticación JWT
- ✅ Conectado al backend API

### Backend API
- ✅ Autenticación JWT con HttpOnly cookies
- ✅ Rate limiting (5 req/min producción)
- ✅ CORS configurado
- ✅ Health checks (`/health`)
- ✅ Logging con Serilog
- ✅ Email service con SMTP
- ✅ Turnstile verification
- ✅ Password hashing con BCrypt

---

## 🔗 URLs

### Desarrollo Local
- Frontend: `http://localhost:5015`
- Admin: `http://localhost:5015/admin/dashboard.html`
- API: `http://localhost:5015/api`
- Health: `http://localhost:5015/health`
- Swagger: `http://localhost:5015/swagger` (solo dev)

### Producción
- Frontend: `https://origamiimportados.com` (o tu dominio)
- Backend: `https://origami-backend-api.onrender.com`
- API: `https://origami-backend-api.onrender.com/api`

---

## 📝 Documentación

| Documento | Descripción |
|-----------|-------------|
| `DEPLOYMENT_RENDER_VERCEL.md` | Guía completa de deployment |
| `CONFIGURACION_APIS.md` | Configuración de APIs externas |
| `CONFIGURACION_DOMINIO_PROPIO.md` | Configurar dominio personalizado |
| `CONFIGURACION_CONTACTO.md` | Configurar formulario de contacto |
| `SEGURIDAD_GIT.md` | Mejores prácticas de seguridad |

---

## 🛠️ Scripts Útiles

```bash
# Backend
dotnet run                    # Ejecutar API
dotnet ef database update     # Aplicar migraciones
dotnet build                  # Compilar
dotnet test                   # Ejecutar tests

# Seguridad
.\check-sensitive-files.ps1   # Verificar archivos sensibles

# Git
git status --ignored          # Ver archivos ignorados
```

---

## 🆘 Troubleshooting

### "Admin no puede hacer login"
1. Verificar que el backend esté corriendo
2. Verificar URL en `admin/js/config.js`
3. Verificar CORS en backend
4. Crear usuario admin en BD si no existe

### "Formulario de contacto no envía emails"
1. Verificar credenciales SMTP en `.env`
2. Ver logs: `Backend/logs/`
3. Verificar Turnstile keys

### "Error de CORS"
1. Verificar `CORS_ORIGINS` en `.env.production`
2. Incluir dominio completo con `https://`
3. No dejar espacios en la lista

---

## 📞 Contacto

- **Sitio Web:** origamiimportados.com
- **Email:** origami.importadosok@gmail.com
- **WhatsApp:** +54 9 11 7237-6181

---

## 📄 Licencia

Propietario - Todos los derechos reservados © Origami Importados

---

**Última actualización:** Noviembre 2025
