-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Activities Table
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) DEFAULT 'workout',
  metrics JSONB DEFAULT '{}'::jsonb,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Friends Table
CREATE TABLE IF NOT EXISTS friends (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, friend_id)
);

-- Insert demo users (only if table is empty)
INSERT INTO users (first_name, last_name, email, password, role)
SELECT 'Admin', 'User', 'admin@example.com', '$2b$10$zPasXU1JqE9JKizY8vUmRuHtUzqzUOZLkL4ngIXjNJ8qN7rKwqGsW', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@example.com');

INSERT INTO users (first_name, last_name, email, password, role)
SELECT 'John', 'Doe', 'john.doe@example.com', '$2b$10$zPasXU1JqE9JKizY8vUmRuHtUzqzUOZLkL4ngIXjNJ8qN7rKwqGsW', 'user'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'john.doe@example.com');

INSERT INTO users (first_name, last_name, email, password, role)
SELECT 'Jane', 'Smith', 'jane.smith@example.com', '$2b$10$zPasXU1JqE9JKizY8vUmRuHtUzqzUOZLkL4ngIXjNJ8qN7rKwqGsW', 'user'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'jane.smith@example.com');
