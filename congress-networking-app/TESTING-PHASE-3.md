# Testing - Fase 3: Autenticación Frontend

## 🧪 Cómo Probar la Autenticación

### Prerequisitos

1. **Backend desplegado**: Necesitas tener el Worker desplegado en Cloudflare
2. **Variable de entorno**: Actualiza `VITE_API_URL` en `.env` con la URL de tu Worker

### Paso 1: Iniciar el Frontend

```bash
cd congress-networking-app
npm run dev
```

La app estará en `http://localhost:5173`

### Paso 2: Probar el Flujo de Autenticación

#### 2.1 Acceder a la Landing Page
1. Abre `http://localhost:5173`
2. Deberías ver la landing page con:
   - Título "Networking Inteligente"
   - Botones "Soy Asistente" y "Soy Organizador"
   - Input para código de evento

#### 2.2 Iniciar Sesión
1. Haz clic en "Soy Asistente" o "Soy Organizador"
2. Deberías ser redirigido a `/auth`
3. Ingresa tu email (ej: `test@example.com`)
4. Haz clic en "Enviar Link Mágico"

#### 2.3 Verificar Magic Link (Modo Desarrollo)
1. Después de enviar el email, verás un mensaje "¡Revisa tu email!"
2. **En modo desarrollo**, verás un cuadro amarillo con el token
3. El token se muestra en un input de solo lectura
4. Haz clic en "Verificar Token"

#### 2.4 Verificación Exitosa
1. Deberías ver "¡Acceso exitoso!"
2. Serás redirigido automáticamente:
   - Si eres nuevo usuario → `/profile/setup` (placeholder)
   - Si ya tienes cuenta → `/dashboard` (placeholder)

### Paso 3: Verificar Estado de Autenticación

#### 3.1 Navbar Actualizado
1. Después de autenticarte, el navbar debería mostrar:
   - "Dashboard" o "Mi Perfil" (según el rol)
   - Botón "Salir"
2. Ya no debería mostrar "Iniciar Sesión"

#### 3.2 Persistencia de Sesión
1. Recarga la página (`F5`)
2. Deberías seguir autenticado
3. El navbar debería seguir mostrando tu estado de autenticado

#### 3.3 Logout
1. Haz clic en "Salir" en el navbar
2. Deberías ser redirigido a la landing page
3. El navbar debería mostrar "Iniciar Sesión" nuevamente

### Paso 4: Probar Rutas Protegidas

#### 4.1 Acceso Sin Autenticación
1. Cierra sesión si estás autenticado
2. Intenta acceder directamente a `/dashboard`
3. Deberías ser redirigido a `/auth`

#### 4.2 Acceso Con Autenticación
1. Inicia sesión
2. Accede a `/dashboard`
3. Deberías ver el placeholder "Dashboard"

## 🔍 Verificaciones de Consola

### LocalStorage
Abre DevTools > Application > Local Storage:

```javascript
// Deberías ver:
jwt_token: "eyJ..." // Tu JWT
user_data: "{...}" // Datos del usuario
```

### Network Requests
Abre DevTools > Network:

1. **Request Magic Link**:
   - POST a `/api/auth/request-magic-link`
   - Body: `{ "email": "test@example.com" }`
   - Response: `{ "success": true, "token": "..." }`

2. **Verify Magic Link**:
   - POST a `/api/auth/verify-magic-link`
   - Body: `{ "token": "..." }`
   - Response: `{ "success": true, "jwt": "...", "user": {...} }`

3. **Get Current User**:
   - GET a `/api/auth/me`
   - Headers: `Authorization: Bearer eyJ...`
   - Response: `{ "success": true, "user": {...} }`

## ✅ Checklist de Funcionalidades

- [ ] Landing page se carga correctamente
- [ ] Botones redirigen a `/auth`
- [ ] Formulario de email funciona
- [ ] Magic link se envía (token visible en desarrollo)
- [ ] Token se puede verificar
- [ ] JWT se guarda en localStorage
- [ ] Usuario se guarda en localStorage
- [ ] Navbar se actualiza después de login
- [ ] Sesión persiste después de recargar
- [ ] Logout funciona correctamente
- [ ] Rutas protegidas redirigen a `/auth` sin autenticación
- [ ] Rutas protegidas son accesibles con autenticación

## 🐛 Troubleshooting

### Error: "Failed to connect to server"
- Verifica que el Worker esté desplegado
- Verifica que `VITE_API_URL` en `.env` sea correcto
- Verifica que el Worker tenga CORS configurado

### Error: "Invalid or expired token"
- El token expira en 15 minutos
- Solicita un nuevo magic link

### Error: "JWT_SECRET is not defined"
- Verifica que el Worker tenga la variable de entorno `JWT_SECRET`
- Redeploy el Worker si es necesario

### Sesión no persiste
- Verifica que localStorage no esté bloqueado
- Verifica que el JWT no haya expirado (30 días)

### Navbar no se actualiza
- Verifica que `AuthProvider` esté envolviendo la app
- Verifica que `useAuth()` se esté usando correctamente

## 📝 Notas de Desarrollo

### Modo Desarrollo vs Producción

**Desarrollo (actual):**
- Token visible en la UI
- No se envían emails reales
- Verificación manual del token

**Producción (Fase 10):**
- Token NO visible en la UI
- Emails reales con Cloudflare Email Workers
- Usuario hace clic en link del email

### Próximos Pasos

Una vez que la autenticación funcione:
1. ✅ Fase 3 completada
2. ⏭️ Fase 4: Implementar formulario de perfil
3. ⏭️ Fase 5: Implementar gestión de eventos
4. ⏭️ Fase 6: Implementar conexiones y QR

## 🎯 Flujo Completo Esperado

```
1. Usuario → Landing Page
2. Click "Soy Asistente"
3. → /auth
4. Ingresa email
5. → "¡Revisa tu email!"
6. [DEV] Ve token en pantalla
7. Click "Verificar Token"
8. → "¡Acceso exitoso!"
9. → /profile/setup (nuevo) o /dashboard (existente)
10. Navbar muestra estado autenticado
11. Usuario puede navegar por la app
12. Click "Salir"
13. → Landing Page
```

## 🚀 Deploy

Para desplegar con la autenticación funcionando:

1. Deploy el Worker (Fase 2)
2. Actualiza `VITE_API_URL` en Cloudflare Pages:
   ```
   VITE_API_URL=https://tu-worker.workers.dev
   ```
3. Redeploy el frontend
4. Prueba el flujo completo en producción

---

**¿Todo funciona?** ¡Excelente! Estás listo para continuar con la Fase 4. 🎉
