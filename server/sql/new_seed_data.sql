-- New SQL schema and functions for fitness tracker app with Supabase

-- Drop existing tables if they exist
DROP TABLE IF EXISTS activity_likes CASCADE;
DROP TABLE IF EXISTS activity_comments CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS friends CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table with Supabase auth compatibility and profile picture
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(100) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    profile_picture_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_sign_in TIMESTAMP WITH TIME ZONE
);

-- Create activities table with image
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    image_url TEXT,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create activity_comments table
CREATE TABLE activity_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create activity_likes table
CREATE TABLE activity_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (activity_id, user_id)
);

-- Create friends table
CREATE TABLE friends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, friend_id)
);

-- Create indexes for better performance
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_date ON activities(date);
CREATE INDEX idx_activity_comments_activity_id ON activity_comments(activity_id);
CREATE INDEX idx_activity_likes_activity_id ON activity_likes(activity_id);
CREATE INDEX idx_friends_user_id ON friends(user_id);
CREATE INDEX idx_friends_friend_id ON friends(friend_id);

-- Drop existing functions before recreating them to avoid return type conflicts
DROP FUNCTION IF EXISTS increment_comment_count(UUID);
DROP FUNCTION IF EXISTS increment_like_count(UUID);
DROP FUNCTION IF EXISTS get_user_statistics(UUID);
DROP FUNCTION IF EXISTS get_user_activity_by_period(UUID, TEXT);
DROP FUNCTION IF EXISTS get_user_statistics_with_periods(UUID);
DROP FUNCTION IF EXISTS get_global_statistics();
DROP FUNCTION IF EXISTS get_global_statistics_with_periods();
DROP FUNCTION IF EXISTS exec_sql(text);

-- Function to increment comment count on activity
CREATE OR REPLACE FUNCTION increment_comment_count(act_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE activities
    SET comments = comments + 1
    WHERE id = act_id;
END;
$$;

-- Function to increment like count on activity
CREATE OR REPLACE FUNCTION increment_like_count(act_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE activities
    SET likes = likes + 1
    WHERE id = act_id;
END;
$$;

-- Function to get user activity statistics
CREATE OR REPLACE FUNCTION get_user_statistics(user_id_param UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
BEGIN
    -- Get various counts and statistics
    SELECT jsonb_build_object(
        'total_activities', (SELECT COUNT(*) FROM activities WHERE user_id = user_id_param),
        'total_likes_received', (SELECT COALESCE(SUM(likes), 0) FROM activities WHERE user_id = user_id_param),
        'total_comments_received', (SELECT COALESCE(SUM(comments), 0) FROM activities WHERE user_id = user_id_param),
        'total_likes_given', (SELECT COUNT(*) FROM activity_likes WHERE user_id = user_id_param),
        'total_comments_made', (SELECT COUNT(*) FROM activity_comments WHERE user_id = user_id_param),
        'friends_count', (SELECT COUNT(*) FROM friends WHERE user_id = user_id_param),
        'most_active_activity_type', (
            SELECT type FROM activities 
            WHERE user_id = user_id_param 
            GROUP BY type 
            ORDER BY COUNT(*) DESC 
            LIMIT 1
        ),
        'activity_type_counts', (
            SELECT jsonb_object_agg(type, count) FROM (
                SELECT type, COUNT(*) as count 
                FROM activities 
                WHERE user_id = user_id_param 
                GROUP BY type
            ) as type_counts
        ),
        'latest_activity_date', (
            SELECT date FROM activities 
            WHERE user_id = user_id_param 
            ORDER BY date DESC 
            LIMIT 1
        )
    ) INTO result;

    RETURN result;
END;
$$;

-- Function to get user activity statistics by time period
CREATE OR REPLACE FUNCTION get_user_activity_by_period(
    user_id_param UUID,
    period_filter TEXT -- 'today', 'week', 'month', 'all'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
    date_filter DATE;
BEGIN
    -- Set date filter based on period parameter
    IF period_filter = 'today' THEN
        date_filter := CURRENT_DATE;
    ELSIF period_filter = 'week' THEN
        date_filter := CURRENT_DATE - INTERVAL '7 days';
    ELSIF period_filter = 'month' THEN
        date_filter := CURRENT_DATE - INTERVAL '30 days';
    ELSE
        date_filter := NULL; -- 'all' time, no date filter
    END IF;
    
    -- Get various counts and statistics with date filter
    SELECT jsonb_build_object(
        'period', period_filter,
        'total_activities', (
            SELECT COUNT(*) FROM activities 
            WHERE user_id = user_id_param
            AND (date_filter IS NULL OR date >= date_filter)
        ),
        'total_likes_received', (
            SELECT COALESCE(SUM(likes), 0) FROM activities 
            WHERE user_id = user_id_param
            AND (date_filter IS NULL OR date >= date_filter)
        ),
        'total_comments_received', (
            SELECT COALESCE(SUM(comments), 0) FROM activities 
            WHERE user_id = user_id_param
            AND (date_filter IS NULL OR date >= date_filter)
        ),
        'total_likes_given', (
            SELECT COUNT(*) FROM activity_likes al
            JOIN activities a ON al.activity_id = a.id
            WHERE al.user_id = user_id_param
            AND (date_filter IS NULL OR a.date >= date_filter)
        ),
        'total_comments_made', (
            SELECT COUNT(*) FROM activity_comments ac
            JOIN activities a ON ac.activity_id = a.id
            WHERE ac.user_id = user_id_param
            AND (date_filter IS NULL OR a.date >= date_filter)
        ),
        'activity_type_counts', (
            SELECT jsonb_object_agg(type, count) FROM (
                SELECT type, COUNT(*) as count 
                FROM activities 
                WHERE user_id = user_id_param 
                AND (date_filter IS NULL OR date >= date_filter)
                GROUP BY type
            ) as type_counts
        )
    ) INTO result;

    RETURN result;
END;
$$;

-- Function to get all period statistics for a user in one call
CREATE OR REPLACE FUNCTION get_user_statistics_with_periods(user_id_param UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
    user_info JSONB;
BEGIN
    -- Get basic user info
    SELECT jsonb_build_object(
        'id', u.id,
        'name', u.first_name || ' ' || u.last_name,
        'email', u.email,
        'role', u.role,
        'friends_count', (SELECT COUNT(*) FROM friends WHERE user_id = user_id_param)
    )
    INTO user_info
    FROM users u
    WHERE u.id = user_id_param;
    
    -- Get statistics for all time periods
    SELECT jsonb_build_object(
        'user', user_info,
        'today', get_user_activity_by_period(user_id_param, 'today'),
        'week', get_user_activity_by_period(user_id_param, 'week'),
        'month', get_user_activity_by_period(user_id_param, 'month'),
        'all_time', get_user_activity_by_period(user_id_param, 'all')
    ) INTO result;

    RETURN result;
END;
$$;

-- Function to get global platform statistics
CREATE OR REPLACE FUNCTION get_global_statistics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
BEGIN
    -- Get various global counts and statistics
    SELECT jsonb_build_object(
        'total_users', (SELECT COUNT(*) FROM users),
        'total_activities', (SELECT COUNT(*) FROM activities),
        'total_comments', (SELECT COUNT(*) FROM activity_comments),
        'total_likes', (SELECT COUNT(*) FROM activity_likes),
        'most_popular_activity_type', (
            SELECT type FROM activities 
            GROUP BY type 
            ORDER BY COUNT(*) DESC 
            LIMIT 1
        ),
        'most_active_user', (
            SELECT jsonb_build_object(
                'id', u.id,
                'name', u.first_name || ' ' || u.last_name,
                'count', activity_count
            )
            FROM (
                SELECT user_id, COUNT(*) as activity_count 
                FROM activities 
                GROUP BY user_id 
                ORDER BY COUNT(*) DESC 
                LIMIT 1
            ) as top_user
            JOIN users u ON u.id = top_user.user_id
        ),
        'activity_type_distribution', (
            SELECT jsonb_object_agg(type, count) FROM (
                SELECT type, COUNT(*) as count 
                FROM activities 
                GROUP BY type
            ) as type_stats
        ),
        'average_likes_per_activity', (
            SELECT ROUND(AVG(likes)::numeric, 2) 
            FROM activities
        ),
        'average_comments_per_activity', (
            SELECT ROUND(AVG(comments)::numeric, 2) 
            FROM activities
        )
    ) INTO result;

    RETURN result;
END;
$$;

-- Function to get global platform statistics with period filters
CREATE OR REPLACE FUNCTION get_global_statistics_with_periods()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
    today_filter DATE := CURRENT_DATE;
    week_filter DATE := CURRENT_DATE - INTERVAL '7 days';
    month_filter DATE := CURRENT_DATE - INTERVAL '30 days';
BEGIN
    -- Get various global counts and statistics by period
    SELECT jsonb_build_object(
        'total_users', (SELECT COUNT(*) FROM users),
        'periods', jsonb_build_object(
            'today', jsonb_build_object(
                'activities', (SELECT COUNT(*) FROM activities WHERE date = today_filter),
                'comments', (SELECT COUNT(*) FROM activity_comments ac JOIN activities a ON ac.activity_id = a.id WHERE a.date = today_filter),
                'likes', (SELECT COUNT(*) FROM activity_likes al JOIN activities a ON al.activity_id = a.id WHERE a.date = today_filter)
            ),
            'week', jsonb_build_object(
                'activities', (SELECT COUNT(*) FROM activities WHERE date >= week_filter),
                'comments', (SELECT COUNT(*) FROM activity_comments ac JOIN activities a ON ac.activity_id = a.id WHERE a.date >= week_filter),
                'likes', (SELECT COUNT(*) FROM activity_likes al JOIN activities a ON al.activity_id = a.id WHERE a.date >= week_filter)
            ),
            'month', jsonb_build_object(
                'activities', (SELECT COUNT(*) FROM activities WHERE date >= month_filter),
                'comments', (SELECT COUNT(*) FROM activity_comments ac JOIN activities a ON ac.activity_id = a.id WHERE a.date >= month_filter),
                'likes', (SELECT COUNT(*) FROM activity_likes al JOIN activities a ON al.activity_id = a.id WHERE a.date >= month_filter)
            ),
            'all_time', jsonb_build_object(
                'activities', (SELECT COUNT(*) FROM activities),
                'comments', (SELECT COUNT(*) FROM activity_comments),
                'likes', (SELECT COUNT(*) FROM activity_likes)
            )
        ),
        'most_active_users', jsonb_build_object(
            'today', (
                SELECT jsonb_agg(jsonb_build_object(
                    'id', u.id,
                    'name', u.first_name || ' ' || u.last_name,
                    'count', activity_count
                ))
                FROM (
                    SELECT user_id, COUNT(*) as activity_count 
                    FROM activities 
                    WHERE date = today_filter
                    GROUP BY user_id 
                    ORDER BY COUNT(*) DESC 
                    LIMIT 5
                ) as top_users
                JOIN users u ON u.id = top_users.user_id
            ),
            'all_time', (
                SELECT jsonb_agg(jsonb_build_object(
                    'id', u.id,
                    'name', u.first_name || ' ' || u.last_name,
                    'count', activity_count
                ))
                FROM (
                    SELECT user_id, COUNT(*) as activity_count 
                    FROM activities 
                    GROUP BY user_id 
                    ORDER BY COUNT(*) DESC 
                    LIMIT 5
                ) as top_users
                JOIN users u ON u.id = top_users.user_id
            )
        ),
        'activity_type_distribution', (
            SELECT jsonb_object_agg(type, count) FROM (
                SELECT type, COUNT(*) as count 
                FROM activities 
                GROUP BY type
            ) as type_stats
        ),
        'average_likes_per_activity', (
            SELECT ROUND(AVG(likes)::numeric, 2) 
            FROM activities
        ),
        'average_comments_per_activity', (
            SELECT ROUND(AVG(comments)::numeric, 2) 
            FROM activities
        )
    ) INTO result;

    RETURN result;
END;
$$;

-- Function to execute SQL (helps with database management and migrations)
CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  EXECUTE query INTO result;
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'detail', SQLSTATE
  );
END;
$$;

-- Insert sample demo user data with valid UUID format and profile pictures
INSERT INTO users (id, email, first_name, last_name, password_hash, role, profile_picture_url)
VALUES 
    ('10000001-0000-0000-0000-000000000001', 'admin@example.com', 'Admin', 'User', '$2a$10$0HtQM0qANcGs5PJvqFake.3rICGaRzyB8a2D3Q1ywTBnK/Yyakugy', 'admin', 'https://randomuser.me/api/portraits/men/1.jpg'),  
    ('20000002-0000-0000-0000-000000000002', 'user@example.com', 'Regular', 'User', '$2a$10$PlbPO7GDpYCxoVs6bHqGNO28vkXYm1J7XxRmKgq9.rGrNEMSy78y6', 'user', 'https://randomuser.me/api/portraits/women/2.jpg'),  
    ('30000003-0000-0000-0000-000000000003', 'demo@example.com', 'Demo', 'User', '$2a$10$UYoEVfpZVRidy1CYysd.ZuHCrwBA3IWtCQ5IlliK5j/wNTPi5i3bu', 'user', 'https://randomuser.me/api/portraits/men/3.jpg'),
    ('40000004-0000-0000-0000-000000000004', 'sarah@example.com', 'Sarah', 'Johnson', '$2a$10$UYoEVfpZVRidy1CYysd.ZuHCrwBA3IWtCQ5IlliK5j/wNTPi5i3bu', 'user', 'https://randomuser.me/api/portraits/women/4.jpg'),
    ('50000005-0000-0000-0000-000000000005', 'michael@example.com', 'Michael', 'Brown', '$2a$10$UYoEVfpZVRidy1CYysd.ZuHCrwBA3IWtCQ5IlliK5j/wNTPi5i3bu', 'user', 'https://randomuser.me/api/portraits/men/5.jpg'),
    ('60000006-0000-0000-0000-000000000006', 'emma@example.com', 'Emma', 'Wilson', '$2a$10$UYoEVfpZVRidy1CYysd.ZuHCrwBA3IWtCQ5IlliK5j/wNTPi5i3bu', 'user', 'https://randomuser.me/api/portraits/women/6.jpg'),
    ('70000007-0000-0000-0000-000000000007', 'james@example.com', 'James', 'Taylor', '$2a$10$UYoEVfpZVRidy1CYysd.ZuHCrwBA3IWtCQ5IlliK5j/wNTPi5i3bu', 'user', 'https://randomuser.me/api/portraits/men/7.jpg');

-- Insert sample activities with valid UUID format and images
INSERT INTO activities (id, user_id, title, description, type, date, image_url)
VALUES
    ('a0000001-0000-0000-0000-000000000001', '10000001-0000-0000-0000-000000000001', 'Morning Run', 'Quick 5K run around the park', 'running', CURRENT_DATE, 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=600'),
    ('a0000002-0000-0000-0000-000000000002', '20000002-0000-0000-0000-000000000002', 'Gym Workout', 'Leg day at the gym', 'strength', CURRENT_DATE - INTERVAL '1 day', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600'),
    ('a0000003-0000-0000-0000-000000000003', '30000003-0000-0000-0000-000000000003', 'Yoga Class', 'Relaxing yoga session', 'yoga', CURRENT_DATE - INTERVAL '2 days', 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=600'),
    ('a0000004-0000-0000-0000-000000000004', '10000001-0000-0000-0000-000000000001', 'Cycling Tour', 'Long distance cycling', 'cycling', CURRENT_DATE - INTERVAL '3 days', 'https://images.unsplash.com/photo-1541625810516-44f1ce894bcd?w=600'),
    ('a0000005-0000-0000-0000-000000000005', '20000002-0000-0000-0000-000000000002', 'HIIT Workout', 'High intensity training', 'cardio', CURRENT_DATE - INTERVAL '5 days', 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=600'),
    ('a0000006-0000-0000-0000-000000000006', '40000004-0000-0000-0000-000000000004', 'Swimming Session', 'Laps at the community pool', 'swimming', CURRENT_DATE - INTERVAL '1 day', 'https://images.unsplash.com/photo-1600965962324-79b51598f60a?w=600'),
    ('a0000007-0000-0000-0000-000000000007', '50000005-0000-0000-0000-000000000005', 'Basketball Game', 'Pickup game with friends', 'basketball', CURRENT_DATE - INTERVAL '2 days', 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600'),
    ('a0000008-0000-0000-0000-000000000008', '60000006-0000-0000-0000-000000000006', 'Pilates Class', 'Core strengthening session', 'pilates', CURRENT_DATE - INTERVAL '1 day', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600'),
    ('a0000009-0000-0000-0000-000000000009', '70000007-0000-0000-0000-000000000007', 'Tennis Match', 'Singles match at the local court', 'tennis', CURRENT_DATE, 'https://images.unsplash.com/photo-1595435934344-2c77338b236a?w=600'),
    ('a0000010-0000-0000-0000-000000000010', '40000004-0000-0000-0000-000000000004', 'Trail Hiking', 'Nature trail exploration', 'hiking', CURRENT_DATE - INTERVAL '3 days', 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600'),
    ('a0000011-0000-0000-0000-000000000011', '50000005-0000-0000-0000-000000000005', 'Mountain Biking', 'Offroad biking adventure', 'cycling', CURRENT_DATE - INTERVAL '4 days', 'https://images.unsplash.com/photo-1596073419667-9d77d59f033f?w=600'),
    ('a0000012-0000-0000-0000-000000000012', '60000006-0000-0000-0000-000000000006', 'Dance Workout', 'Zumba class with friends', 'dance', CURRENT_DATE - INTERVAL '2 days', 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=600');

-- Create some friend relationships
INSERT INTO friends (user_id, friend_id)
VALUES
    -- Existing friendships
    ('10000001-0000-0000-0000-000000000001', '20000002-0000-0000-0000-000000000002'),
    ('10000001-0000-0000-0000-000000000001', '30000003-0000-0000-0000-000000000003'),
    ('20000002-0000-0000-0000-000000000002', '30000003-0000-0000-0000-000000000003'),
    -- New friendships
    ('40000004-0000-0000-0000-000000000004', '10000001-0000-0000-0000-000000000001'),
    ('40000004-0000-0000-0000-000000000004', '20000002-0000-0000-0000-000000000002'),
    ('50000005-0000-0000-0000-000000000005', '40000004-0000-0000-0000-000000000004'),
    ('50000005-0000-0000-0000-000000000005', '60000006-0000-0000-0000-000000000006'),
    ('60000006-0000-0000-0000-000000000006', '70000007-0000-0000-0000-000000000007'),
    ('70000007-0000-0000-0000-000000000007', '10000001-0000-0000-0000-000000000001');

-- Add some comments
INSERT INTO activity_comments (activity_id, user_id, comment)
VALUES
    -- Existing comments
    ('a0000001-0000-0000-0000-000000000001', '20000002-0000-0000-0000-000000000002', 'Great job on your run!'),
    ('a0000001-0000-0000-0000-000000000001', '30000003-0000-0000-0000-000000000003', 'What was your pace?'),
    ('a0000002-0000-0000-0000-000000000002', '10000001-0000-0000-0000-000000000001', 'Leg day is the best day!'),
    ('a0000003-0000-0000-0000-000000000003', '10000001-0000-0000-0000-000000000001', 'Which yoga style was it?'),
    -- New comments
    ('a0000006-0000-0000-0000-000000000006', '10000001-0000-0000-0000-000000000001', 'Swimming is great for recovery!'),
    ('a0000006-0000-0000-0000-000000000006', '30000003-0000-0000-0000-000000000003', 'How many laps did you do?'),
    ('a0000007-0000-0000-0000-000000000007', '60000006-0000-0000-0000-000000000006', 'Basketball looks fun, we should play sometime'),
    ('a0000008-0000-0000-0000-000000000008', '40000004-0000-0000-0000-000000000004', 'I love Pilates too!'),
    ('a0000009-0000-0000-0000-000000000009', '50000005-0000-0000-0000-000000000005', 'Did you win the match?'),
    ('a0000010-0000-0000-0000-000000000010', '70000007-0000-0000-0000-000000000007', 'That trail looks amazing!'),
    ('a0000011-0000-0000-0000-000000000011', '20000002-0000-0000-0000-000000000002', 'What bike do you use?'),
    ('a0000012-0000-0000-0000-000000000012', '30000003-0000-0000-0000-000000000003', 'Dance workouts are the best!');

-- Add some likes
INSERT INTO activity_likes (activity_id, user_id)
VALUES
    -- Existing likes
    ('a0000001-0000-0000-0000-000000000001', '20000002-0000-0000-0000-000000000002'),
    ('a0000001-0000-0000-0000-000000000001', '30000003-0000-0000-0000-000000000003'),
    ('a0000002-0000-0000-0000-000000000002', '10000001-0000-0000-0000-000000000001'),
    ('a0000002-0000-0000-0000-000000000002', '30000003-0000-0000-0000-000000000003'),
    ('a0000003-0000-0000-0000-000000000003', '10000001-0000-0000-0000-000000000001'),
    -- New likes
    ('a0000006-0000-0000-0000-000000000006', '10000001-0000-0000-0000-000000000001'),
    ('a0000006-0000-0000-0000-000000000006', '20000002-0000-0000-0000-000000000002'),
    ('a0000006-0000-0000-0000-000000000006', '30000003-0000-0000-0000-000000000003'),
    ('a0000007-0000-0000-0000-000000000007', '40000004-0000-0000-0000-000000000004'),
    ('a0000007-0000-0000-0000-000000000007', '60000006-0000-0000-0000-000000000006'),
    ('a0000008-0000-0000-0000-000000000008', '40000004-0000-0000-0000-000000000004'),
    ('a0000008-0000-0000-0000-000000000008', '70000007-0000-0000-0000-000000000007'),
    ('a0000009-0000-0000-0000-000000000009', '50000005-0000-0000-0000-000000000005'),
    ('a0000009-0000-0000-0000-000000000009', '10000001-0000-0000-0000-000000000001'),
    ('a0000010-0000-0000-0000-000000000010', '70000007-0000-0000-0000-000000000007'),
    ('a0000011-0000-0000-0000-000000000011', '20000002-0000-0000-0000-000000000002'),
    ('a0000012-0000-0000-0000-000000000012', '30000003-0000-0000-0000-000000000003'),
    ('a0000012-0000-0000-0000-000000000012', '40000004-0000-0000-0000-000000000004');

-- Update the comment and like counts for all activities
UPDATE activities SET comments = 2, likes = 2 WHERE id = 'a0000001-0000-0000-0000-000000000001';
UPDATE activities SET comments = 1, likes = 2 WHERE id = 'a0000002-0000-0000-0000-000000000002';
UPDATE activities SET comments = 1, likes = 1 WHERE id = 'a0000003-0000-0000-0000-000000000003';
UPDATE activities SET comments = 0, likes = 0 WHERE id = 'a0000004-0000-0000-0000-000000000004';
UPDATE activities SET comments = 0, likes = 0 WHERE id = 'a0000005-0000-0000-0000-000000000005';
UPDATE activities SET comments = 2, likes = 3 WHERE id = 'a0000006-0000-0000-0000-000000000006';
UPDATE activities SET comments = 1, likes = 2 WHERE id = 'a0000007-0000-0000-0000-000000000007';
UPDATE activities SET comments = 1, likes = 2 WHERE id = 'a0000008-0000-0000-0000-000000000008';
UPDATE activities SET comments = 1, likes = 2 WHERE id = 'a0000009-0000-0000-0000-000000000009';
UPDATE activities SET comments = 1, likes = 1 WHERE id = 'a0000010-0000-0000-0000-000000000010';
UPDATE activities SET comments = 1, likes = 1 WHERE id = 'a0000011-0000-0000-0000-000000000011';
UPDATE activities SET comments = 1, likes = 2 WHERE id = 'a0000012-0000-0000-0000-000000000012';

-- Comment: Run this script to set up the new Supabase-compatible database schema and initial data
