import { Hono } from 'hono';
import type { Env } from '../index';
import { verifyJWT } from '../utils/jwt';
import { generateUUID } from '../utils/crypto';

export const userRoutes = new Hono<{ Bindings: Env }>();

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

// POST /api/users - Create or update user profile
userRoutes.post('/', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const data = await c.req.json();
    
    // Validate required fields
    if (!data.name || !data.name.trim()) {
      return c.json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Name is required'
        }
      }, 400);
    }
    
    if (!data.phone || !data.phone.trim()) {
      return c.json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Phone number is required'
        }
      }, 400);
    }
    
    // Validate phone format (basic)
    const phoneRegex = /^[0-9+\-\s()]{8,}$/;
    if (!phoneRegex.test(data.phone)) {
      return c.json({
        success: false,
        error: {
          code: 'INVALID_PHONE',
          message: 'Invalid phone number format'
        }
      }, 400);
    }
    
    const now = Date.now();
    
    // Update user
    await c.env.DB.prepare(`
      UPDATE users 
      SET name = ?, 
          phone = ?,
          job_title = ?,
          company = ?,
          photo_url = ?,
          linkedin_url = ?,
          twitter_url = ?,
          instagram_url = ?,
          website_url = ?,
          updated_at = ?
      WHERE id = ?
    `).bind(
      data.name,
      data.phone,
      data.jobTitle || null,
      data.company || null,
      data.photoUrl || null,
      data.linkedinUrl || null,
      data.twitterUrl || null,
      data.instagramUrl || null,
      data.websiteUrl || null,
      now,
      userId
    ).run();
    
    // Get updated user
    const user = await c.env.DB.prepare(`
      SELECT * FROM users WHERE id = ?
    `).bind(userId).first();
    
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
        phone: user.phone,
        jobTitle: user.job_title,
        company: user.company,
        photoUrl: user.photo_url,
        linkedinUrl: user.linkedin_url,
        twitterUrl: user.twitter_url,
        instagramUrl: user.instagram_url,
        websiteUrl: user.website_url,
        defaultRole: user.default_role
      }
    });
    
  } catch (error) {
    console.error('Error updating user:', error);
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update user'
      }
    }, 500);
  }
});

// GET /api/users/:userId - Get user profile
userRoutes.get('/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    const user = await c.env.DB.prepare(`
      SELECT * FROM users WHERE id = ?
    `).bind(userId).first();
    
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
        phone: user.phone,
        jobTitle: user.job_title,
        company: user.company,
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

// PUT /api/users/:userId - Update user profile
userRoutes.put('/:userId', requireAuth, async (c) => {
  try {
    const userId = c.req.param('userId');
    const authUserId = c.get('userId');
    
    // Check if user is updating their own profile
    if (userId !== authUserId) {
      return c.json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only update your own profile'
        }
      }, 403);
    }
    
    const data = await c.req.json();
    const now = Date.now();
    
    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    
    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.phone !== undefined) {
      // Validate phone
      const phoneRegex = /^[0-9+\-\s()]{8,}$/;
      if (!phoneRegex.test(data.phone)) {
        return c.json({
          success: false,
          error: {
            code: 'INVALID_PHONE',
            message: 'Invalid phone number format'
          }
        }, 400);
      }
      updates.push('phone = ?');
      values.push(data.phone);
    }
    if (data.jobTitle !== undefined) {
      updates.push('job_title = ?');
      values.push(data.jobTitle || null);
    }
    if (data.company !== undefined) {
      updates.push('company = ?');
      values.push(data.company || null);
    }
    if (data.photoUrl !== undefined) {
      updates.push('photo_url = ?');
      values.push(data.photoUrl || null);
    }
    if (data.linkedinUrl !== undefined) {
      updates.push('linkedin_url = ?');
      values.push(data.linkedinUrl || null);
    }
    if (data.twitterUrl !== undefined) {
      updates.push('twitter_url = ?');
      values.push(data.twitterUrl || null);
    }
    if (data.instagramUrl !== undefined) {
      updates.push('instagram_url = ?');
      values.push(data.instagramUrl || null);
    }
    if (data.websiteUrl !== undefined) {
      updates.push('website_url = ?');
      values.push(data.websiteUrl || null);
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
    values.push(userId);
    
    await c.env.DB.prepare(`
      UPDATE users SET ${updates.join(', ')} WHERE id = ?
    `).bind(...values).run();
    
    // Get updated user
    const user = await c.env.DB.prepare(`
      SELECT * FROM users WHERE id = ?
    `).bind(userId).first();
    
    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        jobTitle: user.job_title,
        company: user.company,
        photoUrl: user.photo_url,
        linkedinUrl: user.linkedin_url,
        twitterUrl: user.twitter_url,
        instagramUrl: user.instagram_url,
        websiteUrl: user.website_url,
        defaultRole: user.default_role
      }
    });
    
  } catch (error) {
    console.error('Error updating user:', error);
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update user'
      }
    }, 500);
  }
});

// GET /api/users/:userId/interests - Get user interests
userRoutes.get('/:userId/interests', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    const results = await c.env.DB.prepare(`
      SELECT interest FROM user_interests WHERE user_id = ?
    `).bind(userId).all();
    
    const interests = results.results?.map((r: any) => r.interest) || [];
    
    return c.json({
      success: true,
      interests
    });
    
  } catch (error) {
    console.error('Error getting interests:', error);
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get interests'
      }
    }, 500);
  }
});

// PUT /api/users/:userId/interests - Update user interests
userRoutes.put('/:userId/interests', requireAuth, async (c) => {
  try {
    const userId = c.req.param('userId');
    const authUserId = c.get('userId');
    
    if (userId !== authUserId) {
      return c.json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only update your own interests'
        }
      }, 403);
    }
    
    const { interests } = await c.req.json();
    
    if (!Array.isArray(interests)) {
      return c.json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Interests must be an array'
        }
      }, 400);
    }
    
    // Delete existing interests
    await c.env.DB.prepare(`
      DELETE FROM user_interests WHERE user_id = ?
    `).bind(userId).run();
    
    // Insert new interests
    const now = Date.now();
    for (const interest of interests) {
      if (interest && interest.trim()) {
        const id = generateUUID();
        await c.env.DB.prepare(`
          INSERT INTO user_interests (id, user_id, interest, created_at)
          VALUES (?, ?, ?, ?)
        `).bind(id, userId, interest.trim(), now).run();
      }
    }
    
    return c.json({
      success: true,
      interests
    });
    
  } catch (error) {
    console.error('Error updating interests:', error);
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update interests'
      }
    }, 500);
  }
});
