-- SQL for a posgresql database
-- Create the users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    age INT NOT NULL,
    gender VARCHAR(50),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    birth_date DATE,
    image TEXT,
    university VARCHAR(255),
    role VARCHAR(50) NOT NULL,
    handle VARCHAR(100),
    password VARCHAR(255)
);

-- Add indexes for performance optimization if they don't exist
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_handle ON users(handle);

-- Add the friends table to the existing schema
CREATE TABLE IF NOT EXISTS friends (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    friend_id INT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, friend_id)
);

-- Add indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON friends(friend_id);

-- Create activities table if it doesn't exist
CREATE TABLE IF NOT EXISTS activities (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(100) NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metrics JSONB NOT NULL,
    likes INT DEFAULT 0,
    comments INT DEFAULT 0,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(date);

-- Create activity_comments table to track individual comments
CREATE TABLE IF NOT EXISTS activity_comments (
    id SERIAL PRIMARY KEY,
    activity_id INT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for activity_comments
CREATE INDEX IF NOT EXISTS idx_activity_comments_activity_id ON activity_comments(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_comments_user_id ON activity_comments(user_id);

-- Create activity_likes table to track who liked what
CREATE TABLE IF NOT EXISTS activity_likes (
    id SERIAL PRIMARY KEY,
    activity_id INT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(activity_id, user_id)
);

-- Add indexes for activity_likes
CREATE INDEX IF NOT EXISTS idx_activity_likes_activity_id ON activity_likes(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_likes_user_id ON activity_likes(user_id);

-- Clear existing data from tables to avoid duplicate entries
TRUNCATE TABLE activity_likes CASCADE;
TRUNCATE TABLE activity_comments CASCADE;
TRUNCATE TABLE activities CASCADE;
TRUNCATE TABLE friends CASCADE;
TRUNCATE TABLE users CASCADE;

-- Sample data for users table with proper bcrypt hashes
-- All users have the password "password123"
INSERT INTO users (first_name, last_name, age, gender, email, phone, birth_date, image, university, role, handle, password)
VALUES
    ('John', 'Doe', 28, 'Male', 'john.doe@example.com', '555-123-4567', '1995-05-15', 'https://example.com/avatar1.jpg', 'State University', 'user', 'johndoe', '$2b$10$zPasXU1JqE9JKizY8vUmRuHtUzqzUOZLkL4ngIXjNJ8qN7rKwqGsW'),
    ('Jane', 'Smith', 24, 'Female', 'jane.smith@example.com', '555-987-6543', '1999-08-21', 'https://example.com/avatar2.jpg', 'Tech Institute', 'user', 'janesmith', '$2b$10$zPasXU1JqE9JKizY8vUmRuHtUzqzUOZLkL4ngIXjNJ8qN7rKwqGsW'),
    ('Michael', 'Brown', 32, 'Male', 'michael.brown@example.com', '555-456-7890', '1991-03-10', 'https://example.com/avatar3.jpg', 'City College', 'admin', 'mikebrown', '$2b$10$zPasXU1JqE9JKizY8vUmRuHtUzqzUOZLkL4ngIXjNJ8qN7rKwqGsW'),
    ('Emily', 'Johnson', 27, 'Female', 'emily.johnson@example.com', '555-234-5678', '1996-11-30', 'https://example.com/avatar4.jpg', 'National University', 'user', 'emilyjohn', '$2b$10$zPasXU1JqE9JKizY8vUmRuHtUzqzUOZLkL4ngIXjNJ8qN7rKwqGsW'),
    ('David', 'Wilson', 35, 'Male', 'david.wilson@example.com', '555-876-5432', '1988-09-22', 'https://example.com/avatar5.jpg', 'Liberal Arts College', 'user', 'davewilson', '$2b$10$zPasXU1JqE9JKizY8vUmRuHtUzqzUOZLkL4ngIXjNJ8qN7rKwqGsW');

-- Sample data for friends table
INSERT INTO friends (user_id, friend_id)
VALUES
    (1, 2), -- John is friends with Jane
    (1, 3), -- John is friends with Michael
    (2, 1), -- Jane is friends with John (reciprocal)
    (2, 4), -- Jane is friends with Emily
    (3, 5), -- Michael is friends with David
    (4, 5), -- Emily is friends with David
    (5, 1); -- David is friends with John

-- Sample data for activities table
INSERT INTO activities (user_id, title, description, type, date, metrics, likes, comments, image)
VALUES
    (1, 'Morning Run', 'Great 5k run through the park', 'running', '2023-06-10T08:30:00Z', 
        '{"distance": 5, "duration": 25, "pace": "5:00", "calories": 350}'::jsonb, 5, 3, 'https://example.com/run1.jpg'),
    (2, 'Yoga Session', 'Relaxing evening yoga session', 'yoga', '2023-06-09T18:00:00Z', 
        '{"duration": 45, "calories": 180, "poses": 12}'::jsonb, 8, 2, 'https://example.com/yoga1.jpg'),
    (3, 'Weightlifting', 'New personal record on bench press', 'strength', '2023-06-08T14:15:00Z', 
        '{"sets": 5, "reps": 5, "weight": 225, "calories": 400}'::jsonb, 12, 5, 'https://example.com/lift1.jpg'),
    (4, 'Cycling Trip', 'Weekend ride along the coast', 'cycling', '2023-06-11T10:00:00Z', 
        '{"distance": 30, "duration": 90, "speed": 20, "elevation": 450, "calories": 800}'::jsonb, 15, 7, 'https://example.com/cycle1.jpg'),
    (5, 'Swimming', 'Lap swimming at the community pool', 'swimming', '2023-06-07T07:00:00Z', 
        '{"distance": 2, "duration": 45, "strokes": 1200, "calories": 500}'::jsonb, 6, 3, 'https://example.com/swim1.jpg');

-- Sample data for activity_comments table
INSERT INTO activity_comments (activity_id, user_id, comment)
VALUES
    (1, 2, 'Great pace! Keep it up!'),
    (1, 3, 'Nice route choice'),
    (1, 5, 'What shoes are you using?'),
    (2, 1, 'Looks relaxing!'),
    (2, 4, 'What yoga mat do you recommend?'),
    (3, 1, 'Beast mode!'),
    (3, 2, 'New PR! Congrats'),
    (3, 4, 'What is your training program?'),
    (3, 5, 'Impressive form'),
    (4, 2, 'Beautiful views!'),
    (4, 3, 'What bike do you ride?'),
    (5, 1, 'Early bird gets the worm!'),
    (5, 4, 'How crowded was the pool?');

-- Sample data for activity_likes table
INSERT INTO activity_likes (activity_id, user_id)
VALUES
    (1, 2), (1, 3), (1, 4), (1, 5), -- 4 people liked activity 1
    (2, 1), (2, 3), (2, 4), (2, 5), -- 4 people liked activity 2
    (3, 1), (3, 2), (3, 4), (3, 5), -- 4 people liked activity 3
    (4, 1), (4, 2), (4, 3), (4, 5), -- 4 people liked activity 4
    (5, 1), (5, 2), (5, 3), (5, 4); -- 4 people liked activity 5

