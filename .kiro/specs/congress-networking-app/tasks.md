# Implementation Plan

## Fase 1: Frontend Base y Deploy

- [x] 1. Configurar proyecto frontend con Vite + React + TypeScript
  - Inicializar proyecto con Vite
  - Configurar TypeScript con tipos estrictos
  - Instalar React 18+ y React Router
  - Configurar estructura de carpetas (components, pages, hooks, utils)
  - _Requirements: 8.1_

- [x] 2. Configurar TailwindCSS y design system
  - Instalar y configurar TailwindCSS
  - Crear archivo de configuración con colores del design system
  - Configurar fuente Inter
  - Crear componentes base (Button, Input, Card, Modal)
  - _Requirements: 7.1_

- [x] 3. Crear layout base y navegación
  - Implementar componente de Layout con header y footer
  - Crear componente Navbar responsive
  - Configurar React Router con rutas básicas
  - Implementar navegación móvil (hamburger menu)
  - _Requirements: 7.1_

- [x] 4. Implementar landing page
  - Crear página de inicio con hero section
  - Agregar botones "Soy Asistente" / "Soy Organizador"
  - Implementar input para código de evento
  - Hacer responsive para móvil
  - _Requirements: 2.1_

- [x] 5. Configurar Cloudflare Pages y hacer primer deploy
  - Crear cuenta en Cloudflare Pages
  - Conectar repositorio Git
  - Configurar build command (npm run build)
  - Configurar output directory (dist)
  - Hacer primer deploy y verificar
  - _Requirements: 8.1_

## Fase 2: Backend Base y Autenticación Simple

- [x] 6. Configurar Cloudflare Workers y Wrangler
  - Inicializar proyecto Workers con Wrangler
  - Configurar TypeScript
  - Instalar Hono framework
  - Crear estructura de carpetas (routes, services, middleware)
  - _Requirements: 8.2_

- [x] 7. Configurar base de datos D1
  - Crear base de datos D1 en Cloudflare
  - Crear archivo de migración SQL con tablas básicas (users, events, auth_tokens)
  - Crear índices para optimización
  - Configurar binding en wrangler.toml
  - Ejecutar migración inicial
  - _Requirements: 8.3_

- [x] 8. Implementar sistema de autenticación con Magic Links
  - [x] 8.1 Crear servicio de generación de tokens
    - Implementar función para generar tokens únicos y seguros
    - Crear función para almacenar tokens en auth_tokens con expiración
    - Escribir tests unitarios para generación de tokens
    - _Requirements: 6.1, 6.2, 6.4_
  
  - [x] 8.2 Implementar endpoint de solicitud de magic link
    - Crear POST /api/auth/request-magic-link
    - Validar formato de email con Zod
    - Generar token y almacenar en D1
    - Por ahora solo loggear el token (sin envío de email)
    - Escribir tests para el endpoint
    - _Requirements: 6.1, 6.2_
  
  - [x] 8.3 Implementar endpoint de verificación de magic link
    - Crear POST /api/auth/verify-magic-link
    - Validar token y verificar expiración (15 minutos)
    - Marcar token como usado
    - Generar JWT con expiración de 30 días
    - Crear o recuperar usuario de la base de datos
    - Escribir tests para verificación
    - _Requirements: 6.3, 6.4, 6.5_
  
  - [x] 8.4 Implementar middleware de autenticación JWT
    - Crear middleware para validar JWT en headers
    - Extraer userId del token y agregarlo al contexto
    - Manejar tokens expirados o inválidos
    - Escribir tests para middleware
    - _Requirements: 6.5, 6.6_

## Fase 3: Componentes de Autenticación Frontend

- [x] 9. Implementar componentes de autenticación (sin LinkedIn)
  - [x] 9.1 Crear componente AuthGate
    - Implementar lógica para detectar eventId en URL
    - Determinar flujo según contexto
    - Manejar redirecciones según estado de autenticación
    - Escribir tests de componente
    - _Requirements: 2.1, 2.2_
  
  - [x] 9.2 Crear componente MagicLinkRequest
    - Implementar formulario de email
    - Llamar a POST /api/auth/request-magic-link
    - Mostrar mensaje con el token (temporal, para desarrollo)
    - Escribir tests de componente
    - _Requirements: 2.2, 6.2_
  
  - [x] 9.3 Crear componente de verificación de magic link
    - Leer token de URL query params
    - Llamar a POST /api/auth/verify-magic-link
    - Almacenar JWT en localStorage
    - Redirigir según contexto
    - Escribir tests de componente
    - _Requirements: 6.3_
  
  - [x] 9.4 Crear componente RoleSelection
    - Mostrar opciones "Soy asistente" / "Soy organizador"
    - Solo mostrar en primer login sin eventId
    - Guardar rol seleccionado
    - Escribir tests de componente
    - _Requirements: 1.1_

## Fase 4: Gestión de Usuarios y Perfiles

- [x] 10. Implementar gestión de usuarios en backend
  - [x] 10.1 Crear endpoints CRUD de usuarios
    - Implementar POST /api/users para crear usuario
    - Implementar GET /api/users/:userId para obtener perfil
    - Implementar PUT /api/users/:userId para actualizar perfil
    - Validar inputs con Zod
    - Escribir tests para endpoints
    - _Requirements: 2.3, 2.7_
  
  - [x] 10.2 Agregar tabla user_interests a migración
    - Actualizar migración SQL con tabla user_interests
    - Crear índices apropiados
    - Ejecutar migración
    - _Requirements: 2.3_
  
  - [x] 10.3 Implementar gestión de áreas de interés
    - Crear endpoint GET /api/users/:userId/interests
    - Crear endpoint PUT /api/users/:userId/interests
    - Implementar lógica para insertar/eliminar en user_interests
    - Escribir tests
    - _Requirements: 2.3_

- [x] 11. Implementar componentes de perfil en frontend
  - [x] 11.1 Crear componente ProfileSetup
    - Implementar formulario completo (nombre, email, cargo, empresa, teléfono)
    - Validar inputs en frontend
    - Llamar a POST /api/users
    - Escribir tests de componente
    - _Requirements: 2.3, 2.4_
  
  - [x] 11.2 Crear componente AreasOfInterestSelector
    - Mostrar categorías predefinidas como chips
    - Permitir selección múltiple
    - Llamar a PUT /api/users/:userId/interests
    - Escribir tests de componente
    - _Requirements: 2.3_
  
  - [x] 11.3 Crear componente de enlaces sociales
    - Implementar inputs para LinkedIn, Twitter, Instagram, Website
    - Validar formato de URLs
    - Escribir tests de componente
    - _Requirements: 2.4_

## Fase 5: Gestión de Eventos

- [x] 12. Implementar gestión de eventos en backend
  - [x] 12.1 Agregar tablas de eventos a migración
    - Actualizar migración con tables events y event_registrations
    - Crear índices apropiados
    - Ejecutar migración
    - _Requirements: 1.1_
  
  - [x] 12.2 Crear endpoints CRUD de eventos
    - Implementar POST /api/events para crear evento
    - Implementar GET /api/events/:eventId para obtener evento
    - Implementar PUT /api/events/:eventId para actualizar evento
    - Validar que el usuario sea organizador
    - Escribir tests
    - _Requirements: 1.1, 1.2, 1.4_
  
  - [x] 12.3 Implementar registro a eventos
    - Crear función para registrar usuario a evento
    - Insertar en event_registrations con rol apropiado
    - Manejar caso de usuario ya registrado
    - Escribir tests
    - _Requirements: 2.8_
  
  - [x] 12.4 Implementar endpoint de listado de asistentes
    - Crear GET /api/events/:eventId/attendees
    - Hacer JOIN con event_registrations y users
    - Retornar lista de asistentes
    - Escribir tests
    - _Requirements: 1.4_

- [x] 13. Implementar componentes de eventos en frontend
  - [x] 13.1 Crear componente EventCreation
    - Implementar formulario con nombre, descripción, fechas, ubicación
    - Validar fechas
    - Llamar a POST /api/events
    - Mostrar QR del evento generado
    - Escribir tests
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [x] 13.2 Crear componente de visualización de evento
    - Mostrar detalles del evento
    - Mostrar QR del evento
    - Agregar botón para descargar QR
    - Escribir tests
    - _Requirements: 1.3, 1.4_
  
  - [x] 13.3 Crear componente de gestión de evento
    - Implementar toggle para activar/desactivar
    - Mostrar estadísticas básicas
    - Escribir tests
    - _Requirements: 1.5, 1.6_
  
  - [x] 13.4 Crear lista de asistentes
    - Llamar a GET /api/events/:eventId/attendees
    - Mostrar tabla con información
    - Escribir tests
    - _Requirements: 1.4_

## Fase 6: Sistema de Conexiones y QR

- [ ] 14. Implementar sistema de conexiones en backend
  - [ ] 14.1 Agregar tabla connections a migración
    - Actualizar migración con tabla connections
    - Crear índices apropiados
    - Ejecutar migración
    - _Requirements: 3.1_
  
  - [ ] 14.2 Crear endpoint para crear conexiones
    - Implementar POST /api/connections
    - Validar que ambos usuarios estén registrados al evento
    - Prevenir auto-conexiones y duplicados
    - Escribir tests
    - _Requirements: 3.3, 3.4, 3.6, 3.7_
  
  - [ ] 14.3 Implementar validación de QR codes
    - Crear función para validar formato /c/{eventId}/{userId}
    - Verificar que userId existe y está registrado
    - Verificar que evento está activo
    - Escribir tests
    - _Requirements: 3.3, 6.7_
  
  - [ ] 14.4 Crear endpoint para listar conexiones
    - Implementar GET /api/connections/my-connections
    - Hacer JOIN con users para perfiles completos
    - Ordenar por connected_at DESC
    - Implementar búsqueda y filtros
    - Escribir tests
    - _Requirements: 4.1, 4.2, 4.4, 4.5, 4.6_

- [ ] 15. Implementar componentes de QR en frontend
  - [ ] 15.1 Crear componente QRDisplay
    - Generar QR dinámicamente con librería qrcode
    - Formato: /c/{eventId}/{userId}
    - Mostrar nombre del usuario
    - Agregar botón para descargar
    - Escribir tests
    - _Requirements: 2.6, 3.1_
  
  - [ ] 15.2 Crear componente QRScanner
    - Integrar librería html5-qrcode
    - Solicitar permisos de cámara
    - Escanear y validar formato
    - Llamar a POST /api/connections
    - Manejar errores
    - Escribir tests
    - _Requirements: 3.2, 3.3, 7.4_
  
  - [ ] 15.3 Crear modal de perfil de conexión
    - Mostrar perfil completo al crear conexión
    - Incluir foto, nombre, cargo, empresa, redes
    - Agregar enlaces clickeables
    - Escribir tests
    - _Requirements: 3.5, 3.8_
  
  - [ ] 15.4 Crear vista de asistente (home)
    - Mostrar QR personal prominentemente
    - Agregar botón grande para escanear
    - Mostrar conexiones recientes
    - Escribir tests
    - _Requirements: 3.1, 3.2, 4.1_

- [ ] 16. Implementar lista de conexiones
  - [ ] 16.1 Crear componente ConnectionsList
    - Mostrar lista con foto, nombre, cargo, empresa
    - Ordenar por fecha
    - Vista de tarjetas responsive
    - Escribir tests
    - _Requirements: 4.1, 4.2, 4.4_
  
  - [ ] 16.2 Implementar búsqueda y filtros
    - Agregar barra de búsqueda
    - Agregar filtro por evento
    - Búsqueda en tiempo real
    - Escribir tests
    - _Requirements: 4.5, 4.6_
  
  - [ ] 16.3 Crear vista detallada de conexión
    - Mostrar perfil completo al hacer clic
    - Incluir todas las redes sociales
    - Mostrar fecha y hora de conexión
    - Escribir tests
    - _Requirements: 4.3_

## Fase 7: Dashboard de Métricas

- [ ] 17. Implementar métricas en backend
  - [ ] 17.1 Crear queries de métricas básicas
    - Query para contar asistentes por evento
    - Query para contar conexiones totales
    - Query para calcular promedio de conexiones
    - Optimizar con índices
    - Escribir tests
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ] 17.2 Implementar métricas avanzadas
    - Query para top networkers
    - Query para conexiones por hora
    - Query para distribución por empresa
    - Implementar filtrado por día
    - Escribir tests
    - _Requirements: 5.4, 5.5, 5.6, 5.7_
  
  - [ ] 17.3 Crear endpoint de métricas
    - Implementar GET /api/metrics/:eventId
    - Validar que usuario sea organizador
    - Retornar todas las métricas
    - Escribir tests
    - _Requirements: 5.1-5.7_

- [ ] 18. Implementar dashboard en frontend
  - [ ] 18.1 Crear componente MetricsDashboard
    - Llamar a GET /api/metrics/:eventId
    - Mostrar métricas básicas en cards
    - Implementar auto-refresh
    - Escribir tests
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ] 18.2 Crear gráfico de conexiones por hora
    - Integrar librería de gráficos (recharts)
    - Mostrar gráfico de barras o líneas
    - Implementar filtro por día
    - Escribir tests
    - _Requirements: 5.4, 5.7_
  
  - [ ] 18.3 Crear componente de top networkers
    - Mostrar ranking con foto, nombre, empresa
    - Limitar a top 10
    - Escribir tests
    - _Requirements: 5.5_
  
  - [ ] 18.4 Crear gráfico de distribución por empresa
    - Mostrar gráfico de pie o barras
    - Agrupar empresas pequeñas en "Otros"
    - Escribir tests
    - _Requirements: 5.6_

## Fase 8: PWA y Funcionalidades Offline

- [ ] 19. Implementar PWA
  - [ ] 19.1 Configurar service worker
    - Crear service worker con Workbox
    - Implementar caching de assets estáticos
    - Implementar estrategia network-first para API
    - Escribir tests
    - _Requirements: 7.1, 7.6_
  
  - [ ] 19.2 Crear manifest.json
    - Definir nombre, iconos, colores
    - Configurar display: standalone
    - Agregar screenshots
    - _Requirements: 7.2, 7.3_
  
  - [ ] 19.3 Implementar indicadores de estado de red
    - Detectar cuando usuario está offline
    - Mostrar banner de "Sin conexión"
    - Deshabilitar acciones que requieren red
    - Escribir tests
    - _Requirements: 7.5_
  
  - [ ] 19.4 Implementar sincronización offline
    - Guardar conexiones pendientes en IndexedDB
    - Sincronizar cuando vuelve la conexión
    - Mostrar indicador de sincronización
    - Escribir tests
    - _Requirements: 7.6, 7.7_

## Fase 9: Seguridad y Optimización

- [ ] 20. Implementar seguridad
  - [ ] 20.1 Configurar CORS en Workers
    - Permitir solo dominios autorizados
    - Configurar headers CORS
    - Escribir tests
    - _Requirements: 6.6_
  
  - [ ] 20.2 Implementar rate limiting
    - Usar Cloudflare Workers rate limiting
    - Limitar requests de magic link
    - Limitar requests de API
    - Escribir tests
    - _Requirements: 6.2_
  
  - [ ] 20.3 Implementar validación con Zod
    - Crear schemas para todos los endpoints
    - Validar inputs antes de procesar
    - Retornar errores descriptivos
    - Escribir tests
    - _Requirements: 6.1, 6.6_

- [ ] 21. Optimizar rendimiento
  - [ ] 21.1 Implementar code splitting
    - Usar React.lazy() para rutas
    - Implementar Suspense con loading states
    - Analizar bundle size
    - _Requirements: 8.4_
  
  - [ ] 21.2 Optimizar imágenes
    - Implementar compresión de fotos
    - Usar lazy loading
    - Implementar placeholders
    - _Requirements: 8.4_
  
  - [ ] 21.3 Optimizar queries de base de datos
    - Revisar uso de índices
    - Evitar N+1 queries
    - Medir performance
    - _Requirements: 8.5, 8.7_

## Fase 10: Envío de Emails y LinkedIn OAuth (Final)

- [ ] 22. Implementar envío de emails
  - [ ] 22.1 Configurar Cloudflare Email Workers
    - Configurar Email Worker
    - Crear template de email con link
    - Implementar función de envío
    - Escribir tests
    - _Requirements: 6.2_
  
  - [ ] 22.2 Integrar envío en magic link
    - Actualizar endpoint request-magic-link para enviar email real
    - Remover logging temporal del token
    - Probar flujo completo
    - _Requirements: 6.2_

- [ ] 23. Implementar funcionalidad de guardar contactos automáticamente
  - [ ] 23.1 Crear utilidad para guardar contactos
    - Crear función saveContact() que genera vCard
    - Implementar Web Share API para compartir vCard
    - Implementar fallback de descarga para navegadores sin Web Share API
    - Escribir tests para generación de vCard
    - _Requirements: 3.6, 3.7, 3.11_
  
  - [ ] 23.2 Actualizar Connection Success Modal
    - Agregar botón "📱 Guardar en Contactos"
    - Llamar a saveContact() al hacer clic
    - Mostrar feedback de éxito/error
    - Escribir tests de componente
    - _Requirements: 3.6, 3.7_
  
  - [ ] 23.3 Actualizar ConnectionsList con botón de guardar
    - Agregar botón "Guardar Contacto" en cada conexión
    - Permitir guardar/actualizar contacto desde la lista
    - Escribir tests
    - _Requirements: 3.11_
  
  - [ ] 23.4 Actualizar validación de teléfono
    - Hacer teléfono campo obligatorio en ProfileSetup
    - Agregar validación de formato en frontend
    - Actualizar validación en backend
    - Actualizar schema de base de datos (phone NOT NULL)
    - Escribir tests de validación
    - _Requirements: 2.3, 2.9_
