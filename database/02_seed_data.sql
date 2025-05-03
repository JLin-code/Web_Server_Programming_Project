-- Seed data for development and testing
-- This SQL file will insert sample data into the database

-- Insert sample demo users
INSERT INTO users (username, password_hash, name, role)
VALUES 
    ('admin@example.com', '$2a$10$0HtQM0qANcGs5PJvqFake.3rICGaRzyB8a2D3Q1ywTBnK/Yyakugy', 'Admin User', 'admin'),  -- password: adminpass
    ('user@example.com', '$2a$10$PlbPO7GDpYCxoVs6bHqGNO28vkXYm1J7XxRmKgq9.rGrNEMSy78y6', 'Regular User', 'user'),  -- password: userpass
    ('demo@example.com', '$2a$10$UYoEVfpZVRidy1CYysd.ZuHCrwBA3IWtCQ5IlliK5j/wNTPi5i3bu', 'Demo User', 'user');     -- password: demopass

-- Insert sample activities
-- These will be added after users are created
INSERT INTO activities (user_id, title, description, type, date)
VALUES
    (1, 'Morning Run', 'Quick 5k around the park', 'running', CURRENT_DATE),
    (1, 'Weightlifting', 'Upper body day', 'strength', CURRENT_DATE - INTERVAL '1 day'),
    (2, 'Yoga Session', '1-hour vinyasa flow', 'yoga', CURRENT_DATE - INTERVAL '2 days'),
    (2, 'Swimming', '30 laps in the pool', 'swimming', CURRENT_DATE - INTERVAL '3 days'),
    (3, 'Cycling', '20km ride through the mountains', 'cycling', CURRENT_DATE - INTERVAL '1 day');

-- Insert sample comments
INSERT INTO activity_comments (activity_id, user_id, comment)
VALUES
    (1, 2, 'Great pace!'),
    (1, 3, 'Which park did you run in?'),
    (2, 3, 'What exercises did you do?'),
    (3, 1, 'Yoga is great for recovery'),
    (4, 1, 'I need to get back into swimming');

-- Insert sample likes
INSERT INTO activity_likes (activity_id, user_id)
VALUES
    (1, 2),
    (1, 3),
    (2, 3),
    (3, 1),
    (4, 1),
    (5, 2);

-- Insert sample friend connections
INSERT INTO friends (user_id, friend_id)
VALUES
    (1, 2),
    (1, 3),
    (2, 3);
