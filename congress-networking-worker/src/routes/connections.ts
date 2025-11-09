import { Hono } from 'hono';
import type { Env } from '../index';
import { verifyJWT } from '../utils/jwt';
import { generateUUID } from '../utils/crypto';

export const connectionRoutes = new Hono<{ Bindings: Env }>();

// Middleware to verify JWT
async function requireAuth(c: any, next: any) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing or invalid authorization header'
      }
    }, 401);
  }
  
  const token = authHeader.substring(7);
  const payload = await verifyJWT(token, c.env.JWT_SECRET);
  
  if (!payload) {
    return c.json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token'
      }
    }, 401);
  }
  
  c.set('userId', payload.userId);
  await next();
}

// POST /api/connections - Create connection
connectionRoutes.post('/', requireAuth, async (c) => {
  try {
    const userId1 = c.get('userId'); // User who scanned
    const { eventId, scannedUserId } = await c.req.json();
    
    if (!eventId || !scannedUserId) {
      return c.json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'eventId and scannedUserId are required'
        }
      }, 400);
    }
    
    // Prevent self-connection
    if (userId1 === scannedUserId) {
      return c.json({
        success: false,
        error: {
          code: 'SELF_CONNECTION',
          message: 'Cannot connect with yourself'
        }
      }, 400);
    }
    
    // Check if event exists and is active
    const event = await c.env.DB.prepare(`
      SELECT * FROM events WHERE id = ? AND is_active = 1
    `).bind(eventId).first();
    
    if (!event) {
      return c.json({
        success: false,
        error: {
          code: 'EVENT_NOT_FOUND',
          message: 'Event not found or inactive'
        }
      }, 404);
    }
    
    // Check if both users are registered to the event
    const user1Reg = await c.env.DB.prepare(`
      SELECT * FROM event_registrations WHERE event_id = ? AND user_id = ?
    `).bind(eventId, userId1).first();
    
    const user2Reg = await c.env.DB.prepare(`
      SELECT * FROM event_registrations WHERE event_id = ? AND user_id = ?
    `).bind(eventId, scannedUserId).first();
    
    if (!user1Reg || !user2Reg) {
      return c.json({
        success: false,
        error: {
          code: 'USER_NOT_REGISTERED',
          message: 'Both users must be registered to the event'
        }
      }, 400);
    }
    
    // Check if connection already exists (bidirectional)
    const existing = await c.env.DB.prepare(`
      SELECT * FROM connections 
      WHERE event_id = ? 
      AND ((user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?))
    `).bind(eventId, userId1, scannedUserId, scannedUserId, userId1).first();
    
    if (existing) {
      // Get scanned user info
      const scannedUser = await c.env.DB.prepare(`
        SELECT * FROM users WHERE id = ?
      `).bind(scannedUserId).first();
      
      return c.json({
        success: true,
        message: 'Connection already exists',
        connection: {
          id: existing.id,
          alreadyConnected: true
        },
        connectedUser: {
          id: scannedUser.id,
          name: scannedUser.name,
          email: scannedUser.email,
          phone: scannedUser.phone,
          jobTitle: scannedUser.job_title,
          company: scannedUser.company,
          photoUrl: scannedUser.photo_url,
          linkedinUrl: scannedUser.linkedin_url,
          twitterUrl: scannedUser.twitter_url,
          instagramUrl: scannedUser.instagram_url,
          websiteUrl: scannedUser.website_url
        }
      });
    }
    
    // Create connection
    const connectionId = generateUUID();
    const now = Date.now();
    
    await c.env.DB.prepare(`
      INSERT INTO connections (id, event_id, user_id_1, user_id_2, connected_at)
      VALUES (?, ?, ?, ?, ?)
    `).bind(connectionId, eventId, userId1, scannedUserId, now).run();
    
    // Get scanned user info
    const scannedUser = await c.env.DB.prepare(`
      SELECT * FROM users WHERE id = ?
    `).bind(scannedUserId).first();
    
    // Get interests
    const interestsResult = await c.env.DB.prepare(`
      SELECT interest FROM user_interests WHERE user_id = ?
    `).bind(scannedUserId).all();
    
    const interests = interestsResult.results?.map((r: any) => r.interest) || [];
    
    return c.json({
      success: true,
      connection: {
        id: connectionId,
        eventId,
        connectedAt: now,
        alreadyConnected: false
      },
      connectedUser: {
        id: scannedUser.id,
        name: scannedUser.name,
        email: scannedUser.email,
        phone: scannedUser.phone,
        jobTitle: scannedUser.job_title,
        company: scannedUser.company,
        photoUrl: scannedUser.photo_url,
        linkedinUrl: scannedUser.linkedin_url,
        twitterUrl: scannedUser.twitter_url,
        instagramUrl: scannedUser.instagram_url,
        websiteUrl: scannedUser.website_url,
        areasOfInterest: interests
      }
    }, 201);
    
  } catch (error) {
    console.error('Error creating connection:', error);
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create connection'
      }
    }, 500);
  }
});

// GET /api/connections/my-connections - Get user's connections
connectionRoutes.get('/my-connections', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const eventId = c.req.query('eventId');
    
    if (!eventId) {
      return c.json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'eventId is required'
        }
      }, 400);
    }
    
    // Get connections (bidirectional)
    const results = await c.env.DB.prepare(`
      SELECT 
        c.*,
        u.id as user_id,
        u.name,
        u.email,
        u.phone,
        u.job_title,
        u.company,
        u.photo_url,
        u.linkedin_url,
        u.twitter_url,
        u.instagram_url,
        u.website_url
      FROM connections c
      JOIN users u ON (
        CASE 
          WHEN c.user_id_1 = ? THEN u.id = c.user_id_2
          WHEN c.user_id_2 = ? THEN u.id = c.user_id_1
        END
      )
      WHERE c.event_id = ? AND (c.user_id_1 = ? OR c.user_id_2 = ?)
      ORDER BY c.connected_at DESC
    `).bind(userId, userId, eventId, userId, userId).all();
    
    const connections = await Promise.all(
      (results.results || []).map(async (row: any) => {
        // Get interests for this user
        const interestsResult = await c.env.DB.prepare(`
          SELECT interest FROM user_interests WHERE user_id = ?
        `).bind(row.user_id).all();
        
        const interests = interestsResult.results?.map((r: any) => r.interest) || [];
        
        return {
          id: row.id,
          eventId: row.event_id,
          connectedAt: row.connected_at,
          connectedUser: {
            id: row.user_id,
            name: row.name,
            email: row.email,
            phone: row.phone,
            jobTitle: row.job_title,
            company: row.company,
            photoUrl: row.photo_url,
            linkedinUrl: row.linkedin_url,
            twitterUrl: row.twitter_url,
            instagramUrl: row.instagram_url,
            websiteUrl: row.website_url,
            areasOfInterest: interests
          }
        };
      })
    );
    
    return c.json({
      success: true,
      connections
    });
    
  } catch (error) {
    console.error('Error getting connections:', error);
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get connections'
      }
    }, 500);
  }
});
