# 🤝 Congress Networking App

Una aplicación moderna de networking para congresos y eventos, construida con React, Cloudflare Workers y D1.

## 🎯 ¿Qué es esto?

Una plataforma que permite a organizadores crear eventos y a asistentes conectar entre sí mediante códigos QR. Perfecta para congresos, conferencias, meetups y eventos de networking.

## ✨ Características

### Para Organizadores
- ✅ Crear y gestionar eventos
- ✅ Generar códigos QR para eventos
- ✅ Ver lista de asistentes en tiempo real
- ✅ Activar/desactivar eventos
- ✅ Dashboard con estadísticas

### Para Asistentes
- ✅ Registrarse a eventos vía QR o URL
- ✅ Crear perfil con áreas de interés
- ✅ Ver otros asistentes
- ✅ Filtrar por intereses comunes
- 🔜 Escanear QR de otros asistentes (Fase 6)
- 🔜 Guardar contactos automáticamente (Fase 6)

## 🚀 Estado del Proyecto

### ✅ Completado (Listo para Deploy)
- **Fase 1**: Frontend base con React + Vite + Tailwind
- **Fase 2**: Backend con Cloudflare Workers + D1
- **Fase 3**: Autenticación con Magic Links
- **Fase 4**: Gestión de usuarios y perfiles
- **Fase 5**: Gestión completa de eventos

### 🔜 Próximamente
- **Fase 6**: Sistema de conexiones entre asistentes
- **Fase 7**: Dashboard de métricas y analytics
- **Fase 8**: PWA y funcionalidad offline
- **Fase 9**: Seguridad avanzada y optimizaciones
- **Fase 10**: Integración con LinkedIn

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **React Router v6** - Routing
- **Tailwind CSS** - Styling
- **QRCode** - Generación de QR
- **Cloudflare Pages** - Hosting

### Backend
- **Cloudflare Workers** - Serverless runtime
- **Hono** - Web framework
- **Cloudflare D1** - SQLite database
- **JWT** - Autenticación
- **TypeScript** - Type safety

## 📦 Estructura del Proyecto

```
.
├── congress-networking-app/      # Frontend (React)
│   ├── src/
│   │   ├── components/          # Componentes reutilizables
│   │   ├── pages/               # Páginas de la app
│   │   ├── services/            # API client
│   │   ├── contexts/            # React contexts
│   │   └── utils/               # Utilidades
│   └── package.json
│
├── congress-networking-worker/   # Backend (Worker)
│   ├── src/
│   │   ├── routes/              # Endpoints de la API
│   │   ├── utils/               # Utilidades (JWT, crypto)
│   │   └── index.ts             # Entry point
│   ├── migrations/              # SQL migrations
│   └── package.json
│
└── Documentación de Deploy
    ├── DEPLOY-GUIDE.md          # Guía completa paso a paso
    ├── PRE-DEPLOY-CHECKLIST.md  # Checklist de verificación
    ├── DEPLOY-SUMMARY.md        # Resumen del deploy
    ├── QUICK-COMMANDS.md        # Comandos rápidos
    ├── READY-TO-DEPLOY.md       # Estado actual
    └── verify-before-deploy.sh  # Script de verificación
```

## 🚀 Deploy Rápido

### 1. Verificar que todo funciona
```bash
./verify-before-deploy.sh
```

### 2. Seguir la guía de deploy
```bash
open DEPLOY-GUIDE.md
```

### 3. Tiempo estimado
- Backend: 20 minutos
- Frontend: 15 minutos
- Testing: 10 minutos
- **Total: ~45 minutos**

### 4. Costo
**$0/mes** - Todo en el Free Tier de Cloudflare 🎉

## 📚 Documentación

- **[DEPLOY-GUIDE.md](DEPLOY-GUIDE.md)** - Guía completa de despliegue
- **[READY-TO-DEPLOY.md](READY-TO-DEPLOY.md)** - Estado actual y funcionalidades
- **[QUICK-COMMANDS.md](QUICK-COMMANDS.md)** - Comandos útiles
- **[PRE-DEPLOY-CHECKLIST.md](PRE-DEPLOY-CHECKLIST.md)** - Checklist pre-deploy

## 🧪 Desarrollo Local

### Backend
```bash
cd congress-networking-worker
npm install
npm run build
```

### Frontend
```bash
cd congress-networking-app
npm install
npm run dev
```

## 🎯 Casos de Uso

### 1. Congreso de Tecnología
- 500+ asistentes
- 3 días de duración
- Networking entre devs, diseñadores, PMs
- QR en badges físicos

### 2. Conferencia de Marketing
- 200+ asistentes
- 1 día de duración
- Networking entre marketers y agencias
- QR en pantallas del evento

### 3. Meetup Local
- 50+ asistentes
- Evento mensual
- Networking entre emprendedores
- QR compartido por WhatsApp

## 📊 Métricas

```
Backend:
  - 15+ endpoints REST
  - 6 tablas en D1
  - ~2,000 líneas de código
  - 82.6 KB compilado

Frontend:
  - 8 páginas completas
  - 15+ componentes
  - ~3,500 líneas de código
  - 285 KB compilado

Total:
  - 50+ archivos
  - ~5,500 líneas de código
  - 100% TypeScript
  - 100% responsive
```

## 🔒 Seguridad

- ✅ Autenticación sin contraseñas (Magic Links)
- ✅ JWT con expiración (24 horas)
- ✅ CORS configurado
- ✅ Validación de inputs
- ✅ SQL preparado (previene injection)
- ✅ Tokens de un solo uso

## 📱 Responsive

Funciona perfectamente en:
- ✅ Desktop (1024px+)
- ✅ Tablet (768px)
- ✅ Mobile (375px+)
- ✅ iPhone/Android

## 🤝 Contribuir

Este proyecto está en desarrollo activo. Las contribuciones son bienvenidas!

### Roadmap
1. ✅ Fases 1-5 completadas
2. 🔄 Fase 6 en progreso (Conexiones)
3. 📋 Fases 7-10 planificadas

## 📄 Licencia

MIT License - Siéntete libre de usar este código para tus propios proyectos.

## 🎉 Empezar

¿Listo para desplegar tu propia app de networking?

```bash
# 1. Verifica que todo funciona
./verify-before-deploy.sh

# 2. Abre la guía
open DEPLOY-GUIDE.md

# 3. ¡A desplegar! 🚀
```

## 📞 Soporte

Si encuentras problemas:
1. Revisa la documentación en `/docs`
2. Verifica los logs en Cloudflare Dashboard
3. Ejecuta `./verify-before-deploy.sh`

## 🌟 Features Destacados

- 🚀 **Serverless** - Escala automáticamente
- 💰 **Gratis** - Free tier de Cloudflare
- ⚡ **Rápido** - Edge computing global
- 🔒 **Seguro** - Sin contraseñas, solo magic links
- 📱 **Responsive** - Funciona en todos los dispositivos
- 🎨 **Moderno** - UI limpia con Tailwind CSS
- 🔧 **Fácil de mantener** - TypeScript en todo el stack

---

**Construido con ❤️ para la comunidad de eventos y networking**

¿Preguntas? Abre un issue o revisa la documentación.

**¡Feliz networking! 🤝**
