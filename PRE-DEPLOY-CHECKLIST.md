# ✅ Pre-Deploy Checklist

Verifica estos puntos antes de desplegar:

## 🔧 Backend (Worker)

- [ ] `npm install` ejecutado en `congress-networking-worker/`
- [ ] `npm run build` ejecutado exitosamente
- [ ] Archivo `dist/index.js` generado
- [ ] Migraciones SQL revisadas en `migrations/001_initial_schema.sql`
- [ ] Variables de entorno preparadas:
  - [ ] `JWT_SECRET` (string aleatorio largo)
  - [ ] `FRONTEND_URL` (se actualizará después)

## 🎨 Frontend (Pages)

- [ ] `npm install` ejecutado en `congress-networking-app/`
- [ ] `npm run build` funciona localmente
- [ ] Código subido a Git (GitHub/GitLab/Bitbucket)
- [ ] Variable de entorno preparada:
  - [ ] `VITE_API_URL` (URL del Worker)

## 📦 Archivos Críticos

### Backend
- [ ] `congress-networking-worker/src/index.ts` - Entry point
- [ ] `congress-networking-worker/src/routes/auth.ts` - Autenticación
- [ ] `congress-networking-worker/src/routes/users.ts` - Usuarios
- [ ] `congress-networking-worker/src/routes/events.ts` - Eventos
- [ ] `congress-networking-worker/src/routes/connections.ts` - Conexiones
- [ ] `congress-networking-worker/migrations/001_initial_schema.sql` - Schema DB

### Frontend
- [ ] `congress-networking-app/src/App.tsx` - Rutas
- [ ] `congress-networking-app/src/pages/AuthPage.tsx` - Login
- [ ] `congress-networking-app/src/pages/ProfileSetupPage.tsx` - Perfil
- [ ] `congress-networking-app/src/pages/DashboardPage.tsx` - Dashboard
- [ ] `congress-networking-app/src/pages/CreateEventPage.tsx` - Crear evento
- [ ] `congress-networking-app/src/pages/EventDetailPage.tsx` - Detalle evento
- [ ] `congress-networking-app/src/services/api.ts` - API client

## 🧪 Tests Locales (Opcional pero Recomendado)

### Backend
```bash
cd congress-networking-worker
npm run build
# Verificar que dist/index.js existe y no tiene errores
```

### Frontend
```bash
cd congress-networking-app
npm run build
npm run preview
# Abrir http://localhost:4173 y verificar que funciona
```

## 📝 Información a Tener Lista

Antes de empezar el deploy, ten a mano:

1. **Cuenta de Cloudflare**
   - Email: _______________
   - Acceso al dashboard

2. **Repositorio Git**
   - URL: _______________
   - Acceso configurado

3. **Nombres para los recursos**
   - Worker: `congress-networking-api`
   - D1 Database: `congress-networking-db`
   - Pages Project: `congress-networking-app`

4. **Secretos**
   - JWT_SECRET: _______________
   (Genera uno con: `openssl rand -base64 32`)

## 🚀 Orden de Deploy

Sigue este orden para evitar problemas:

1. ✅ Backend Worker
2. ✅ Base de Datos D1
3. ✅ Migraciones SQL
4. ✅ Bindings y Variables
5. ✅ Frontend Pages
6. ✅ Actualizar CORS en Worker

## ⏱️ Tiempo Estimado

- Backend: 15-20 minutos
- Frontend: 10-15 minutos
- Testing: 10 minutos
- **Total: ~40 minutos**

## 🎯 Después del Deploy

- [ ] Probar health check del backend
- [ ] Probar registro de usuario
- [ ] Probar creación de evento
- [ ] Probar registro a evento
- [ ] Verificar QR generation
- [ ] Probar en móvil

## 📞 URLs Importantes

Anota aquí tus URLs después del deploy:

- **Frontend**: https://_______________
- **Backend**: https://_______________
- **Dashboard**: https://dash.cloudflare.com/

---

¿Todo listo? → Sigue la guía en `DEPLOY-GUIDE.md`
