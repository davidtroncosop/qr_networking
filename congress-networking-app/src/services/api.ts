import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants';
import type { ApiResponse, User } from '../types';

// Get JWT token from localStorage
function getToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
}

// Set JWT token in localStorage
function setToken(token: string): void {
  localStorage.setItem(STORAGE_KEYS.JWT_TOKEN, token);
}

// Remove JWT token from localStorage
export function clearToken(): void {
  localStorage.removeItem(STORAGE_KEYS.JWT_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER_DATA);
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Merge with any headers from options
  if (options.headers) {
    Object.assign(headers, options.headers);
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || {
          code: 'UNKNOWN_ERROR',
          message: 'An error occurred'
        }
      };
    }
    
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Failed to connect to server'
      }
    };
  }
}

// Auth API
export const authApi = {
  async requestMagicLink(email: string, eventId?: string): Promise<ApiResponse<{ token: string }>> {
    return apiRequest('/api/auth/request-magic-link', {
      method: 'POST',
      body: JSON.stringify({ email, eventId }),
    });
  },
  
  async verifyMagicLink(token: string): Promise<ApiResponse<{
    jwt: string;
    user: User;
    eventId?: string;
    isNewUser: boolean;
  }>> {
    const response = await apiRequest<{
      jwt: string;
      user: User;
      eventId?: string;
      isNewUser: boolean;
    }>('/api/auth/verify-magic-link', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
    
    if (response.success && response.data) {
      setToken(response.data.jwt);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.user));
    }
    
    return response;
  },
  
  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    return apiRequest('/api/auth/me');
  },
  
  logout() {
    clearToken();
  }
};

// User API
export const userApi = {
  async createUser(userData: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    return apiRequest('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  
  async getUser(userId: string): Promise<ApiResponse<{ user: User }>> {
    return apiRequest(`/api/users/${userId}`);
  },
  
  async updateUser(userId: string, userData: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    return apiRequest(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },
  
  async getInterests(userId: string): Promise<ApiResponse<{ interests: string[] }>> {
    return apiRequest(`/api/users/${userId}/interests`);
  },
  
  async updateInterests(userId: string, interests: string[]): Promise<ApiResponse<{ interests: string[] }>> {
    return apiRequest(`/api/users/${userId}/interests`, {
      method: 'PUT',
      body: JSON.stringify({ interests }),
    });
  },
};

// Event API
export const eventApi = {
  async createEvent(eventData: {
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    location?: string;
  }): Promise<ApiResponse<{ event: any }>> {
    return apiRequest('/api/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  },
  
  async getEvent(eventId: string): Promise<ApiResponse<{ event: any }>> {
    return apiRequest(`/api/events/${eventId}`);
  },
  
  async updateEvent(eventId: string, eventData: any): Promise<ApiResponse<{ event: any }>> {
    return apiRequest(`/api/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  },
  
  async getAttendees(eventId: string): Promise<ApiResponse<{ attendees: any[]; count: number }>> {
    return apiRequest(`/api/events/${eventId}/attendees`);
  },
  
  async registerToEvent(eventId: string): Promise<ApiResponse<{ message: string }>> {
    return apiRequest(`/api/events/${eventId}/register`, {
      method: 'POST',
    });
  },
};

// Export token management
export { getToken, setToken };
