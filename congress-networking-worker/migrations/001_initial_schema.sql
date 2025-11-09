-- Initial database schema for Congress Networking App

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  job_title TEXT,
  company TEXT,
  phone TEXT,
  photo_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  instagram_url TEXT,
  website_url TEXT,
  default_role TEXT DEFAULT 'attendee',
  auth_provider TEXT DEFAULT 'email',
  linkedin_id TEXT UNIQUE,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_linkedin_id ON users(linkedin_id);

-- Auth tokens table
CREATE TABLE IF NOT EXISTS auth_tokens (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  event_id TEXT,
  intended_role TEXT,
  expires_at INTEGER NOT NULL,
  used INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tokens_token ON auth_tokens(token);
CREATE INDEX IF NOT EXISTS idx_tokens_email ON auth_tokens(email);
CREATE INDEX IF NOT EXISTS idx_tokens_expires ON auth_tokens(expires_at);

-- User interests table
CREATE TABLE IF NOT EXISTS user_interests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  interest TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, interest)
);

CREATE INDEX IF NOT EXISTS idx_user_interests_user ON user_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interests_interest ON user_interests(interest);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_date INTEGER NOT NULL,
  end_date INTEGER NOT NULL,
  location TEXT,
  organizer_id TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (organizer_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_dates ON events(start_date, end_date);

-- Event registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL,
  registered_at INTEGER NOT NULL,
  FOREIGN KEY (event_id) REFERENCES events(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_registrations_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_role ON event_registrations(event_id, role);

-- Connections table
CREATE TABLE IF NOT EXISTS connections (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  user_id_1 TEXT NOT NULL,
  user_id_2 TEXT NOT NULL,
  connected_at INTEGER NOT NULL,
  FOREIGN KEY (event_id) REFERENCES events(id),
  FOREIGN KEY (user_id_1) REFERENCES users(id),
  FOREIGN KEY (user_id_2) REFERENCES users(id),
  UNIQUE(event_id, user_id_1, user_id_2)
);

CREATE INDEX IF NOT EXISTS idx_connections_event ON connections(event_id);
CREATE INDEX IF NOT EXISTS idx_connections_user1 ON connections(user_id_1);
CREATE INDEX IF NOT EXISTS idx_connections_user2 ON connections(user_id_2);
CREATE INDEX IF NOT EXISTS idx_connections_time ON connections(connected_at);
