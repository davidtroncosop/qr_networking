# Design Document

## Overview

La aplicación de networking para congresos se construirá como una Progressive Web App (PWA) full-stack utilizando la plataforma Cloudflare. La arquitectura se divide en tres capas principales:

1. **Frontend (Cloudflare Pages)**: Una PWA construida con React que proporciona interfaces para asistentes y organizadores
2. **Backend (Cloudflare Workers)**: API serverless que maneja la lógica de negocio y autenticación
3. **Database (Cloudflare D1)**: Base de datos SQLite gestionada para persistencia de datos

La aplicación soporta dos tipos de usuarios con flujos distintos:

**Flujo de Asistentes:**
1. Escanean QR del evento o acceden a URL con eventId
2. Se autentican con email (magic link)
3. Completan/actualizan su perfil
4. Se registran automáticamente al evento
5. Generan su QR personal
6. Escanean QRs de otros asistentes
7. Visualizan sus conexiones

**Flujo de Organizadores:**
1. Acceden a la plataforma directamente (sin eventId)
2. Se autentican con email (magic link)
3. Marcan su cuenta como organizador en primer login
4. Crean eventos desde el dashboard
5. Generan QR del evento para compartir
6. Monitorean métricas en tiempo real
7. Exportan reportes

**Diferenciación de Roles:**
- El rol se determina por el contexto de acceso y las acciones del usuario
- Un usuario puede ser organizador de algunos eventos y asistente de otros
- La UI se adapta dinámicamente según el rol en cada evento

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare Pages (PWA)                    │
│  ┌──────────────────┐         ┌──────────────────────────┐  │
│  │  Attendee UI     │         │  Organizer Dashboard     │  │
│  │  - Profile       │         │  - Event Management      │  │
│  │  - QR Scanner    │         │  - Metrics & Analytics   │  │
│  │  - Connections   │         │  - Reports               │  │
│  └──────────────────┘         └──────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS/REST API
┌────────────────────▼────────────────────────────────────────┐
│              Cloudflare Workers (API)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Auth Service │  │ Event Service│  │ Connection Svc   │  │
│  │ - Magic Link │  │ - CRUD       │  │ - QR Validation  │  │
│  │ - JWT        │  │ - QR Gen     │  │ - Create Links   │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ User Service │  │Metrics Service│  │ Email Service    │  │
│  │ - Profile    │  │ - Analytics  │  │ - Magic Links    │  │
│  │ - Social     │  │ - Reports    │  │ - Notifications  │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │ SQL Queries
┌────────────────────▼────────────────────────────────────────┐
│                  Cloudflare D1 (SQLite)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  ┌────────┐  │
│  │  users   │  │  events  │  │ connections  │  │ tokens │  │
│  └──────────┘  └──────────┘  └──────────────┘  └────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- React 18+ con TypeScript
- Vite como build tool
- TailwindCSS para estilos
- React Router para navegación
- QR Code libraries: `qrcode` (generación), `html5-qrcode` (escaneo)
- PWA con service worker para offline capabilities

**Backend:**
- Cloudflare Workers con Hono framework (ligero y rápido)
- TypeScript para type safety
- JWT para autenticación
- Cloudflare Email Workers para magic links

**Database:**
- Cloudflare D1 (SQLite)
- Drizzle ORM para type-safe queries

**Deployment:**
- Cloudflare Pages para frontend (CI/CD automático desde Git)
- Wrangler CLI para deploy de Workers

## Authentication and Role Management

### Authentication Flow

**Escenario 1: Asistente escanea QR del evento**
```
1. Usuario escanea QR → URL: https://app.domain/e/{eventId}
2. App detecta eventId en la URL y muestra info del evento
3. Muestra pantalla de login con dos opciones:
   a) Continuar con LinkedIn (recomendado)
   b) Continuar con Email
   
Opción A - LinkedIn:
4a. Usuario hace clic en "Continuar con LinkedIn"
5a. Redirige a OAuth de LinkedIn
6a. LinkedIn devuelve: email, nombre, cargo, empresa, foto, URL de perfil
7a. Sistema crea/actualiza usuario con datos de LinkedIn
8a. Si es nuevo: Muestra formulario simplificado (solo teléfono y áreas de interés)
9a. Si es existente: Registra directamente al evento
10a. Sistema asigna rol 'attendee' para este evento
11a. Redirige a vista de asistente con QR personal

Opción B - Email:
4b. Usuario ingresa email → Sistema envía magic link con eventId incluido
5b. Usuario hace clic en magic link → Sistema valida token
6b. Si es nuevo: Muestra formulario completo (nombre, cargo, empresa, teléfono, áreas)
7b. Si es existente: Carga perfil y registra al evento
8b. Sistema asigna rol 'attendee' para este evento
9b. Redirige a vista de asistente con QR personal
```

**Escenario 2: Asistente ingresa ID manualmente**
```
1. Usuario accede a https://app.domain
2. Selecciona "Soy asistente"
3. Ingresa código del evento (proporcionado por organizador)
4. Continúa con flujo de autenticación (pasos 3-9 del Escenario 1)
```

**Escenario 3: Organizador crea evento**
```
1. Usuario accede a https://app.domain
2. Selecciona "Soy organizador" (solo en primer login)
3. Elige método de autenticación:
   a) LinkedIn (importa datos profesionales)
   b) Email (magic link)
4. Completa autenticación según método elegido
5. Si es nuevo usuario: Muestra formulario de perfil + marca defaultRole='organizer'
6. Redirige a dashboard de organizador
7. Usuario crea evento → Sistema asigna rol 'organizer' para ese evento
```

**Escenario 4: Usuario existente accede a nuevo evento**
```
1. Usuario ya autenticado escanea QR de nuevo evento
2. Sistema detecta JWT válido + nuevo eventId
3. Registra automáticamente al usuario como 'attendee' del nuevo evento
4. Muestra vista de asistente para ese evento
```

### Role Determination Logic

```typescript
// Lógica para determinar el rol del usuario en un evento
function getUserRoleInEvent(userId: string, eventId: string): UserRole {
  // 1. Verificar si es el organizador del evento
  const event = getEvent(eventId);
  if (event.organizerId === userId) {
    return 'organizer';
  }
  
  // 2. Verificar registro explícito en event_registrations
  const registration = getEventRegistration(eventId, userId);
  if (registration) {
    return registration.role; // 'attendee' u 'organizer'
  }
  
  // 3. Si no hay registro, no tiene rol en este evento
  return 'none';
}

// Lógica para determinar qué UI mostrar
function determineUIView(user: User, eventId?: string): UIView {
  if (!eventId) {
    // Sin eventId: Mostrar dashboard según defaultRole
    return user.defaultRole === 'organizer' 
      ? 'organizer-dashboard' 
      : 'event-id-input';
  }
  
  const role = getUserRoleInEvent(user.id, eventId);
  
  if (role === 'organizer') {
    return 'organizer-event-view';
  } else if (role === 'attendee') {
    return 'attendee-event-view';
  } else {
    // Usuario no registrado en este evento
    return 'event-registration';
  }
}
```

### URL Structure

```
# Landing page
https://app.domain/

# Evento específico (desde QR)
https://app.domain/e/{eventId}

# Conexión directa (QR personal)
https://app.domain/c/{eventId}/{userId}

# Dashboard de organizador
https://app.domain/dashboard

# Vista de evento para organizador
https://app.domain/dashboard/events/{eventId}

# Vista de asistente
https://app.domain/events/{eventId}

# Perfil personal
https://app.domain/profile

# Mis conexiones
https://app.domain/events/{eventId}/connections
```

## UI/UX Design

### Design System

**Color Palette**
```css
/* Primary colors */
--primary-600: #2563eb; /* Blue - Main brand color */
--primary-700: #1d4ed8; /* Blue dark - Hover states */
--primary-50: #eff6ff;  /* Blue light - Backgrounds */

/* Secondary colors */
--secondary-600: #7c3aed; /* Purple - Accents */
--secondary-700: #6d28d9; /* Purple dark */

/* Neutral colors */
--gray-900: #111827; /* Text primary */
--gray-600: #4b5563; /* Text secondary */
--gray-300: #d1d5db; /* Borders */
--gray-100: #f3f4f6; /* Backgrounds */
--white: #ffffff;

/* Semantic colors */
--success: #10b981; /* Green - Success states */
--error: #ef4444;   /* Red - Errors */
--warning: #f59e0b; /* Orange - Warnings */
```

**Typography**
```css
/* Font family */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Font sizes */
--text-xs: 0.75rem;   /* 12px */
--text-sm: 0.875rem;  /* 14px */
--text-base: 1rem;    /* 16px */
--text-lg: 1.125rem;  /* 18px */
--text-xl: 1.25rem;   /* 20px */
--text-2xl: 1.5rem;   /* 24px */
--text-3xl: 1.875rem; /* 30px */
--text-4xl: 2.25rem;  /* 36px */

/* Font weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

**Spacing**
```css
/* Spacing scale (Tailwind-based) */
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
```

**Border Radius**
```css
--radius-sm: 0.25rem;  /* 4px - Small elements */
--radius-md: 0.5rem;   /* 8px - Cards, buttons */
--radius-lg: 0.75rem;  /* 12px - Modals */
--radius-xl: 1rem;     /* 16px - Large cards */
--radius-full: 9999px; /* Circular - Avatars, pills */
```

**Shadows**
```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
```

### Component Designs

#### Landing Page (/)

**Layout:**
```
┌─────────────────────────────────────────┐
│  Logo                    [Login Button] │
├─────────────────────────────────────────┤
│                                         │
│         🎯 Networking Inteligente       │
│         para Eventos y Congresos        │
│                                         │
│    [Soy Asistente]  [Soy Organizador]  │
│                                         │
│         ┌─────────────────┐             │
│         │ Ingresa código  │             │
│         │ del evento      │             │
│         │ [___________]   │             │
│         │    [Entrar]     │             │
│         └─────────────────┘             │
│                                         │
│  ✨ Sin instalación • 📱 Escanea QR    │
│  🤝 Conecta al instante                 │
└─────────────────────────────────────────┘
```

**Características:**
- Hero section con título grande y llamativo
- Dos botones principales con iconos (asistente/organizador)
- Input de código de evento como opción alternativa
- Footer con beneficios clave
- Diseño responsive: stack vertical en móvil

#### Login/Auth Screen

**Layout:**
```
┌─────────────────────────────────────────┐
│              [← Volver]                 │
│                                         │
│         🎉 Evento: Tech Summit 2025     │
│         📍 Centro de Convenciones       │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  [🔵 Continuar con LinkedIn]     │  │
│  └───────────────────────────────────┘  │
│                                         │
│         ─────── o ───────               │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  📧 tu@email.com                  │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  [Enviar link mágico]             │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ✨ Recomendamos LinkedIn para          │
│     completar tu perfil automáticamente │
└─────────────────────────────────────────┘
```

**Características:**
- Muestra información del evento si viene desde QR
- Botón de LinkedIn prominente con branding oficial
- Separador visual entre opciones
- Email como alternativa
- Mensaje explicativo sobre beneficios de LinkedIn

#### Profile Setup (Simplified - from LinkedIn)

**Layout:**
```
┌─────────────────────────────────────────┐
│  Completa tu perfil                     │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  👤 Juan Pérez                  │    │
│  │  💼 Product Manager @ TechCorp  │    │
│  │  ✓ Importado desde LinkedIn    │    │
│  └─────────────────────────────────┘    │
│                                         │
│  📱 Teléfono (opcional)                 │
│  ┌─────────────────────────────────┐    │
│  │  +56 9 1234 5678                │    │
│  └─────────────────────────────────┘    │
│                                         │
│  🏷️ Áreas de interés                    │
│  ┌─────────────────────────────────┐    │
│  │ [Tecnología] [Marketing]        │    │
│  │ [Producto] [Diseño]             │    │
│  │ [Finanzas] [Ventas] ...         │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  [Continuar]                      │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**Características:**
- Muestra datos importados de LinkedIn en card destacado
- Solo pide teléfono y áreas de interés
- Chips seleccionables para áreas de interés
- Botón grande de continuar
- Validación inline

#### Attendee Home (Event View)

**Layout:**
```
┌─────────────────────────────────────────┐
│  Tech Summit 2025        [☰ Menu]       │
├─────────────────────────────────────────┤
│                                         │
│  Tu código QR                           │
│  ┌─────────────────────────────────┐    │
│  │         ▓▓▓▓▓▓▓▓▓▓▓▓▓           │    │
│  │         ▓▓▓▓▓▓▓▓▓▓▓▓▓           │    │
│  │         ▓▓▓▓▓▓▓▓▓▓▓▓▓           │    │
│  │                                 │    │
│  │      Juan Pérez                 │    │
│  │      Product Manager            │    │
│  └─────────────────────────────────┘    │
│  [📥 Descargar]  [📤 Compartir]         │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  [📷 Escanear QR de asistente]   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Tus conexiones (12)                    │
│  ┌─────────────────────────────────┐    │
│  │ 👤 María García                 │    │
│  │    CEO @ StartupXYZ             │    │
│  │    Hace 5 min                   │    │
│  ├─────────────────────────────────┤    │
│  │ 👤 Carlos López                 │    │
│  │    Developer @ TechCo           │    │
│  │    Hace 15 min                  │    │
│  └─────────────────────────────────┘    │
│  [Ver todas las conexiones →]           │
└─────────────────────────────────────────┘
```

**Características:**
- QR personal prominente en la parte superior
- Botones de acción (descargar, compartir)
- Botón grande para escanear otros QRs
- Lista de conexiones recientes
- Timestamps relativos (hace X minutos)
- Link para ver todas las conexiones

#### QR Scanner

**Layout:**
```
┌─────────────────────────────────────────┐
│  [← Volver]      Escanear QR            │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │     [Camera Feed]               │    │
│  │                                 │    │
│  │     ┌─────────────┐             │    │
│  │     │             │             │    │
│  │     │   Target    │             │    │
│  │     │             │             │    │
│  │     └─────────────┘             │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Apunta la cámara al código QR          │
│  del asistente                          │
│                                         │
│  💡 Tip: Asegúrate de tener buena       │
│     iluminación                         │
└─────────────────────────────────────────┘
```

**Características:**
- Cámara en fullscreen con overlay
- Guía visual (cuadro de enfoque)
- Instrucciones claras
- Feedback visual al detectar QR
- Manejo de errores (permisos denegados)

#### Connection Success Modal

**Layout:**
```
┌─────────────────────────────────────────┐
│                                    [✕]  │
│                                         │
│         ✅ ¡Conexión exitosa!           │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │         [Photo]                 │    │
│  │                                 │    │
│  │      María García               │    │
│  │      CEO @ StartupXYZ           │    │
│  │                                 │    │
│  │  🏷️ Emprendimiento, Tecnología  │    │
│  │                                 │    │
│  │  [in] [🐦] [📧] [🌐]            │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  [Ver perfil completo]            │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  [Escanear otro QR]               │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**Características:**
- Animación de éxito (checkmark)
- Card con información del contacto
- Foto de perfil grande
- Áreas de interés visibles
- Iconos clickeables para redes sociales
- Opciones para continuar

#### Connections List

**Layout:**
```
┌─────────────────────────────────────────┐
│  [← Volver]      Mis Conexiones         │
├─────────────────────────────────────────┤
│  🔍 [Buscar por nombre, empresa...]     │
│                                         │
│  📊 12 conexiones • Tech Summit 2025    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ [Photo] María García            │    │
│  │         CEO @ StartupXYZ        │    │
│  │         🏷️ Emprendimiento       │    │
│  │         Hace 5 min              │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ [Photo] Carlos López            │    │
│  │         Developer @ TechCo      │    │
│  │         🏷️ Tecnología           │    │
│  │         Hace 15 min             │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ [Photo] Ana Martínez            │    │
│  │         Designer @ CreativeHub  │    │
│  │         🏷️ Diseño, UX           │    │
│  │         Hace 1 hora             │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [Cargar más...]                        │
└─────────────────────────────────────────┘
```

**Características:**
- Barra de búsqueda sticky en la parte superior
- Contador de conexiones y evento
- Cards de conexión con foto, nombre, cargo, empresa
- Áreas de interés visibles
- Timestamps relativos
- Infinite scroll o paginación
- Tap en card para ver perfil completo

#### Organizer Dashboard

**Layout:**
```
┌─────────────────────────────────────────┐
│  Dashboard              [☰ Menu]        │
├─────────────────────────────────────────┤
│  Tech Summit 2025                       │
│  📅 15-17 Mar 2025 • 🟢 Activo          │
│                                         │
│  ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │   156    │ │   342    │ │   2.2   │ │
│  │Asistentes│ │Conexiones│ │Promedio │ │
│  └──────────┘ └──────────┘ └─────────┘ │
│                                         │
│  📊 Conexiones por hora                 │
│  ┌─────────────────────────────────┐    │
│  │     ▂▄▆█▆▄▂                     │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  🏆 Top Networkers                      │
│  ┌─────────────────────────────────┐    │
│  │ 1. María García        23 ⭐    │    │
│  │ 2. Carlos López        19 ⭐    │    │
│  │ 3. Ana Martínez        17 ⭐    │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [📥 Descargar reporte]                 │
│  [👥 Ver asistentes]                    │
│  [⚙️ Configurar evento]                 │
└─────────────────────────────────────────┘
```

**Características:**
- Header con nombre del evento y estado
- Métricas clave en cards destacados
- Gráfico de conexiones por hora
- Ranking de top networkers
- Botones de acción principales
- Auto-refresh cada 30 segundos

#### Event Creation

**Layout:**
```
┌─────────────────────────────────────────┐
│  [← Volver]      Crear Evento           │
├─────────────────────────────────────────┤
│                                         │
│  Información básica                     │
│                                         │
│  Nombre del evento *                    │
│  ┌─────────────────────────────────┐    │
│  │  Tech Summit 2025               │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Descripción                            │
│  ┌─────────────────────────────────┐    │
│  │  Congreso de tecnología...      │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  📅 Fecha de inicio *                   │
│  ┌─────────────────────────────────┐    │
│  │  15/03/2025  10:00             │    │
│  └─────────────────────────────────┘    │
│                                         │
│  📅 Fecha de fin *                      │
│  ┌─────────────────────────────────┐    │
│  │  17/03/2025  18:00             │    │
│  └─────────────────────────────────┘    │
│                                         │
│  📍 Ubicación                           │
│  ┌─────────────────────────────────┐    │
│  │  Centro de Convenciones         │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  [Crear evento]                   │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**Características:**
- Formulario limpio y espaciado
- Campos requeridos marcados con *
- Date pickers para fechas
- Validación inline
- Botón de submit destacado
- Muestra QR generado después de crear

### Mobile-First Considerations

**Responsive Breakpoints:**
```css
/* Mobile first approach */
@media (min-width: 640px)  { /* sm - tablets */ }
@media (min-width: 768px)  { /* md - tablets landscape */ }
@media (min-width: 1024px) { /* lg - desktop */ }
@media (min-width: 1280px) { /* xl - large desktop */ }
```

**Touch Targets:**
- Mínimo 44x44px para botones y elementos interactivos
- Espaciado generoso entre elementos clickeables
- Gestos: swipe para navegar, pull-to-refresh

**Performance:**
- Lazy loading de imágenes
- Skeleton screens mientras carga
- Optimistic UI updates
- Transiciones suaves (max 300ms)

### Accessibility

**WCAG 2.1 AA Compliance:**
- Contraste mínimo 4.5:1 para texto normal
- Contraste mínimo 3:1 para texto grande
- Todos los elementos interactivos accesibles por teclado
- Labels apropiados para screen readers
- Estados de focus visibles
- Mensajes de error descriptivos

**Semantic HTML:**
```html
<header>, <nav>, <main>, <section>, <article>, <footer>
<button> para acciones, <a> para navegación
<label> asociado a cada <input>
```

## Components and Interfaces

### Frontend Components

#### 0. Authentication & Onboarding Components

**AuthGate Component**
```typescript
interface AuthGateProps {
  eventId?: string; // Presente si viene desde QR de evento
  onAuthComplete: (user: User, role: UserRole) => void;
}

// Determina el flujo según el contexto:
// - Con eventId: Flujo de asistente
// - Sin eventId: Flujo de organizador
```

**MagicLinkRequest Component**
```typescript
interface MagicLinkRequestProps {
  eventId?: string;
  onLinkSent: () => void;
  onLinkedInAuth: () => void;
}

// Ofrece dos opciones de autenticación:
// 1. Email + magic link
// 2. LinkedIn OAuth (importa datos automáticamente)
```

**LinkedInAuth Component**
```typescript
interface LinkedInAuthProps {
  eventId?: string;
  onAuthSuccess: (linkedInData: LinkedInProfile) => void;
}

interface LinkedInProfile {
  email: string;
  name: string;
  headline: string; // Se mapea a jobTitle
  company?: string;
  photoUrl?: string;
  linkedinUrl: string;
}

// Inicia flujo OAuth de LinkedIn
// Solicita permisos: r_liteprofile, r_emailaddress
```

**RoleSelection Component**
```typescript
interface RoleSelectionProps {
  user: User;
  eventId?: string;
  onRoleSelected: (role: UserRole) => void;
}

enum UserRole {
  ATTENDEE = 'attendee',
  ORGANIZER = 'organizer'
}

// Solo se muestra en primer login sin eventId
// Permite al usuario elegir si quiere crear eventos o asistir
```

**EventIdInput Component**
```typescript
interface EventIdInputProps {
  onEventIdSubmit: (eventId: string) => void;
}

// Permite a asistentes ingresar manualmente el ID del evento
// Si no tienen acceso al QR
```

#### 1. Attendee Components

**ProfileSetup Component**
```typescript
interface ProfileSetupProps {
  onComplete: (profile: UserProfile) => void;
  existingProfile?: UserProfile;
  linkedInData?: LinkedInProfile; // Pre-poblado si viene de LinkedIn
}

interface UserProfile {
  // Campos básicos (requeridos)
  name: string;
  email: string;
  
  // Campos opcionales que el usuario completa
  jobTitle?: string;
  company?: string;
  phone?: string;
  areasOfInterest?: string[]; // Tags seleccionables
  photoUrl?: string;
  
  // Enlaces sociales (opcionales)
  socialLinks: SocialLinks;
}

interface SocialLinks {
  linkedin?: string; // Auto-poblado si viene de LinkedIn
  twitter?: string;
  instagram?: string;
  website?: string;
}

// Formulario simplificado:
// - Si viene de LinkedIn: Solo pide teléfono y áreas de interés
// - Si viene de email: Pide nombre, cargo, empresa, teléfono, áreas de interés
```

**AreasOfInterestSelector Component**
```typescript
interface AreasOfInterestSelectorProps {
  selectedAreas: string[];
  onSelectionChange: (areas: string[]) => void;
}

// Categorías predefinidas:
const INTEREST_CATEGORIES = [
  'Tecnología', 'Marketing', 'Ventas', 'Finanzas',
  'Recursos Humanos', 'Operaciones', 'Producto',
  'Diseño', 'Investigación', 'Educación', 'Salud',
  'Legal', 'Emprendimiento', 'Inversión', 'Otro'
];
```

**QRDisplay Component**
```typescript
interface QRDisplayProps {
  userId: string;
  eventId: string;
  userName: string;
}
// Genera QR dinámicamente con formato: https://app.domain/c/{eventId}/{userId}
```

**QRScanner Component**
```typescript
interface QRScannerProps {
  eventId: string;
  onScanSuccess: (scannedUserId: string) => void;
  onScanError: (error: string) => void;
}
```

**ConnectionsList Component**
```typescript
interface ConnectionsListProps {
  eventId: string;
  userId: string;
  connections: Connection[];
  onConnectionClick: (connection: Connection) => void;
}

interface Connection {
  id: string;
  connectedUser: UserProfile;
  connectedAt: Date;
  eventId: string;
}
```

#### 2. Organizer Components

**EventCreation Component**
```typescript
interface EventCreationProps {
  onEventCreated: (event: Event) => void;
}

interface Event {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  organizerId: string;
  qrCode: string; // URL del evento
  isActive: boolean;
}
```

**MetricsDashboard Component**
```typescript
interface MetricsDashboardProps {
  eventId: string;
}

interface EventMetrics {
  totalAttendees: number;
  totalConnections: number;
  avgConnectionsPerAttendee: number;
  topNetworkers: TopNetworker[];
  connectionsByHour: HourlyData[];
  attendeesByCompany: CompanyData[];
}

interface TopNetworker {
  userId: string;
  name: string;
  company: string;
  connectionCount: number;
}
```

### Backend API Endpoints

#### Authentication Endpoints

```typescript
// Magic Link Authentication
POST /api/auth/request-magic-link
Body: { 
  email: string, 
  eventId?: string, // Si viene desde QR de evento
  intendedRole?: 'attendee' | 'organizer' // Rol deseado
}
Response: { success: boolean, message: string }

POST /api/auth/verify-magic-link
Body: { token: string }
Response: { 
  success: boolean, 
  jwt: string, 
  user: UserProfile,
  eventId?: string, // Si el token incluía eventId
  isNewUser: boolean // true si es primer login
}

// LinkedIn OAuth Authentication
GET /api/auth/linkedin/authorize
Query: { eventId?: string, intendedRole?: string }
Response: Redirect to LinkedIn OAuth

GET /api/auth/linkedin/callback
Query: { code: string, state: string }
Response: { 
  success: boolean,
  jwt: string,
  user: UserProfile,
  linkedInData: LinkedInProfile,
  isNewUser: boolean,
  eventId?: string
}

// User Info
GET /api/auth/me
Headers: { Authorization: "Bearer {jwt}" }
Response: { 
  user: UserProfile,
  roles: UserEventRole[] // Roles del usuario en diferentes eventos
}

POST /api/auth/set-role
Body: { role: 'attendee' | 'organizer' }
Headers: { Authorization: "Bearer {jwt}" }
Response: { success: boolean, user: UserProfile }

GET /api/auth/role/:eventId
Headers: { Authorization: "Bearer {jwt}" }
Response: { 
  role: 'organizer' | 'attendee' | 'none',
  isOrganizer: boolean,
  isAttendee: boolean
}
```

#### User Endpoints

```typescript
POST /api/users
Body: { 
  name, 
  email, 
  jobTitle?, 
  company?, 
  phone?,
  areasOfInterest?: string[],
  photoUrl?, 
  socialLinks 
}
Response: { user: UserProfile, qrCode: string }

GET /api/users/:userId
Response: { user: UserProfile }

PUT /api/users/:userId
Body: { 
  name?, 
  jobTitle?, 
  company?, 
  phone?,
  areasOfInterest?: string[],
  photoUrl?, 
  socialLinks? 
}
Response: { user: UserProfile }

GET /api/users/:userId/interests
Response: { interests: string[] }

PUT /api/users/:userId/interests
Body: { interests: string[] }
Response: { success: boolean, interests: string[] }
```

#### Event Endpoints

```typescript
POST /api/events
Body: { name, description, startDate, endDate, location }
Headers: { Authorization: "Bearer {jwt}" }
Response: { event: Event, qrCode: string }

GET /api/events/:eventId
Response: { event: Event }

PUT /api/events/:eventId
Body: { name?, description?, startDate?, endDate?, location?, isActive? }
Response: { event: Event }

GET /api/events/:eventId/attendees
Response: { attendees: UserProfile[], count: number }
```

#### Connection Endpoints

```typescript
POST /api/connections
Body: { eventId, scannedUserId }
Headers: { Authorization: "Bearer {jwt}" }
Response: { connection: Connection, connectedUser: UserProfile }

GET /api/connections/my-connections
Query: { eventId }
Headers: { Authorization: "Bearer {jwt}" }
Response: { connections: Connection[] }

GET /api/connections/:connectionId
Response: { connection: Connection }
```

#### Metrics Endpoints

```typescript
GET /api/metrics/:eventId
Headers: { Authorization: "Bearer {jwt}" } // Must be organizer
Response: { metrics: EventMetrics }

GET /api/metrics/:eventId/report
Headers: { Authorization: "Bearer {jwt}" }
Response: { report: PDF/JSON with full analytics }
```

## Data Models

### Database Schema

```sql
-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY, -- UUID
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
  default_role TEXT DEFAULT 'attendee', -- 'attendee' o 'organizer'
  auth_provider TEXT DEFAULT 'email', -- 'email' o 'linkedin'
  linkedin_id TEXT UNIQUE, -- ID de LinkedIn si se autentica con LinkedIn
  created_at INTEGER NOT NULL, -- Unix timestamp
  updated_at INTEGER NOT NULL
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_linkedin_id ON users(linkedin_id);

-- User areas of interest (many-to-many)
CREATE TABLE user_interests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  interest TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, interest)
);

CREATE INDEX idx_user_interests_user ON user_interests(user_id);
CREATE INDEX idx_user_interests_interest ON user_interests(interest);

-- Events table
CREATE TABLE events (
  id TEXT PRIMARY KEY, -- UUID
  name TEXT NOT NULL,
  description TEXT,
  start_date INTEGER NOT NULL, -- Unix timestamp
  end_date INTEGER NOT NULL,
  location TEXT,
  organizer_id TEXT NOT NULL,
  is_active INTEGER DEFAULT 1, -- SQLite boolean (0/1)
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (organizer_id) REFERENCES users(id)
);

CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_dates ON events(start_date, end_date);

-- Event registrations (many-to-many: users can attend multiple events)
CREATE TABLE event_registrations (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL, -- 'attendee' u 'organizer'
  registered_at INTEGER NOT NULL,
  FOREIGN KEY (event_id) REFERENCES events(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(event_id, user_id)
);

CREATE INDEX idx_registrations_event ON event_registrations(event_id);
CREATE INDEX idx_registrations_user ON event_registrations(user_id);
CREATE INDEX idx_registrations_role ON event_registrations(event_id, role);

-- Connections table (bidirectional relationships)
CREATE TABLE connections (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  user_id_1 TEXT NOT NULL, -- User who scanned
  user_id_2 TEXT NOT NULL, -- User who was scanned
  connected_at INTEGER NOT NULL,
  FOREIGN KEY (event_id) REFERENCES events(id),
  FOREIGN KEY (user_id_1) REFERENCES users(id),
  FOREIGN KEY (user_id_2) REFERENCES users(id),
  UNIQUE(event_id, user_id_1, user_id_2)
);

CREATE INDEX idx_connections_event ON connections(event_id);
CREATE INDEX idx_connections_user1 ON connections(user_id_1);
CREATE INDEX idx_connections_user2 ON connections(user_id_2);
CREATE INDEX idx_connections_time ON connections(connected_at);

-- Magic link tokens
CREATE TABLE auth_tokens (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  event_id TEXT, -- NULL si no viene desde evento específico
  intended_role TEXT, -- 'attendee', 'organizer', o NULL
  expires_at INTEGER NOT NULL,
  used INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (event_id) REFERENCES events(id)
);

CREATE INDEX idx_tokens_token ON auth_tokens(token);
CREATE INDEX idx_tokens_email ON auth_tokens(email);
CREATE INDEX idx_tokens_expires ON auth_tokens(expires_at);
```

### TypeScript Data Models

```typescript
// User model
interface User {
  id: string;
  email: string;
  name: string;
  jobTitle?: string;
  company?: string;
  phone?: string;
  photoUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  websiteUrl?: string;
  defaultRole: 'attendee' | 'organizer';
  authProvider: 'email' | 'linkedin';
  linkedinId?: string;
  areasOfInterest?: string[];
  createdAt: number;
  updatedAt: number;
}

// User role in specific event
interface UserEventRole {
  eventId: string;
  userId: string;
  role: 'attendee' | 'organizer';
  registeredAt: number;
}

// Event model
interface Event {
  id: string;
  name: string;
  description?: string;
  startDate: number;
  endDate: number;
  location?: string;
  organizerId: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

// Connection model
interface Connection {
  id: string;
  eventId: string;
  userId1: string; // Scanner
  userId2: string; // Scanned
  connectedAt: number;
}

// Auth token model
interface AuthToken {
  id: string;
  email: string;
  token: string;
  eventId?: string; // Presente si viene desde QR de evento
  intendedRole?: 'attendee' | 'organizer';
  expiresAt: number;
  used: boolean;
  createdAt: number;
}
```

## Error Handling

### Error Response Format

Todos los endpoints de la API seguirán un formato consistente de error:

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

### Error Codes

```typescript
enum ErrorCode {
  // Authentication errors (401)
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  
  // Authorization errors (403)
  FORBIDDEN = 'FORBIDDEN',
  NOT_ORGANIZER = 'NOT_ORGANIZER',
  
  // Validation errors (400)
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_QR_CODE = 'INVALID_QR_CODE',
  
  // Resource errors (404)
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EVENT_NOT_FOUND = 'EVENT_NOT_FOUND',
  CONNECTION_NOT_FOUND = 'CONNECTION_NOT_FOUND',
  
  // Business logic errors (409)
  DUPLICATE_CONNECTION = 'DUPLICATE_CONNECTION',
  EVENT_INACTIVE = 'EVENT_INACTIVE',
  SELF_CONNECTION = 'SELF_CONNECTION',
  USER_NOT_REGISTERED = 'USER_NOT_REGISTERED',
  
  // Server errors (500)
  DATABASE_ERROR = 'DATABASE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  EMAIL_SEND_FAILED = 'EMAIL_SEND_FAILED'
}
```

### Frontend Error Handling

```typescript
// Error boundary para capturar errores de React
class ErrorBoundary extends React.Component {
  // Captura errores de renderizado y muestra UI de fallback
}

// Interceptor de Axios para manejar errores de API
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Redirect to login
    }
    // Show user-friendly error message
    return Promise.reject(error);
  }
);

// Toast notifications para errores
const showError = (error: ErrorResponse) => {
  toast.error(error.error.message);
};
```

### Backend Error Handling

```typescript
// Middleware de manejo de errores en Hono
app.onError((err, c) => {
  console.error('Error:', err);
  
  if (err instanceof ValidationError) {
    return c.json({
      success: false,
      error: {
        code: ErrorCode.INVALID_INPUT,
        message: err.message,
        details: err.details
      }
    }, 400);
  }
  
  // Default error response
  return c.json({
    success: false,
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message: 'An unexpected error occurred'
    }
  }, 500);
});
```

## Testing Strategy

### Unit Testing

**Frontend (Vitest + React Testing Library)**
```typescript
// Component tests
describe('QRScanner', () => {
  it('should request camera permissions on mount');
  it('should call onScanSuccess when valid QR is scanned');
  it('should call onScanError when invalid QR is scanned');
  it('should handle camera permission denial');
});

// Hook tests
describe('useConnections', () => {
  it('should fetch connections for event');
  it('should handle loading state');
  it('should handle error state');
});
```

**Backend (Vitest)**
```typescript
// Service tests
describe('ConnectionService', () => {
  it('should create connection between two users');
  it('should prevent duplicate connections');
  it('should prevent self-connections');
  it('should validate users are registered to event');
});

// API endpoint tests
describe('POST /api/connections', () => {
  it('should return 201 with connection data');
  it('should return 401 if not authenticated');
  it('should return 409 if connection exists');
});
```

### Integration Testing

```typescript
// E2E flow tests
describe('Networking Flow', () => {
  it('should complete full attendee journey', async () => {
    // 1. Scan event QR
    // 2. Register profile
    // 3. Generate personal QR
    // 4. Scan another attendee
    // 5. View connections
  });
  
  it('should complete organizer flow', async () => {
    // 1. Create event
    // 2. View dashboard
    // 3. Check metrics update
  });
});
```

### Database Testing

```typescript
// Migration tests
describe('Database Migrations', () => {
  it('should create all tables');
  it('should create all indexes');
  it('should enforce foreign key constraints');
});

// Query performance tests
describe('Query Performance', () => {
  it('should fetch connections in <100ms with 1000 records');
  it('should calculate metrics in <500ms with 10000 connections');
});
```

### PWA Testing

```typescript
// Service worker tests
describe('Service Worker', () => {
  it('should cache static assets');
  it('should serve cached content offline');
  it('should sync data when connection restored');
});

// Offline functionality tests
describe('Offline Mode', () => {
  it('should display cached connections when offline');
  it('should queue connection creation when offline');
  it('should sync queued actions when online');
});
```

### Load Testing

```bash
# Artillery.io para load testing
artillery run load-test.yml

# Scenarios:
# - 100 concurrent users scanning QRs
# - 50 organizers viewing metrics simultaneously
# - 1000 users registering in 5 minutes
```

## LinkedIn OAuth Integration

### OAuth Flow

```
1. User clicks "Continue with LinkedIn"
2. Frontend redirects to: /api/auth/linkedin/authorize?eventId={eventId}
3. Backend generates state token (CSRF protection)
4. Backend redirects to LinkedIn OAuth:
   https://www.linkedin.com/oauth/v2/authorization?
     response_type=code&
     client_id={CLIENT_ID}&
     redirect_uri={CALLBACK_URL}&
     state={STATE_TOKEN}&
     scope=r_liteprofile%20r_emailaddress
5. User authorizes on LinkedIn
6. LinkedIn redirects to: /api/auth/linkedin/callback?code={CODE}&state={STATE}
7. Backend validates state token
8. Backend exchanges code for access token
9. Backend fetches user profile from LinkedIn API
10. Backend creates/updates user in database
11. Backend generates JWT
12. Backend redirects to frontend with JWT
```

### LinkedIn API Endpoints Used

```typescript
// Get access token
POST https://www.linkedin.com/oauth/v2/accessToken
Body: {
  grant_type: 'authorization_code',
  code: string,
  redirect_uri: string,
  client_id: string,
  client_secret: string
}

// Get user profile
GET https://api.linkedin.com/v2/me
Headers: { Authorization: 'Bearer {access_token}' }
Response: {
  id: string,
  localizedFirstName: string,
  localizedLastName: string,
  profilePicture: { ... }
}

// Get email address
GET https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))
Headers: { Authorization: 'Bearer {access_token}' }
Response: {
  elements: [{
    handle~: { emailAddress: string }
  }]
}

// Get current position (for job title and company)
GET https://api.linkedin.com/v2/me?projection=(id,positions)
Headers: { Authorization: 'Bearer {access_token}' }
```

### Environment Variables

```bash
# LinkedIn OAuth credentials
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
LINKEDIN_REDIRECT_URI=https://app.domain/api/auth/linkedin/callback

# JWT secret
JWT_SECRET=your_jwt_secret

# Frontend URL
FRONTEND_URL=https://app.domain
```

### Data Mapping

```typescript
// Mapeo de datos de LinkedIn a nuestro modelo
function mapLinkedInToUser(linkedInProfile: any): Partial<User> {
  return {
    linkedinId: linkedInProfile.id,
    name: `${linkedInProfile.localizedFirstName} ${linkedInProfile.localizedLastName}`,
    email: linkedInProfile.email,
    jobTitle: linkedInProfile.headline || linkedInProfile.positions?.elements?.[0]?.title,
    company: linkedInProfile.positions?.elements?.[0]?.companyName,
    photoUrl: linkedInProfile.profilePicture?.displayImage,
    linkedinUrl: `https://www.linkedin.com/in/${linkedInProfile.vanityName || linkedInProfile.id}`,
    authProvider: 'linkedin'
  };
}
```

## Security Considerations

### Authentication Security

1. **Magic Links**: Tokens de un solo uso con expiración de 15 minutos
2. **JWT**: Tokens firmados con HS256, expiración de 30 días, refresh automático
3. **Rate Limiting**: Máximo 5 solicitudes de magic link por email por hora

### Data Privacy

1. **Perfil público vs privado**: Los usuarios controlan qué información comparten
2. **GDPR compliance**: Opción de exportar y eliminar datos personales
3. **Encriptación**: HTTPS obligatorio, datos sensibles hasheados en D1

### QR Code Security

1. **Validación**: QR codes incluyen firma HMAC para prevenir falsificación
2. **Scope**: QR codes son específicos por evento, no reutilizables entre eventos
3. **Expiración**: QR codes de eventos expiran después de la fecha de fin

### API Security

1. **CORS**: Configurado para permitir solo dominios autorizados
2. **Input Validation**: Validación estricta de todos los inputs con Zod
3. **SQL Injection**: Uso de prepared statements con Drizzle ORM
4. **Rate Limiting**: Cloudflare Workers rate limiting por IP

## Performance Optimization

### Frontend Optimization

1. **Code Splitting**: Lazy loading de rutas con React.lazy()
2. **Image Optimization**: Compresión de fotos de perfil, lazy loading
3. **Bundle Size**: Tree shaking, eliminación de dependencias no usadas
4. **Caching**: Service worker cachea assets estáticos y API responses

### Backend Optimization

1. **Database Indexes**: Índices en columnas frecuentemente consultadas
2. **Query Optimization**: Uso de JOINs eficientes, evitar N+1 queries
3. **Caching**: Cloudflare KV para cachear métricas calculadas (TTL 5 min)
4. **Connection Pooling**: D1 maneja automáticamente el pooling

### CDN and Edge

1. **Edge Caching**: Cloudflare cachea respuestas GET en edge locations
2. **Geographic Distribution**: Workers ejecutan en el edge más cercano al usuario
3. **Asset Optimization**: Cloudflare optimiza automáticamente imágenes y JS

## Deployment Strategy

### Development Environment

```bash
# Local development
npm run dev # Frontend en localhost:5173
npm run dev:worker # Worker en localhost:8787

# Local D1 database
wrangler d1 execute DB --local --file=schema.sql
```

### Staging Environment

```bash
# Deploy a staging
npm run deploy:staging

# Cloudflare Pages preview deployment automático en cada PR
# Workers staging environment: staging.workers.dev
# D1 staging database: congress-app-staging
```

### Production Environment

```bash
# Deploy a producción
npm run deploy:prod

# Cloudflare Pages: app.domain.com
# Workers: api.domain.com
# D1 production database: congress-app-prod
```

### CI/CD Pipeline

```yaml
# GitHub Actions workflow
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    - Run tests
    - Build frontend
    - Deploy to Cloudflare Pages
    - Deploy Workers
    - Run migrations on D1
    - Run smoke tests
```

### Rollback Strategy

1. **Frontend**: Cloudflare Pages mantiene historial de deployments, rollback con un click
2. **Workers**: Versioning automático, rollback a versión anterior
3. **Database**: Migrations reversibles, backup automático antes de cada migration

## Monitoring and Analytics

### Application Monitoring

1. **Cloudflare Analytics**: Métricas de requests, latencia, errores
2. **Custom Logging**: Logs estructurados en Workers con contexto de request
3. **Error Tracking**: Sentry para tracking de errores frontend y backend

### Business Metrics

1. **Event Analytics**: Tracking de eventos creados, asistentes, conexiones
2. **User Engagement**: Tiempo en app, QRs escaneados por sesión
3. **Conversion Funnel**: Registro → Perfil completo → Primera conexión

### Alerting

1. **Error Rate**: Alerta si error rate > 5%
2. **Latency**: Alerta si p95 latency > 3 segundos
3. **Database**: Alerta si D1 storage > 80% capacity
