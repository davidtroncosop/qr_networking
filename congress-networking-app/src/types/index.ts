// User types
export interface User {
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

// Event types
export interface Event {
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

// Connection types
export interface Connection {
  id: string;
  eventId: string;
  userId1: string;
  userId2: string;
  connectedAt: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}
