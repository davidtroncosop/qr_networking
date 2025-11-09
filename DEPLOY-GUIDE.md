# 🚀 Guía de Despliegue Completa - Congress Networking App

Esta guía cubre el despliegue completo de las **Fases 1-5** (Frontend base + Backend + Autenticación + Perfiles + Gestión de Eventos).

## 📋 Requisitos Previos

- Cuenta de Cloudflare (gratuita)
- Repositorio Git (GitHub, GitLab o Bitbucket)
- Node.js instalado localmente (para builds)

---

## 🎯 Parte 1: Desplegar Backend (Cloudflare Worker)

### Paso 1: Preparar el código del Worker

```bash
cd congress-networking-worker
npm install
npm run build
```

Esto genera `dist/index.js` con todo el código empaquetado.

### Paso 2: Crear Worker en Cloudflare

1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. **Workers & Pages** → **Create application** → **Create Worker**
3. Nombre: `congress-networking-api`
4. Click **Deploy**

### Paso 3: Subir el código

1. En la página del Worker, click **Quick edit**
2. Borra el código de ejemplo
3. Abre `congress-networking-worker/dist/index.js`
4. Copia TODO el contenido y pégalo en el editor
5. Click **Save and Deploy**

### Paso 4: Crear Base de Datos D1

1. **Workers & Pages** → **D1**
2. **Create database**
3. Nombre: `congress-networking-db`
4. Click **Create**

### Paso 5: Ejecutar Migraciones SQL

1. En la página de la base de datos, ve a **Console**
2. Copia y pega el SQL completo de `congress-networking-worker/migrations/001_initial_schema.sql`
3. Click **Execute**

> **Nota**: Si el SQL es muy largo, ejecútalo en partes (primero las tablas, luego los índices).

### Paso 6: Vincular D1 al Worker

1. Ve a tu Worker → **Settings** → **Bindings**
2. **Add binding** → **D1 database**
3. Variable name: `DB`
4. D1 database: `congress-networking-db`
5. **Save**

### Paso 7: Configurar Variables de Entorno

1. Worker → **Settings** → **Variables**
2. Agrega estas variables:

```
JWT_SECRET=tu-secret-super-seguro-cambiame-123456789
FRONTEND_URL=https://tu-app.pages.dev
```

> **Importante**: Cambia `JWT_SECRET` por un string aleatorio largo y seguro.
> Actualizarás `FRONTEND_URL` después de desplegar el frontend.

3. Click **Save**

### Paso 8: Verificar el Backend

Copia la URL de tu Worker (ej: `https://congress-networking-api.your-subdomain.workers.dev`)

Prueba el health check:

```bash
curl https://congress-networking-api.your-subdomain.workers.dev/
```

Deberías recibir:

```json
{
  "success": true,
  "message": "Congress Networking API",
  "version": "1.0.0"
}
```

✅ **Backend desplegado correctamente!**

---

## 🎨 Parte 2: Desplegar Frontend (Cloudflare Pages)

### Paso 1: Preparar el repositorio Git

Si aún no tienes el código en Git:

```bash
cd congress-networking-app
git init
git add .
git commit -m "Deploy: Fases 1-5 completas"
git branch -M main
git remote add origin <tu-repositorio-url>
git push -u origin main
```

### Paso 2: Crear proyecto en Cloudflare Pages

1. [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. **Workers & Pages** → **Create application** → **Pages**
3. **Connect to Git**
4. Autoriza Cloudflare y selecciona tu repositorio

### Paso 3: Configurar Build

- **Project name**: `congress-networking-app`
- **Production branch**: `main`
- **Framework preset**: `Vite`
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/congress-networking-app` (si está en subcarpeta, sino déjalo vacío)

### Paso 4: Variables de Entorno

En **Environment variables**, agrega:

```
VITE_API_URL=https://congress-networking-api.your-subdomain.workers.dev
```

> Usa la URL de tu Worker del Paso 8 de la Parte 1.

### Paso 5: Deploy

1. Click **Save and Deploy**
2. Espera a que termine el build (2-3 minutos)
3. Recibirás una URL como: `https://congress-networking-app.pages.dev`

### Paso 6: Actualizar CORS en el Backend

Ahora que tienes la URL del frontend, actualiza el Worker:

1. Ve a tu Worker → **Settings** → **Variables**
2. Edita `FRONTEND_URL` con la URL de Cloudflare Pages:
   ```
   FRONTEND_URL=https://congress-networking-app.pages.dev
   ```
3. **Save**

✅ **Frontend desplegado correctamente!**

---

## 🧪 Parte 3: Probar la Aplicación

### 1. Accede a tu app

Abre: `https://congress-networking-app.pages.dev`

### 2. Flujo de Prueba Completo

#### Como Organizador:

1. **Registro/Login**
   - Click "Iniciar Sesión"
   - Ingresa tu email
   - Revisa la consola del navegador para el magic link (en producción, esto se enviaría por email)
   - Copia el token y pégalo en la URL: `/auth/verify?token=TU_TOKEN`

2. **Completar Perfil**
   - Completa tu nombre, cargo, empresa
   - Selecciona áreas de interés
   - Guarda el perfil

3. **Crear Evento**
   - Ve al Dashboard
   - Click "Crear Evento"
   - Completa el formulario:
     - Nombre: "Tech Summit 2025"
     - Descripción: "Congreso de tecnología"
     - Fechas de inicio y fin
     - Ubicación
   - Click "Crear Evento"

4. **Ver Evento**
   - Verás el QR del evento generado
   - Descarga el QR
   - Copia la URL del evento
   - Comparte con asistentes

#### Como Asistente:

1. **Registro**
   - Abre la URL del evento compartida
   - Regístrate con tu email
   - Completa tu perfil

2. **Ver Evento**
   - Verás tu QR personal
   - Podrás ver la lista de asistentes

---

## 🔧 Troubleshooting

### Backend

#### Error: "DB is not defined"
- Verifica el binding D1 en Worker → Settings → Bindings
- El nombre debe ser exactamente `DB`

#### Error: "JWT_SECRET is not defined"
- Verifica las variables de entorno en Worker → Settings → Variables
- Asegúrate de hacer click en "Save"

#### Error de CORS
- Verifica que `FRONTEND_URL` esté configurado correctamente
- Debe coincidir exactamente con la URL de Cloudflare Pages

### Frontend

#### Build falla
- Verifica que todas las dependencias estén en `package.json`
- Revisa los logs de build en Cloudflare Pages

#### API no responde
- Verifica que `VITE_API_URL` esté configurado correctamente
- Abre DevTools → Network para ver las peticiones
- Verifica que el Worker esté activo

#### Rutas 404
- Cloudflare Pages maneja automáticamente el SPA routing
- Si hay problemas, agrega `_redirects` en `public/`:
  ```
  /* /index.html 200
  ```

---

## 📊 Funcionalidades Desplegadas

### ✅ Fase 1: Frontend Base
- Landing page
- Navegación
- Diseño responsive

### ✅ Fase 2: Backend Base
- API REST con Hono
- Base de datos D1
- Autenticación con Magic Links

### ✅ Fase 3: Autenticación Frontend
- Login con email
- Verificación de magic links
- Gestión de sesiones con JWT

### ✅ Fase 4: Gestión de Usuarios
- Perfiles de usuario
- Áreas de interés
- Actualización de perfil

### ✅ Fase 5: Gestión de Eventos
- Crear eventos (organizadores)
- Generar QR de eventos
- Registrarse a eventos (asistentes)
- Ver lista de asistentes
- Activar/desactivar eventos

---

## 🔄 Deploys Automáticos

Cloudflare Pages está configurado para deploy automático:

- **Production**: Cada push a `main`
- **Preview**: Cada push a otras ramas o PRs

Para actualizar:

```bash
git add .
git commit -m "Update: descripción del cambio"
git push origin main
```

Cloudflare Pages detectará el cambio y hará deploy automáticamente.

---

## 🎯 Próximos Pasos

Con las Fases 1-5 desplegadas, puedes continuar con:

### Fase 6: Sistema de Conexiones y QR
- QR personal para cada asistente
- Escanear QR con cámara
- Crear conexiones entre asistentes
- Guardar contactos automáticamente

### Fase 7: Dashboard de Métricas
- Estadísticas de eventos
- Gráficos de conexiones
- Análisis de networking

### Fase 8: PWA y Offline
- Instalable como app
- Funcionalidad offline
- Notificaciones push

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs en Cloudflare Dashboard
2. Verifica las variables de entorno
3. Asegúrate de que las migraciones SQL se ejecutaron correctamente
4. Revisa la consola del navegador para errores de frontend

---

## 🎉 ¡Listo!

Tu aplicación de networking para congresos está desplegada y funcionando. Los organizadores pueden crear eventos y los asistentes pueden registrarse y conectar entre sí.

**URLs importantes:**
- Frontend: `https://congress-networking-app.pages.dev`
- Backend: `https://congress-networking-api.your-subdomain.workers.dev`
- Dashboard Cloudflare: `https://dash.cloudflare.com/`
