import { Hono } from 'hono';
import type { Env } from '../index';
import { verifyJWT } from '../utils/jwt';
import { generateUUID } from '../utils/crypto';

export const eventRoutes = new Hono<{ Bindings: Env }>();

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

// POST /api/events - Create event
eventRoutes.post('/', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const data = await c.req.json();
    
    // Validate required fields
    if (!data.name || !data.name.trim()) {
      return c.json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Event name is required'
        }
      }, 400);
    }
    
    if (!data.startDate || !data.endDate) {
      return c.json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Start and end dates are required'
        }
      }, 400);
    }
    
    // Validate dates
    const startDate = new Date(data.startDate).getTime();
    const endDate = new Date(data.endDate).getTime();
    
    if (isNaN(startDate) || isNaN(endDate)) {
      return c.json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Invalid date format'
        }
      }, 400);
    }
    
    if (endDate < startDate) {
      return c.json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'End date must be after start date'
        }
      }, 400);
    }
    
    const eventId = generateUUID();
    const now = Date.now();
    
    // Create event
    await c.env.DB.prepare(`
      INSERT INTO events (id, name, description, start_date, end_date, location, organizer_id, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `).bind(
      eventId,
      data.name,
      data.description || null,
      startDate,
      endDate,
      data.location || null,
      userId,
      now,
      now
    ).run();
    
    // Register organizer to event
    const registrationId = generateUUID();
    await c.env.DB.prepare(`
      INSERT INTO event_registrations (id, event_id, user_id, role, registered_at)
      VALUES (?, ?, ?, 'organizer', ?)
    `).bind(registrationId, eventId, userId, now).run();
    
    // Get created event
    const event = await c.env.DB.prepare(`
      SELECT * FROM events WHERE id = ?
    `).bind(eventId).first();
    
    // Generate QR code URL
    const qrCodeUrl = `${c.env.FRONTEND_URL}/e/${eventId}`;
    
    return c.json({
      success: true,
      event: {
        id: event.id,
        name: event.name,
        description: event.description,
        startDate: event.start_date,
        endDate: event.end_date,
        location: event.location,
        organizerId: event.organizer_id,
        isActive: event.is_active === 1,
        qrCodeUrl
      }
    });
    
  } catch (error) {
    console.error('Error creating event:', error);
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create event'
      }
    }, 500);
  }
});

// GET /api/events/:eventId - Get event
eventRoutes.get('/:eventId', async (c) => {
  try {
    const eventId = c.req.param('eventId');
    
    const event = await c.env.DB.prepare(`
      SELECT * FROM events WHERE id = ?
    `).bind(eventId).first();
    
    if (!event) {
      return c.json({
        success: false,
        error: {
          code: 'EVENT_NOT_FOUND',
          message: 'Event not found'
        }
      }, 404);
    }
    
    const qrCodeUrl = `${c.env.FRONTEND_URL}/e/${eventId}`;
    
    return c.json({
      success: true,
      event: {
        id: event.id,
        name: event.name,
        description: event.description,
        startDate: event.start_date,
        endDate: event.end_date,
        location: event.location,
        organizerId: event.organizer_id,
        isActive: event.is_active === 1,
        qrCodeUrl
      }
    });
    
  } catch (error) {
    console.error('Error getting event:', error);
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get event'
      }
    }, 500);
  }
});

// PUT /api/events/:eventId - Update event
eventRoutes.put('/:eventId', requireAuth, async (c) => {
  try {
    const eventId = c.req.param('eventId');
    const userId = c.get('userId');
    
    // Check if user is organizer
    const event = await c.env.DB.prepare(`
      SELECT * FROM events WHERE id = ?
    `).bind(eventId).first();
    
    if (!event) {
      return c.json({
        success: false,
        error: {
          code: 'EVENT_NOT_FOUND',
          message: 'Event not found'
        }
      }, 404);
    }
    
    if (event.organizer_id !== userId) {
      return c.json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Only the organizer can update this event'
        }
      }, 403);
    }
    
    const data = await c.req.json();
    const now = Date.now();
    
    // Build update query
    const updates: string[] = [];
    const values: any[] = [];
    
    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description || null);
    }
    if (data.startDate !== undefined) {
      const startDate = new Date(data.startDate).getTime();
      if (!isNaN(startDate)) {
        updates.push('start_date = ?');
        values.push(startDate);
      }
    }
    if (data.endDate !== undefined) {
      const endDate = new Date(data.endDate).getTime();
      if (!isNaN(endDate)) {
        updates.push('end_date = ?');
        values.push(endDate);
      }
    }
    if (data.location !== undefined) {
      updates.push('location = ?');
      values.push(data.location || null);
    }
    if (data.isActive !== undefined) {
      updates.push('is_active = ?');
      values.push(data.isActive ? 1 : 0);
    }
    
    if (updates.length === 0) {
      return c.json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'No fields to update'
        }
      }, 400);
    }
    
    updates.push('updated_at = ?');
    values.push(now);
    values.push(eventId);
    
    await c.env.DB.prepare(`
      UPDATE events SET ${updates.join(', ')} WHERE id = ?
    `).bind(...values).run();
    
    // Get updated event
    const updatedEvent = await c.env.DB.prepare(`
      SELECT * FROM events WHERE id = ?
    `).bind(eventId).first();
    
    const qrCodeUrl = `${c.env.FRONTEND_URL}/e/${eventId}`;
    
    return c.json({
      success: true,
      event: {
        id: updatedEvent.id,
        name: updatedEvent.name,
        description: updatedEvent.description,
        startDate: updatedEvent.start_date,
        endDate: updatedEvent.end_date,
        location: updatedEvent.location,
        organizerId: updatedEvent.organizer_id,
        isActive: updatedEvent.is_active === 1,
        qrCodeUrl
      }
    });
    
  } catch (error) {
    console.error('Error updating event:', error);
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update event'
      }
    }, 500);
  }
});

// GET /api/events/:eventId/attendees - Get event attendees
eventRoutes.get('/:eventId/attendees', async (c) => {
  try {
    const eventId = c.req.param('eventId');
    
    // Check if event exists
    const event = await c.env.DB.prepare(`
      SELECT * FROM events WHERE id = ?
    `).bind(eventId).first();
    
    if (!event) {
      return c.json({
        success: false,
        error: {
          code: 'EVENT_NOT_FOUND',
          message: 'Event not found'
        }
      }, 404);
    }
    
    // Get attendees
    const results = await c.env.DB.prepare(`
      SELECT u.*, er.role, er.registered_at
      FROM users u
      JOIN event_registrations er ON u.id = er.user_id
      WHERE er.event_id = ?
      ORDER BY er.registered_at DESC
    `).bind(eventId).all();
    
    const attendees = results.results?.map((row: any) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      jobTitle: row.job_title,
      company: row.company,
      phone: row.phone,
      role: row.role,
      registeredAt: row.registered_at
    })) || [];
    
    return c.json({
      success: true,
      attendees,
      count: attendees.length
    });
    
  } catch (error) {
    console.error('Error getting attendees:', error);
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get attendees'
      }
    }, 500);
  }
});

// POST /api/events/:eventId/register - Register to event
eventRoutes.post('/:eventId/register', requireAuth, async (c) => {
  try {
    const eventId = c.req.param('eventId');
    const userId = c.get('userId');
    
    // Check if event exists and is active
    const event = await c.env.DB.prepare(`
      SELECT * FROM events WHERE id = ?
    `).bind(eventId).first();
    
    if (!event) {
      return c.json({
        success: false,
        error: {
          code: 'EVENT_NOT_FOUND',
          message: 'Event not found'
        }
      }, 404);
    }
    
    if (event.is_active !== 1) {
      return c.json({
        success: false,
        error: {
          code: 'EVENT_INACTIVE',
          message: 'Event is not active'
        }
      }, 400);
    }
    
    // Check if already registered
    const existing = await c.env.DB.prepare(`
      SELECT * FROM event_registrations WHERE event_id = ? AND user_id = ?
    `).bind(eventId, userId).first();
    
    if (existing) {
      return c.json({
        success: true,
        message: 'Already registered to this event'
      });
    }
    
    // Register user
    const registrationId = generateUUID();
    const now = Date.now();
    
    await c.env.DB.prepare(`
      INSERT INTO event_registrations (id, event_id, user_id, role, registered_at)
      VALUES (?, ?, ?, 'attendee', ?)
    `).bind(registrationId, eventId, userId, now).run();
    
    return c.json({
      success: true,
      message: 'Successfully registered to event'
    });
    
  } catch (error) {
    console.error('Error registering to event:', error);
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to register to event'
      }
    }, 500);
  }
});

// POST /api/events/:eventId/quick-register - Quick register without auth
eventRoutes.post('/:eventId/quick-register', async (c) => {
  try {
    const eventId = c.req.param('eventId');
    const data = await c.req.json();
    
    // Validate required fields
    if (!data.name || !data.email) {
      return c.json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Name and email are required'
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
    
    // Check if user already exists by email
    let user = await c.env.DB.prepare(`
      SELECT * FROM users WHERE email = ?
    `).bind(data.email).first();
    
    const now = Date.now();
    
    if (!user) {
      // Create new user
      const userId = generateUUID();
      
      await c.env.DB.prepare(`
        INSERT INTO users (
          id, email, name, job_title, company, phone,
          linkedin_url, twitter_url, instagram_url, website_url,
          default_role, auth_provider, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'attendee', 'guest', ?, ?)
      `).bind(
        userId,
        data.email,
        data.name,
        data.jobTitle || null,
        data.company || null,
        data.phone || null,
        data.linkedinUrl || null,
        data.twitterUrl || null,
        data.instagramUrl || null,
        data.websiteUrl || null,
        now,
        now
      ).run();
      
      // Add interests if provided
      if (data.interests && Array.isArray(data.interests)) {
        for (const interest of data.interests) {
          const interestId = generateUUID();
          await c.env.DB.prepare(`
            INSERT INTO user_interests (id, user_id, interest, created_at)
            VALUES (?, ?, ?, ?)
          `).bind(interestId, userId, interest, now).run();
        }
      }
      
      user = { id: userId, email: data.email, name: data.name };
    }
    
    // Check if already registered
    const existingRegistration = await c.env.DB.prepare(`
      SELECT * FROM event_registrations WHERE event_id = ? AND user_id = ?
    `).bind(eventId, user.id).first();
    
    if (!existingRegistration) {
      // Register user to event
      const registrationId = generateUUID();
      
      await c.env.DB.prepare(`
        INSERT INTO event_registrations (id, event_id, user_id, role, registered_at)
        VALUES (?, ?, ?, 'attendee', ?)
      `).bind(registrationId, eventId, user.id, now).run();
    }
    
    // Get user interests
    const interestsResult = await c.env.DB.prepare(`
      SELECT interest FROM user_interests WHERE user_id = ?
    `).bind(user.id).all();
    
    const interests = interestsResult.results?.map((r: any) => r.interest) || [];
    
    return c.json({
      success: true,
      message: 'Successfully registered to event',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          interests
        },
        event: {
          id: event.id,
          name: event.name
        }
      }
    });
    
  } catch (error) {
    console.error('Error in quick register:', error);
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to register'
      }
    }, 500);
  }
});
