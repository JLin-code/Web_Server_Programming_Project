-- SQL schema and functions for fitness tracker app

-- Drop existing tables if they exist
DROP TABLE IF EXISTS activity_likes CASCADE;
DROP TABLE IF EXISTS activity_comments CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS friends CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create simplified users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create activities table
CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create activity_comments table
CREATE TABLE activity_comments (
    id SERIAL PRIMARY KEY,
    activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create activity_likes table
CREATE TABLE activity_likes (
    id SERIAL PRIMARY KEY,
    activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (activity_id, user_id)
);

-- Create friends table
CREATE TABLE friends (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    friend_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

-- Function to increment comment count on activity
CREATE OR REPLACE FUNCTION increment_comment_count(act_id INTEGER)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE activities
    SET comments = comments + 1
    WHERE id = act_id;
END;
$$;

-- Function to increment like count on activity
CREATE OR REPLACE FUNCTION increment_like_count(act_id INTEGER)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE activities
    SET likes = likes + 1
    WHERE id = act_id;
END;
$$;

-- Function to get user activity statistics
CREATE OR REPLACE FUNCTION get_user_statistics(user_id_param INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
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
    user_id_param INTEGER,
    period_filter TEXT -- 'today', 'week', 'month', 'all'
)
RETURNS JSONB
LANGUAGE plpgsql
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
CREATE OR REPLACE FUNCTION get_user_statistics_with_periods(user_id_param INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    result JSONB;
    user_info JSONB;
BEGIN
    -- Get basic user info
    SELECT jsonb_build_object(
        'id', u.id,
        'name', u.name,
        'email', u.username,
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
                'name', u.name,
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
                    'name', u.name,
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
                    'name', u.name,
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

-- Insert sample demo user
INSERT INTO users (username, password_hash, name, role)
VALUES 
    ('admin@example.com', '$2a$10$0HtQM0qANcGs5PJvqFake.3rICGaRzyB8a2D3Q1ywTBnK/Yyakugy', 'Admin User', 'admin'),  -- password: adminpass
    ('user@example.com', '$2a$10$PlbPO7GDpYCxoVs6bHqGNO28vkXYm1J7XxRmKgq9.rGrNEMSy78y6', 'Regular User', 'user'),  -- password: userpass
    ('demo@example.com', '$2a$10$UYoEVfpZVRidy1CYysd.ZuHCrwBA3IWtCQ5IlliK5j/wNTPi5i3bu', 'Demo User', 'user');     -- password: demopass

-- Comment: Run this script to set up the database schema and initial data
