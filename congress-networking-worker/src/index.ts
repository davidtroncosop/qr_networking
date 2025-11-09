import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';
import { eventRoutes } from './routes/events';
import { connectionRoutes } from './routes/connections';

// Types for Cloudflare Workers environment
export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  FRONTEND_URL: string;
}

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use('/*', cors({
  origin: (origin) => {
    // Allow requests from frontend URL and localhost for development
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
    ];
    
    // Add production frontend URL from environment
    if (origin.includes('.pages.dev') || origin.includes('localhost')) {
      return origin;
    }
    
    return allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Health check
app.get('/', (c) => {
  return c.json({ 
    success: true, 
    message: 'Congress Networking API',
    version: '1.0.0'
  });
});

// Routes
app.route('/api/auth', authRoutes);
app.route('/api/users', userRoutes);
app.route('/api/events', eventRoutes);
app.route('/api/connections', connectionRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ 
    success: false, 
    error: { 
      code: 'NOT_FOUND', 
      message: 'Endpoint not found' 
    } 
  }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ 
    success: false, 
    error: { 
      code: 'INTERNAL_ERROR', 
      message: 'An unexpected error occurred',
      details: err.message
    } 
  }, 500);
});

export default app;
