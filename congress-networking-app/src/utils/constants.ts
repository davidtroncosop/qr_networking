// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

// Local Storage Keys
export const STORAGE_KEYS = {
  JWT_TOKEN: 'jwt_token',
  USER_DATA: 'user_data',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  EVENT: '/e/:eventId',
  CONNECTION: '/c/:eventId/:userId',
  DASHBOARD: '/dashboard',
  DASHBOARD_EVENT: '/dashboard/events/:eventId',
  EVENT_VIEW: '/events/:eventId',
  PROFILE: '/profile',
  CONNECTIONS: '/events/:eventId/connections',
} as const;

// Interest Categories
export const INTEREST_CATEGORIES = [
  'Tecnología',
  'Marketing',
  'Ventas',
  'Finanzas',
  'Recursos Humanos',
  'Operaciones',
  'Producto',
  'Diseño',
  'Investigación',
  'Educación',
  'Salud',
  'Legal',
  'Emprendimiento',
  'Inversión',
  'Otro',
] as const;
