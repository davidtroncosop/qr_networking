// User types
export interface User {
  id: string;
  email: string;
  name: string;
  job_title?: string;
  company?: string;
  phone?: string;
  photo_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  website_url?: string;
  default_role: 'attendee' | 'organizer';
  auth_provider: 'email' | 'linkedin';
  linkedin_id?: string;
  created_at: number;
  updated_at: number;
}

// Event types
export interface Event {
  id: string;
  name: string;
  description?: string;
  start_date: number;
  end_date: number;
  location?: string;
  organizer_id: string;
  is_active: number; // SQLite boolean (0/1)
  created_at: number;
  updated_at: number;
}

// Connection types
export interface Connection {
  id: string;
  event_id: string;
  user_id_1: string;
  user_id_2: string;
  connected_at: number;
}

// Auth token types
export interface AuthToken {
  id: string;
  email: string;
  token: string;
  event_id?: string;
  intended_role?: string;
  expires_at: number;
  used: number; // SQLite boolean (0/1)
  created_at: number;
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  email: string;
  exp: number;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}
