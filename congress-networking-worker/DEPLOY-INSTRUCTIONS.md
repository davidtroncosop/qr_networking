# Instrucciones de Deploy - Cloudflare Worker (Sin Wrangler)

## Paso 1: Preparar el código

1. Instala las dependencias localmente:
```bash
cd congress-networking-worker
npm install
```

2. Construye el bundle:
```bash
npm run build
```

Esto generará un archivo `dist/index.js` con todo el código empaquetado.

## Paso 2: Crear el Worker en Cloudflare Dashboard

1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navega a **Workers & Pages**
3. Haz clic en **Create application** > **Create Worker**
4. Dale un nombre: `congress-networking-api`
5. Haz clic en **Deploy**

## Paso 3: Subir el código

1. En la página del Worker, haz clic en **Quick edit**
2. Borra todo el código de ejemplo
3. Abre el archivo `dist/index.js` que generaste
4. Copia todo el contenido
5. Pégalo en el editor del Worker
6. Haz clic en **Save and Deploy**

## Paso 4: Configurar Variables de Entorno

1. En la página del Worker, ve a **Settings** > **Variables**
2. Agrega las siguientes variables:

### Environment Variables:
- `JWT_SECRET`: Un string aleatorio largo (ej: `tu-secret-super-seguro-aqui-123456`)
- `FRONTEND_URL`: La URL de tu frontend en Cloudflare Pages (ej: `https://congress-networking-app.pages.dev`)

3. Haz clic en **Save**

## Paso 5: Crear la Base de Datos D1

1. En el Dashboard de Cloudflare, ve a **Workers & Pages** > **D1**
2. Haz clic en **Create database**
3. Nombre: `congress-networking-db`
4. Haz clic en **Create**

## Paso 6: Ejecutar las Migraciones SQL

1. En la página de la base de datos D1, ve a **Console**
2. Copia y pega el siguiente SQL (en partes si es necesario):

```sql
-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  job_title TEXT,
  company TEXT,
  phone TEXT,
  photo_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  instagram_url TEXT,
  website_url TEXT,
  default_role TEXT DEFAULT 'attendee',
  auth_provider TEXT DEFAULT 'email',
  linkedin_id TEXT UNIQUE,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_linkedin_id ON users(linkedin_id);

-- Auth tokens table
CREATE TABLE auth_tokens (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  event_id TEXT,
  intended_role TEXT,
  expires_at INTEGER NOT NULL,
  used INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE INDEX idx_tokens_token ON auth_tokens(token);
CREATE INDEX idx_tokens_email ON auth_tokens(email);
CREATE INDEX idx_tokens_expires ON auth_tokens(expires_at);
```

3. Haz clic en **Execute**

## Paso 7: Vincular D1 al Worker

1. Ve a la página de tu Worker
2. Ve a **Settings** > **Bindings**
3. Haz clic en **Add binding**
4. Selecciona **D1 database**
5. Variable name: `DB`
6. D1 database: Selecciona `congress-networking-db`
7. Haz clic en **Save**

## Paso 8: Verificar el Deploy

1. Copia la URL de tu Worker (algo como: `https://congress-networking-api.your-subdomain.workers.dev`)
2. Prueba el health check:
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

## Paso 9: Probar la Autenticación

### Solicitar Magic Link:
```bash
curl -X POST https://congress-networking-api.your-subdomain.workers.dev/api/auth/request-magic-link \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

Respuesta (incluye el token temporalmente para desarrollo):
```json
{
  "success": true,
  "message": "Magic link sent to your email",
  "token": "abc123..."
}
```

### Verificar Magic Link:
```bash
curl -X POST https://congress-networking-api.your-subdomain.workers.dev/api/auth/verify-magic-link \
  -H "Content-Type: application/json" \
  -d '{"token":"abc123..."}'
```

Respuesta:
```json
{
  "success": true,
  "jwt": "eyJ...",
  "user": {...},
  "isNewUser": true
}
```

## Paso 10: Actualizar el Frontend

1. Ve a tu proyecto de Cloudflare Pages
2. En **Settings** > **Environment variables**
3. Actualiza `VITE_API_URL` con la URL de tu Worker:
```
VITE_API_URL=https://congress-networking-api.your-subdomain.workers.dev
```
4. Redeploy el frontend

## Troubleshooting

### Error: "DB is not defined"
- Verifica que el binding D1 esté configurado correctamente
- El nombre de la variable debe ser exactamente `DB`

### Error: "JWT_SECRET is not defined"
- Verifica que las variables de entorno estén configuradas
- Asegúrate de hacer clic en "Save" después de agregarlas

### Error de CORS
- Verifica que `FRONTEND_URL` esté configurado correctamente
- El Worker permite localhost para desarrollo automáticamente

### El código no se actualiza
- Después de pegar el código, asegúrate de hacer clic en "Save and Deploy"
- Espera unos segundos para que se propague

## Próximos Pasos

✅ Fase 2 completada - Backend base con autenticación

Ahora puedes continuar con:
- Fase 3: Componentes de autenticación en el frontend
- Fase 4: Gestión de usuarios y perfiles
