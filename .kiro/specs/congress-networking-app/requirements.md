# Requirements Document

## Introduction

Esta aplicación es una plataforma de networking inteligente diseñada para eventos, ferias y congresos. Permite a los asistentes conectarse entre sí mediante el escaneo de códigos QR, compartir sus redes sociales y perfiles profesionales, mientras que los organizadores obtienen métricas en tiempo real sobre las interacciones del evento. La solución se implementará como una Progressive Web App (PWA) utilizando la infraestructura de Cloudflare (Pages, Workers, D1) para garantizar escalabilidad, bajo costo y acceso instantáneo sin necesidad de instalación.

## Requirements

### Requirement 1: Gestión de Eventos por Organizadores

**User Story:** Como organizador de eventos, quiero configurar y gestionar eventos en el sistema, para que los asistentes puedan registrarse y conectarse durante mi congreso o feria.

#### Acceptance Criteria

1. WHEN un organizador accede al panel de administración THEN el sistema SHALL mostrar una interfaz para crear nuevos eventos
2. WHEN un organizador crea un evento THEN el sistema SHALL solicitar nombre del evento, fecha de inicio, fecha de fin, descripción, y ubicación
3. WHEN un organizador completa el formulario de evento THEN el sistema SHALL generar un código QR único del evento y una URL personalizada
4. WHEN un organizador visualiza un evento creado THEN el sistema SHALL mostrar el QR del evento, la URL de acceso, y estadísticas básicas
5. IF un evento está activo THEN el sistema SHALL permitir que nuevos asistentes se registren escaneando el QR o accediendo a la URL
6. WHEN un organizador solicita desactivar un evento THEN el sistema SHALL bloquear nuevos registros pero mantener los datos históricos

### Requirement 2: Registro y Perfil de Asistentes

**User Story:** Como asistente a un congreso, quiero crear mi perfil con mis datos profesionales y redes sociales, para poder compartir mi información fácilmente con otros participantes.

#### Acceptance Criteria

1. WHEN un asistente escanea el QR del evento o accede a la URL THEN el sistema SHALL abrir la web app sin necesidad de instalación
2. WHEN un asistente accede por primera vez THEN el sistema SHALL mostrar una pantalla de registro o login
3. WHEN un asistente se registra THEN el sistema SHALL solicitar nombre completo, email, número de teléfono (obligatorio), cargo/profesión, empresa/organización, y foto de perfil opcional
4. WHEN un asistente completa el registro THEN el sistema SHALL permitir agregar enlaces a redes sociales (LinkedIn, Twitter, Instagram, sitio web personal)
5. IF un asistente ya tiene cuenta THEN el sistema SHALL permitir login mediante email y link mágico
6. WHEN un asistente completa su perfil THEN el sistema SHALL generar automáticamente un código QR personal único
7. WHEN un asistente actualiza su perfil THEN el sistema SHALL guardar los cambios y mantener el mismo QR personal
8. IF un asistente participa en múltiples eventos THEN el sistema SHALL reutilizar su perfil base permitiendo ajustes por evento
9. WHEN un asistente completa su perfil THEN el sistema SHALL validar que el número de teléfono tenga formato válido

### Requirement 3: Conexiones entre Asistentes mediante QR

**User Story:** Como asistente, quiero escanear el código QR de otros participantes y mostrar el mío, para conectarme rápidamente sin intercambiar tarjetas físicas o datos manualmente.

#### Acceptance Criteria

1. WHEN un asistente accede a su perfil THEN el sistema SHALL mostrar prominentemente su código QR personal
2. WHEN un asistente selecciona la opción de escanear THEN el sistema SHALL activar la cámara del dispositivo
3. WHEN un asistente escanea el QR de otro participante THEN el sistema SHALL validar que el QR pertenece a un asistente del mismo evento
4. IF el QR escaneado es válido THEN el sistema SHALL crear una conexión bidireccional entre ambos usuarios
5. WHEN se crea una conexión THEN el sistema SHALL mostrar el perfil completo del otro asistente incluyendo número de teléfono y redes sociales
6. WHEN se crea una conexión THEN el sistema SHALL ofrecer guardar el contacto automáticamente en el teléfono del usuario
7. WHEN un usuario acepta guardar el contacto THEN el sistema SHALL usar la API de contactos del navegador para agregar nombre, teléfono, email y empresa
8. WHEN se crea una conexión THEN el sistema SHALL registrar la fecha, hora y evento donde ocurrió
9. IF un asistente intenta conectar con alguien ya conectado THEN el sistema SHALL mostrar el perfil existente sin duplicar la conexión
10. WHEN un asistente visualiza una conexión THEN el sistema SHALL permitir acceder directamente a las redes sociales del contacto mediante enlaces
11. WHEN un asistente visualiza una conexión THEN el sistema SHALL mostrar un botón para guardar/actualizar el contacto en su teléfono

### Requirement 4: Visualización de Conexiones

**User Story:** Como asistente, quiero ver todas mis conexiones realizadas durante el evento, para poder revisar y contactar a las personas que conocí.

#### Acceptance Criteria

1. WHEN un asistente accede a la sección de conexiones THEN el sistema SHALL mostrar una lista de todos sus contactos del evento actual
2. WHEN un asistente visualiza la lista de conexiones THEN el sistema SHALL mostrar foto, nombre, cargo y empresa de cada contacto
3. WHEN un asistente selecciona una conexión THEN el sistema SHALL mostrar el perfil completo con todas las redes sociales
4. WHEN un asistente visualiza sus conexiones THEN el sistema SHALL ordenarlas por fecha de conexión (más recientes primero)
5. IF un asistente ha participado en múltiples eventos THEN el sistema SHALL permitir filtrar conexiones por evento
6. WHEN un asistente busca en sus conexiones THEN el sistema SHALL permitir búsqueda por nombre, empresa o cargo

### Requirement 5: Dashboard de Métricas para Organizadores

**User Story:** Como organizador, quiero visualizar métricas en tiempo real sobre las interacciones del evento, para entender el comportamiento de networking de los asistentes y generar informes.

#### Acceptance Criteria

1. WHEN un organizador accede al dashboard de un evento THEN el sistema SHALL mostrar el número total de asistentes registrados
2. WHEN un organizador visualiza las métricas THEN el sistema SHALL mostrar el número total de conexiones realizadas
3. WHEN un organizador visualiza las métricas THEN el sistema SHALL calcular y mostrar el promedio de conexiones por asistente
4. WHEN un organizador visualiza las métricas THEN el sistema SHALL mostrar un gráfico de conexiones por hora del día
5. WHEN un organizador visualiza las métricas THEN el sistema SHALL identificar los asistentes con más conexiones (top networkers)
6. WHEN un organizador visualiza las métricas THEN el sistema SHALL mostrar distribución de asistentes por empresa/organización
7. IF el evento tiene múltiples días THEN el sistema SHALL permitir filtrar métricas por día específico
8. WHEN un organizador solicita un informe THEN el sistema SHALL generar un resumen descargable con todas las métricas clave

### Requirement 6: Autenticación y Seguridad

**User Story:** Como usuario del sistema, quiero que mi información esté protegida y que el acceso sea seguro pero simple, para confiar en la plataforma sin complicaciones de login.

#### Acceptance Criteria

1. WHEN un usuario se registra THEN el sistema SHALL validar que el email tenga formato correcto
2. WHEN un usuario solicita login THEN el sistema SHALL enviar un link mágico al email registrado
3. WHEN un usuario hace clic en el link mágico THEN el sistema SHALL autenticar la sesión sin requerir contraseña
4. IF un link mágico tiene más de 15 minutos THEN el sistema SHALL rechazarlo y solicitar uno nuevo
5. WHEN un usuario está autenticado THEN el sistema SHALL mantener la sesión activa por 30 días
6. WHEN un usuario accede a datos de otro usuario THEN el sistema SHALL mostrar solo información que el propietario haya marcado como pública
7. IF un QR es escaneado THEN el sistema SHALL validar que pertenece al evento correcto antes de crear conexión

### Requirement 7: Progressive Web App (PWA) y Experiencia Móvil

**User Story:** Como asistente, quiero acceder a la aplicación instantáneamente desde mi móvil sin descargar nada, para usarla de forma rápida durante el evento.

#### Acceptance Criteria

1. WHEN un usuario accede a la URL THEN el sistema SHALL cargar la aplicación como PWA funcional
2. WHEN un usuario accede desde un navegador móvil THEN el sistema SHALL ofrecer instalar la app en la pantalla de inicio
3. IF un usuario instala la PWA THEN el sistema SHALL funcionar con apariencia de app nativa
4. WHEN un usuario usa la cámara para escanear QR THEN el sistema SHALL solicitar permisos de cámara de forma clara
5. WHEN la conexión de red es inestable THEN el sistema SHALL mostrar indicadores de estado de conexión
6. IF un usuario pierde conexión temporalmente THEN el sistema SHALL permitir visualizar conexiones ya cargadas en modo offline
7. WHEN la conexión se restablece THEN el sistema SHALL sincronizar automáticamente cualquier acción pendiente

### Requirement 8: Infraestructura y Rendimiento

**User Story:** Como administrador del sistema, quiero que la plataforma sea escalable y de bajo costo, para soportar eventos de cualquier tamaño sin problemas de rendimiento.

#### Acceptance Criteria

1. WHEN se despliega el frontend THEN el sistema SHALL utilizar Cloudflare Pages para hosting estático
2. WHEN se ejecutan operaciones de backend THEN el sistema SHALL utilizar Cloudflare Workers para procesamiento serverless
3. WHEN se almacenan datos THEN el sistema SHALL utilizar Cloudflare D1 como base de datos SQLite gestionada
4. WHEN un usuario realiza una acción THEN el sistema SHALL responder en menos de 2 segundos en condiciones normales
5. IF un evento tiene más de 1000 asistentes THEN el sistema SHALL mantener el rendimiento sin degradación
6. WHEN se generan códigos QR THEN el sistema SHALL generarlos dinámicamente en el frontend para reducir carga del servidor
7. WHEN se consultan métricas THEN el sistema SHALL utilizar queries optimizadas con índices apropiados en D1
