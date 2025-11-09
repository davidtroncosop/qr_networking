import { Hono } from 'hono';
import type { Env } from '../index';
import { generateToken, generateUUID } from '../utils/crypto';
import { signJWT, verifyJWT } from '../utils/jwt';

export const authRoutes = new Hono<{ Bindings: Env }>();

// POST /api/auth/request-magic-link
authRoutes.post('/request-magic-link', async (c) => {
  try {
    const { email, eventId, intendedRole } = await c.req.json();
    
    // Validate email
    if (!email || !email.includes('@')) {
      return c.json({
        success: false,
        error: {
          code: 'INVALID_EMAIL',
          message: 'Invalid email format'
        }
      }, 400);
    }
    
    // Generate token
    const token = generateToken(32);
    const tokenId = generateUUID();
    const now = Date.now();
    const expiresAt = now + (15 * 60 * 1000); // 15 minutes
    
    // Store token in database
    await c.env.DB.prepare(`
      INSERT INTO auth_tokens (id, email, token, event_id, intended_role, expires_at, used, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 0, ?)
    `).bind(
      tokenId,
      email.toLowerCase(),
      token,
      eventId || null,
      intendedRole || null,
      expiresAt,
      now
    ).run();
    
    // TODO: Send email with magic link
    // For now, just log the token (development only)
    console.log(`Magic link token for ${email}: ${token}`);
    console.log(`Magic link URL: ${c.env.FRONTEND_URL}/auth/verify?token=${token}`);
    
    return c.json({
      success: true,
      message: 'Magic link sent to your email',
      // TEMPORARY: Include token in response for development
      token: token
    });
    
  } catch (error) {
    console.error('Error requesting magic link:', error);
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to send magic link'
      }
    }, 500);
  }
});

// POST /api/auth/verify-magic-link
authRoutes.post('/verify-magic-link', async (c) => {
  try {
    const { token } = await c.req.json();
    
    if (!token) {
      return c.json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Token is required'
        }
      }, 400);
    }
    
    // Find token in database
    const result = await c.env.DB.prepare(`
      SELECT * FROM auth_tokens WHERE token = ? AND used = 0
    `).bind(token).first();
    
    if (!result) {
      return c.json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or already used token'
        }
      }, 401);
    }
    
    // Check expiration
    const now = Date.now();
    if (result.expires_at < now) {
      return c.json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Token has expired'
        }
      }, 401);
    }
    
    // Mark token as used
    await c.env.DB.prepare(`
      UPDATE auth_tokens SET used = 1 WHERE id = ?
    `).bind(result.id).run();
    
    // Check if user exists
    let user = await c.env.DB.prepare(`
      SELECT * FROM users WHERE email = ?
    `).bind(result.email).first();
    
    const isNewUser = !user;
    
    // Create user if doesn't exist
    if (!user) {
      const userId = generateUUID();
      const now = Date.now();
      
      await c.env.DB.prepare(`
        INSERT INTO users (id, email, name, default_role, auth_provider, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        userId,
        result.email,
        result.email.split('@')[0], // Temporary name
        result.intended_role || 'attendee',
        'email',
        now,
        now
      ).run();
      
      user = await c.env.DB.prepare(`
        SELECT * FROM users WHERE id = ?
      `).bind(userId).first();
    }
    
    // Generate JWT
    const jwtPayload = {
      userId: user.id,
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
    };
    
    const jwt = await signJWT(jwtPayload, c.env.JWT_SECRET);
    
    return c.json({
      success: true,
      jwt,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        defaultRole: user.default_role
      },
      eventId: result.event_id,
      isNewUser
    });
    
  } catch (error) {
    console.error('Error verifying magic link:', error);
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to verify token'
      }
    }, 500);
  }
});

// GET /api/auth/me
authRoutes.get('/me', async (c) => {
  try {
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
    
    // Get user from database
    const user = await c.env.DB.prepare(`
      SELECT * FROM users WHERE id = ?
    `).bind(payload.userId).first();
    
    if (!user) {
      return c.json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      }, 404);
    }
    
    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        jobTitle: user.job_title,
        company: user.company,
        phone: user.phone,
        photoUrl: user.photo_url,
        linkedinUrl: user.linkedin_url,
        twitterUrl: user.twitter_url,
        instagramUrl: user.instagram_url,
        websiteUrl: user.website_url,
        defaultRole: user.default_role
      }
    });
    
  } catch (error) {
    console.error('Error getting user:', error);
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get user'
      }
    }, 500);
  }
});
