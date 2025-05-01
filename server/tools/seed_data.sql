-- SQL for a posgresql database
-- Modified to check if tables exist before truncating
BEGIN;

-- First drop the functions if they exist to avoid errors on recreation
DROP FUNCTION IF EXISTS get_user_statistics;
DROP FUNCTION IF EXISTS get_global_statistics;
DROP VIEW IF EXISTS friend_view;
-- Disable foreign key checks temporarily 
SET CONSTRAINTS ALL DEFERRED;;

-- Clear existing data from tables only if they exist ors on recreation
DO $$FUNCTION IF EXISTS get_user_statistics;
BEGINFUNCTION IF EXISTS get_global_statistics;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'activity_likes') THEN
        EXECUTE 'TRUNCATE TABLE activity_likes CASCADE';
    END IF;INTS ALL DEFERRED;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'activity_comments') THEN
        EXECUTE 'TRUNCATE TABLE activity_comments CASCADE';
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'activity_likes') THEN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'activities') THEN
        EXECUTE 'TRUNCATE TABLE activities CASCADE';
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'activity_comments') THEN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'friends') THEN
        EXECUTE 'TRUNCATE TABLE friends CASCADE';
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'activities') THEN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
        EXECUTE 'TRUNCATE TABLE users CASCADE';
    END IF;
END $$;EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'friends') THEN
        EXECUTE 'TRUNCATE TABLE friends CASCADE';
-- Re-enable constraints for upcoming inserts
SET CONSTRAINTS ALL IMMEDIATE;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
-- Create the users table if it doesn't exist';
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,g inserts
    age INT NOT NULL,MMEDIATE;
    gender VARCHAR(50),
    email VARCHAR(255) UNIQUE NOT NULL, exist
    phone VARCHAR(50),ISTS users (
    birth_date DATE,Y KEY,
    image TEXT,VARCHAR(255) NOT NULL,
    password VARCHAR(255)) NOT NULL,
);  age INT NOT NULL,
    gender VARCHAR(50),
-- Add indexes for performance optimization if they don't exist
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_handle ON users(handle);
    image TEXT,
-- Sample data for users table with proper bcrypt hashes
-- All users have the password "password123"
INSERT INTO users (first_name, last_name, age, gender, email, phone, birth_date, image, password)
VALUES indexes for performance optimization if they don't exist
    ('John', 'Doe', 28, 'Male', 'john.doe@example.com', '555-123-4567', '1995-05-15', 'https://example.com/avatar1.jpg', '$2b$10$zPasXU1JqE9JKizY8vUmRuHtUzqzUOZLkL4ngIXjNJ8qN7rKwqGsW'),
    ('Jane', 'Smith', 24, 'Female', 'jane.smith@example.com', '555-987-6543', '1999-08-21', 'https://example.com/avatar2.jpg', '$2b$10$zPasXU1JqE9JKizY8vUmRuHtUzqzUOZLkL4ngIXjNJ8qN7rKwqGsW'),
    ('Michael', 'Brown', 32, 'Male', 'michael.brown@example.com', '555-456-7890', '1991-03-10', 'https://example.com/avatar3.jpg', '$2b$10$zPasXU1JqE9JKizY8vUmRuHtUzqzUOZLkL4ngIXjNJ8qN7rKwqGsW'),
    ('Emily', 'Johnson', 27, 'Female', 'emily.johnson@example.com', '555-234-5678', '1996-11-30', 'https://example.com/avatar4.jpg',  '$2b$10$zPasXU1JqE9JKizY8vUmRuHtUzqzUOZLkL4ngIXjNJ8qN7rKwqGsW'),
    ('David', 'Wilson', 35, 'Male', 'david.wilson@example.com', '555-876-5432', '1988-09-22', 'https://example.com/avatar5.jpg', '$2b$10$zPasXU1JqE9JKizY8vUmRuHtUzqzUOZLkL4ngIXjNJ8qN7rKwqGsW');
    id SERIAL PRIMARY KEY,
-- Add the friends table to the existing schemaCASCADE,
CREATE TABLE IF NOT EXISTS friends (d) ON DELETE CASCADE,
    id SERIAL PRIMARY KEY,ITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    friend_id INT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, friend_id) optimization
);EATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON friends(friend_id);
-- Add indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON friends(friend_id);
    id SERIAL PRIMARY KEY,
-- Verify users exist before inserting friendsON DELETE CASCADE,
DO $$itle VARCHAR(255) NOT NULL,
BEGINescription TEXT NOT NULL,
  IF (SELECT COUNT(*) FROM users) = 5 THEN
    -- Sample data for friends tableFAULT CURRENT_TIMESTAMP,
    INSERT INTO friends (user_id, friend_id)
    VALUESINT DEFAULT 0,
        (1, 2), -- John is friends with Jane
        (1, 3), -- John is friends with Michael
        (2, 1), -- Jane is friends with John (reciprocal)IMESTAMP,
        (2, 4), -- Jane is friends with EmilyLT CURRENT_TIMESTAMP
        (3, 5), -- Michael is friends with David
        (4, 5), -- Emily is friends with David
        (5, 1); -- David is friends with John
  ELSE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
    RAISE EXCEPTION 'User table not properly populated. Expected 5 users, found %.', (SELECT COUNT(*) FROM users);
  END IF;DEX IF NOT EXISTS idx_activities_date ON activities(date);
END $$;
-- Create activity_comments table to track individual comments
-- Create activities table if it doesn't exist
CREATE TABLE IF NOT EXISTS activities (
    id SERIAL PRIMARY KEY,LL REFERENCES activities(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    type VARCHAR(100) NOT NULL,IME ZONE DEFAULT CURRENT_TIMESTAMP
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metrics JSONB NOT NULL,
    likes INT DEFAULT 0,ity_comments
    comments INT DEFAULT 0,idx_activity_comments_activity_id ON activity_comments(activity_id);
    image TEXT, NOT EXISTS idx_activity_comments_user_id ON activity_comments(user_id);
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);EATE TABLE IF NOT EXISTS activity_likes (
    id SERIAL PRIMARY KEY,
-- Add indexes for performance optimizationivities(id) ON DELETE CASCADE,
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(date);
);
-- Sample data for activities table
INSERT INTO activities (user_id, title, description, type, date, metrics, likes, comments, image)
VALUES INDEX IF NOT EXISTS idx_activity_likes_activity_id ON activity_likes(activity_id);
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
SELECT * FROM activities;
-- Create activity_comments table to track individual comments
CREATE TABLE IF NOT EXISTS activity_comments (
    id SERIAL PRIMARY KEY,ments;
    activity_id INT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,es;
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Function to get user statistics
-- Add indexes for activity_commentsstatistics(user_id_param INT)
CREATE INDEX IF NOT EXISTS idx_activity_comments_activity_id ON activity_comments(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_comments_user_id ON activity_comments(user_id);
    result JSON;
-- Sample data for activity_comments table
INSERT INTO activity_comments (activity_id, user_id, comment)
VALUES  json_build_object(
    (1, 2, 'Great pace! Keep it up!'),.*),
    (1, 3, 'Nice route choice'),LESCE(SUM((a.metrics->>'distance')::numeric), 0),
    (1, 5, 'What shoes are you using?'),M((a.metrics->>'duration')::numeric), 0),
    (2, 1, 'Looks relaxing!'),OALESCE(SUM((a.metrics->>'calories')::numeric), 0),
    (2, 4, 'What yoga mat do you recommend?'),
    (3, 1, 'Beast mode!'),n_object_agg(type, count)
    (3, 2, 'New PR! Congrats'),
    (3, 4, 'What is your training program?'),count
    (3, 5, 'Impressive form'),ities
    (4, 2, 'Beautiful views!'),id = user_id_param
    (4, 3, 'What bike do you ride?'),
    (5, 1, 'Early bird gets the worm!'),
    (5, 4, 'How crowded was the pool?');
            'friendCount', (
-- Create activity_likes table to track who liked what
CREATE TABLE IF NOT EXISTS activity_likes (
    id SERIAL PRIMARY KEY,_id = user_id_param
    activity_id INT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(activity_id, user_id)
);              WHERE user_id = user_id_param
            ),
-- Add indexes for activity_likesd', (
CREATE INDEX IF NOT EXISTS idx_activity_likes_activity_id ON activity_likes(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_likes_user_id ON activity_likes(user_id);
                WHERE user_id = user_id_param
-- Sample data for activity_likes table
INSERT INTO activity_likes (activity_id, user_id)
VALUESOM activities a
    (1, 2), (1, 3), (1, 4), (1, 5), -- 4 people liked activity 1
    (2, 1), (2, 3), (2, 4), (2, 5), -- 4 people liked activity 2
    (3, 1), (3, 2), (3, 4), (3, 5), -- 4 people liked activity 3
    (4, 1), (4, 2), (4, 3), (4, 5), -- 4 people liked activity 4
    (5, 1), (5, 2), (5, 3), (5, 4); -- 4 people liked activity 5

-- Create statistics functions for the application
CREATE OR REPLACE FUNCTION get_global_statistics()
-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_statistics(user_id_param INT)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN   json_build_object(
    SELECT  'totalUsers', (SELECT COUNT(*) FROM users),
        json_build_object(es', (SELECT COUNT(*) FROM activities),
            'totalActivities', COUNT(a.*),
            'totalDistance', COALESCE(SUM((a.metrics->>'distance')::numeric), 0),
            'totalDuration', COALESCE(SUM((a.metrics->>'duration')::numeric), 0),
            'totalCalories', COALESCE(SUM((a.metrics->>'calories')::numeric), 0),
            'activitiesByType', (
                SELECT json_object_agg(type, count)ation')::numeric), 0)
                FROM (ctivities
                    SELECT type, COUNT(*) as count
                    FROM activities
                    WHERE user_id = user_id_paramalories')::numeric), 0)
                    GROUP BY type
                ) as type_counts
            ),ctivitiesByType', (
            'friendCount', (object_agg(type, count)
                SELECT COUNT(*) 
                FROM friendsype, COUNT(*) as count
                WHERE user_id = user_id_param
            ),      GROUP BY type
            'totalLikesReceived', (
                SELECT COALESCE(SUM(likes), 0)
                FROM activities (
                WHERE user_id = user_id_param
            ),
            'totalCommentsReceived', (
                SELECT COALESCE(SUM(comments), 0)es
                FROM activities
                WHERE user_id = user_id_param
            )   SELECT COUNT(*) FROM activity_comments
        ) INTO result
    FROM activities a;
    WHERE a.user_id = user_id_param;
    RETURN result;
    RETURN COALESCE(result, '{}'::json);
END;ANGUAGE plpgsql;
$$ LANGUAGE plpgsql;
COMMIT;
-- Function to get global statistics
CREATE OR REPLACE FUNCTION get_global_statistics()RETURNS JSON AS $$DECLARE    result JSON;BEGIN    SELECT         json_build_object(            'totalUsers', (SELECT COUNT(*) FROM users),            'totalActivities', (SELECT COUNT(*) FROM activities),            'totalDistance', (                SELECT COALESCE(SUM((metrics->>'distance')::numeric), 0)                FROM activities            ),            'totalDuration', (                SELECT COALESCE(SUM((metrics->>'duration')::numeric), 0)                FROM activities            ),            'totalCalories', (                SELECT COALESCE(SUM((metrics->>'calories')::numeric), 0)                FROM activities            ),            'activitiesByType', (                SELECT json_object_agg(type, count)                FROM (                    SELECT type, COUNT(*) as count                    FROM activities                    GROUP BY type                ) as type_counts            ),            'totalFriendships', (                SELECT COUNT(*) FROM friends            ),            'totalLikes', (                SELECT COUNT(*) FROM activity_likes            ),            'totalComments', (                SELECT COUNT(*) FROM activity_comments            )        ) INTO result;        RETURN result;END;$$ LANGUAGE plpgsql;-- Create views to display actual table data-- View for users
CREATE OR REPLACE VIEW user_view AS
SELECT 
    id, 
    first_name, 
    last_name, 
    age, 
    gender, 
    email, 
    phone, 
    birth_date, 
    image,
    created_at
FROM users;

-- View for activities with user information
CREATE OR REPLACE VIEW activity_view AS
SELECT 
    a.id,
    a.title,
    a.description,
    a.type,
    a.date,
    a.metrics,
    a.likes,
    a.comments,
    a.image,
    a.created_at,
    a.updated_at,
    u.first_name || ' ' || u.last_name AS user_name,
    u.id AS user_id,
    u.image AS user_image
FROM activities a
JOIN users u ON a.user_id = u.id;

-- View for friends with user information
CREATE OR REPLACE VIEW friend_view AS
SELECT 
    f.id,
    f.user_id,
    f.friend_id,
    f.created_at,
    u1.first_name || ' ' || u1.last_name AS user_name,
    u2.first_name || ' ' || u2.last_name AS friend_name,
    u1.image AS user_image,
    u2.image AS friend_image
FROM friends f
JOIN users u1 ON f.user_id = u1.id
JOIN users u2 ON f.friend_id = u2.id;

-- View for comments with user and activity information
CREATE OR REPLACE VIEW comment_view AS
SELECT 
    c.id,
    c.activity_id,
    c.user_id,
    c.comment,
    c.created_at,
    c.updated_at,
    u.first_name || ' ' || u.last_name AS user_name,
    u.image AS user_image,
    a.title AS activity_title
FROM activity_comments c
JOIN users u ON c.user_id = u.id
JOIN activities a ON c.activity_id = a.id;

-- View for likes with user and activity information
CREATE OR REPLACE VIEW like_view AS
SELECT 
    l.id,
    l.activity_id,
    l.user_id,
    l.created_at,
    u.first_name || ' ' || u.last_name AS user_name,
    u.image AS user_image,
    a.title AS activity_title
FROM activity_likes l
JOIN users u ON l.user_id = u.id
JOIN activities a ON l.activity_id = a.id;

-- Function to get activity feed for a user
CREATE OR REPLACE FUNCTION get_user_feed(user_id_param INT, limit_param INT DEFAULT 10)
RETURNS TABLE (
    id INT,
    title VARCHAR(255),
    description TEXT,
    type VARCHAR(100),
    date TIMESTAMP WITH TIME ZONE,
    metrics JSONB,
    likes INT,
    comments INT,
    image TEXT,
    user_name TEXT,
    user_id INT,
    user_image TEXT,
    is_liked BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.title,
        a.description,
        a.type,
        a.date,
        a.metrics,
        a.likes,
        a.comments,
        a.image,
        u.first_name || ' ' || u.last_name AS user_name,
        u.id AS user_id,
        u.image AS user_image,
        EXISTS(SELECT 1 FROM activity_likes WHERE activity_id = a.id AND user_id = user_id_param) AS is_liked
    FROM activities a
    JOIN users u ON a.user_id = u.id
    WHERE a.user_id = user_id_param OR a.user_id IN (
        SELECT friend_id FROM friends WHERE user_id = user_id_param
    )
    ORDER BY a.date DESC
    LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;

COMMIT;

