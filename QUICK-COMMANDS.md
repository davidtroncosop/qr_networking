# ⚡ Comandos Rápidos - Copy & Paste

## 🔧 Pre-Deploy

### Verificar que todo funciona
```bash
./verify-before-deploy.sh
```

### Compilar Backend
```bash
cd congress-networking-worker
npm install
npm run build
cd ..
```

### Compilar Frontend
```bash
cd congress-networking-app
npm install
npm run build
cd ..
```

---

## 🔐 Generar JWT Secret

### macOS/Linux
```bash
openssl rand -base64 32
```

### Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 📦 Git Setup

### Inicializar repositorio
```bash
git init
git add .
git commit -m "Initial commit: Congress Networking App - Phases 1-5"
git branch -M main
```

### Agregar remote (GitHub)
```bash
git remote add origin https://github.com/tu-usuario/congress-networking-app.git
git push -u origin main
```

### Agregar remote (GitLab)
```bash
git remote add origin https://gitlab.com/tu-usuario/congress-networking-app.git
git push -u origin main
```

---

## 🗄️ SQL para D1 Database

### Copiar todo el SQL
```bash
cat congress-networking-worker/migrations/001_initial_schema.sql
```

O abre el archivo y copia todo el contenido:
```
congress-networking-worker/migrations/001_initial_schema.sql
```

---

## 🧪 Testing Post-Deploy

### Health Check del Backend
```bash
curl https://TU-WORKER.workers.dev/
```

Respuesta esperada:
```json
{
  "success": true,
  "message": "Congress Networking API",
  "version": "1.0.0"
}
```

### Solicitar Magic Link
```bash
curl -X POST https://TU-WORKER.workers.dev/api/auth/request-magic-link \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Verificar Magic Link
```bash
curl -X POST https://TU-WORKER.workers.dev/api/auth/verify-magic-link \
  -H "Content-Type: application/json" \
  -d '{"token":"TOKEN_AQUI"}'
```

### Obtener perfil (con JWT)
```bash
curl https://TU-WORKER.workers.dev/api/auth/me \
  -H "Authorization: Bearer TU_JWT_AQUI"
```

---

## 🔄 Actualizar después del Deploy

### Backend (Worker)
```bash
cd congress-networking-worker
npm run build
# Luego copiar dist/index.js al editor del Worker
cd ..
```

### Frontend (Pages)
```bash
git add .
git commit -m "Update: descripción del cambio"
git push origin main
# Cloudflare Pages hace deploy automático
```

---

## 📝 Variables de Entorno

### Backend (Worker Settings → Variables)
```
JWT_SECRET=<tu-secret-generado>
FRONTEND_URL=https://tu-app.pages.dev
```

### Frontend (Pages Settings → Environment Variables)
```
VITE_API_URL=https://tu-worker.workers.dev
```

---

## 🔍 Debugging

### Ver logs del Worker
```bash
# En Cloudflare Dashboard:
# Workers → Tu Worker → Logs → Begin log stream
```

### Ver logs del build de Pages
```bash
# En Cloudflare Dashboard:
# Pages → Tu Proyecto → Deployments → Click en el deployment → View build log
```

### Limpiar cache del navegador
```bash
# Chrome/Edge
Cmd+Shift+R (Mac) o Ctrl+Shift+R (Windows)

# Firefox
Cmd+Shift+Delete (Mac) o Ctrl+Shift+Delete (Windows)
```

---

## 📱 URLs Importantes

### Cloudflare Dashboard
```
https://dash.cloudflare.com/
```

### Workers
```
https://dash.cloudflare.com/?to=/:account/workers
```

### Pages
```
https://dash.cloudflare.com/?to=/:account/pages
```

### D1 Databases
```
https://dash.cloudflare.com/?to=/:account/workers/d1
```

---

## 🎯 Flujo Completo de Deploy

### 1. Preparar
```bash
./verify-before-deploy.sh
```

### 2. Generar Secret
```bash
openssl rand -base64 32
# Guarda el resultado
```

### 3. Git (si no está inicializado)
```bash
git init
git add .
git commit -m "Ready for deploy"
git remote add origin <tu-repo-url>
git push -u origin main
```

### 4. Deploy Backend
```
1. Cloudflare Dashboard → Workers → Create Worker
2. Copiar congress-networking-worker/dist/index.js
3. Pegar en editor → Save and Deploy
4. Settings → Bindings → Add D1 (nombre: DB)
5. Settings → Variables → Agregar JWT_SECRET y FRONTEND_URL
```

### 5. Deploy Frontend
```
1. Cloudflare Dashboard → Pages → Connect Git
2. Seleccionar repo
3. Framework: Vite
4. Build: npm run build
5. Output: dist
6. Variables: VITE_API_URL
7. Save and Deploy
```

### 6. Actualizar CORS
```
1. Worker → Settings → Variables
2. Editar FRONTEND_URL con la URL de Pages
3. Save
```

### 7. Probar
```bash
# Health check
curl https://tu-worker.workers.dev/

# Abrir frontend
open https://tu-app.pages.dev
```

---

## 🚨 Troubleshooting Rápido

### Error: "DB is not defined"
```
Worker → Settings → Bindings → Verificar que existe "DB" apuntando a tu D1
```

### Error: "JWT_SECRET is not defined"
```
Worker → Settings → Variables → Verificar que JWT_SECRET existe
```

### Error de CORS
```
Worker → Settings → Variables → Verificar FRONTEND_URL (sin trailing slash)
```

### Frontend no carga
```
Pages → Settings → Environment Variables → Verificar VITE_API_URL
```

### Build falla
```
Pages → Deployment → View logs → Revisar el error
Verificar que package.json tiene todas las dependencias
```

---

## 📊 Verificar que todo funciona

### Checklist Post-Deploy
```bash
# 1. Backend health check
curl https://tu-worker.workers.dev/
# ✅ Debe retornar JSON con success: true

# 2. Frontend carga
open https://tu-app.pages.dev
# ✅ Debe mostrar la landing page

# 3. Registro funciona
# Ir a /auth, ingresar email
# ✅ Debe mostrar mensaje de "Magic link enviado"

# 4. Crear evento funciona
# Login → Dashboard → Crear Evento
# ✅ Debe generar QR del evento

# 5. Registro a evento funciona
# Copiar URL del evento → Abrir en incógnito
# ✅ Debe permitir registrarse
```

---

## 🎉 Deploy Exitoso

Si todos los checks pasan:

```
✅ Backend funcionando
✅ Frontend funcionando
✅ Autenticación funcionando
✅ Eventos funcionando
✅ QR generándose

🎊 ¡DEPLOY COMPLETADO! 🎊
```

---

## 📞 Próximos Pasos

1. **Probar con usuarios reales**
2. **Recopilar feedback**
3. **Implementar Fase 6** (Conexiones entre asistentes)
4. **Agregar analytics**
5. **Configurar dominio personalizado**

---

**¿Necesitas ayuda?**
- Revisa `DEPLOY-GUIDE.md` para instrucciones detalladas
- Revisa `DEPLOY-SUMMARY.md` para un overview completo
- Ejecuta `./verify-before-deploy.sh` para verificar el código
