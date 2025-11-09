# Congress Networking Worker - Backend API

API serverless para la aplicación de networking de congresos, construida con Cloudflare Workers.

## 🚀 Tecnologías

- Cloudflare Workers (Serverless)
- Hono Framework (Ligero y rápido)
- Cloudflare D1 (SQLite gestionado)
- TypeScript

## 📦 Instalación Local

```bash
npm install
```

## 🏗️ Build

```bash
npm run build
```

Esto genera un bundle en `dist/index.js` listo para desplegar.

## 🌐 Deploy

**Importante:** Este proyecto no usa Wrangler CLI. El deploy se hace manualmente desde el Dashboard de Cloudflare.

Ver instrucciones completas en: [DEPLOY-INSTRUCTIONS.md](./DEPLOY-INSTRUCTIONS.md)

### Resumen rápido:

1. Construir: `npm run build`
2. Crear Worker en Dashboard de Cloudflare
3. Copiar contenido de `dist/index.js` al editor del Worker
4. Configurar variables de entorno (`JWT_SECRET`, `FRONTEND_URL`)
5. Crear base de datos D1
6. Ejecutar migraciones SQL desde `migrations/001_initial_schema.sql`
7. Vincular D1 al Worker

## 📁 Estructura del Proyecto

```
src/
├── routes/          # Rutas de la API
│   ├── auth.ts      # Autenticación (magic links, JWT)
│   ├── users.ts     # Gestión de usuarios
│   ├── events.ts    # Gestión de eventos
│   └── connections.ts # Conexiones entre usuarios
├── utils/           # Utilidades
│   ├── jwt.ts       # Funciones JWT
│   └── crypto.ts    # Funciones criptográficas
├── types/           # Definiciones TypeScript
│   └── index.ts
└── index.ts         # Punto de entrada
```

## 🔐 Autenticación

La API usa Magic Links para autenticación:

1. Usuario solicita magic link con su email
2. Sistema genera token y lo guarda en D1
3. Usuario recibe email con link (por ahora se loggea en consola)
4. Usuario hace clic en el link
5. Sistema verifica token y genera JWT
6. JWT se usa para autenticar requests subsecuentes

## 📡 Endpoints Disponibles

### Health Check
```
GET /
```

### Autenticación

```
POST /api/auth/request-magic-link
Body: { email, eventId?, intendedRole? }

POST /api/auth/verify-magic-link
Body: { token }

GET /api/auth/me
Headers: { Authorization: "Bearer {jwt}" }
```

### Usuarios (Fase 4)
```
POST /api/users
GET /api/users/:userId
PUT /api/users/:userId
```

### Eventos (Fase 5)
```
POST /api/events
GET /api/events/:eventId
PUT /api/events/:eventId
```

### Conexiones (Fase 6)
```
POST /api/connections
GET /api/connections/my-connections
```

## 🔧 Variables de Entorno

Configurar en Cloudflare Dashboard:

- `JWT_SECRET`: Secret para firmar JWTs
- `FRONTEND_URL`: URL del frontend para CORS

## 🗄️ Base de Datos

La base de datos D1 incluye las siguientes tablas:

- `users`: Información de usuarios
- `auth_tokens`: Tokens de magic links

Más tablas se agregarán en fases posteriores:
- `events` (Fase 5)
- `event_registrations` (Fase 5)
- `connections` (Fase 6)
- `user_interests` (Fase 4)

## 🧪 Testing

Para probar los endpoints, usa curl o Postman:

```bash
# Health check
curl https://your-worker.workers.dev/

# Request magic link
curl -X POST https://your-worker.workers.dev/api/auth/request-magic-link \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Verify magic link
curl -X POST https://your-worker.workers.dev/api/auth/verify-magic-link \
  -H "Content-Type: application/json" \
  -d '{"token":"TOKEN_FROM_PREVIOUS_RESPONSE"}'
```

## 📝 Notas de Desarrollo

- **Sin Wrangler**: Este proyecto no usa Wrangler CLI por limitaciones del entorno
- **Deploy Manual**: El código se copia manualmente al Dashboard de Cloudflare
- **Desarrollo Local**: No hay servidor local, se prueba directamente en Cloudflare
- **Logs**: Ver logs en el Dashboard de Cloudflare > Worker > Logs

## 🔄 Actualizar el Worker

Para actualizar el código:

1. Hacer cambios en `src/`
2. Ejecutar `npm run build`
3. Copiar contenido de `dist/index.js`
4. Pegar en el editor del Worker en Cloudflare Dashboard
5. Hacer clic en "Save and Deploy"

## 📚 Próximas Fases

- ✅ Fase 2: Backend base con autenticación (COMPLETADA)
- ⏭️ Fase 3: Componentes de autenticación frontend
- ⏭️ Fase 4: Gestión de usuarios y perfiles
- ⏭️ Fase 5: Gestión de eventos
- ⏭️ Fase 6: Sistema de conexiones y QR

## 📄 Licencia

MIT
