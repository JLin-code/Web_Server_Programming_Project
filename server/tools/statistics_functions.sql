-- SQL functions for retrieving activity statistics - simplified version

-- Function to get user activity statistics
CREATE OR REPLACE FUNCTION get_user_statistics(user_id_param INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    result JSONB;
    total_activities INTEGER;
    total_likes_received INTEGER;
    total_comments_received INTEGER;
    total_likes_given INTEGER;
    total_comments_made INTEGER;
    friends_count INTEGER;
BEGIN
    -- Get basic counts with proper error handling
    BEGIN
        SELECT COUNT(*) INTO total_activities FROM activities WHERE user_id = user_id_param;
    EXCEPTION WHEN OTHERS THEN
        total_activities := 0;
    END;
    
    BEGIN
        SELECT COALESCE(SUM(likes), 0) INTO total_likes_received FROM activities WHERE user_id = user_id_param;
    EXCEPTION WHEN OTHERS THEN
        total_likes_received := 0;
    END;
    
    BEGIN
        SELECT COALESCE(SUM(comments), 0) INTO total_comments_received FROM activities WHERE user_id = user_id_param;
    EXCEPTION WHEN OTHERS THEN
        total_comments_received := 0;
    END;
    
    BEGIN
        SELECT COUNT(*) INTO total_likes_given FROM activity_likes WHERE user_id = user_id_param;
    EXCEPTION WHEN OTHERS THEN
        total_likes_given := 0;
    END;
    
    BEGIN
        SELECT COUNT(*) INTO total_comments_made FROM activity_comments WHERE user_id = user_id_param;
    EXCEPTION WHEN OTHERS THEN
        total_comments_made := 0;
    END;
    
    BEGIN
        SELECT COUNT(*) INTO friends_count FROM friends WHERE user_id = user_id_param;
    EXCEPTION WHEN OTHERS THEN
        friends_count := 0;
    END;
    
    -- Build the result object
    SELECT jsonb_build_object(
        'total_activities', total_activities,
        'total_likes_received', total_likes_received,
        'total_comments_received', total_comments_received,
        'total_likes_given', total_likes_given,
        'total_comments_made', total_comments_made,
        'friends_count', friends_count
    ) INTO result;

    RETURN result;
END;
$$;

-- Function to get global platform statistics - simplified version
CREATE OR REPLACE FUNCTION get_global_statistics()
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    result JSONB;
    total_users INTEGER;
    total_activities INTEGER;
    total_comments INTEGER;
    total_likes INTEGER;
BEGIN
    -- Get basic counts with proper error handling
    BEGIN
        SELECT COUNT(*) INTO total_users FROM users;
    EXCEPTION WHEN OTHERS THEN
        total_users := 0;
    END;
    
    BEGIN
        SELECT COUNT(*) INTO total_activities FROM activities;
    EXCEPTION WHEN OTHERS THEN
        total_activities := 0;
    END;
    
    BEGIN
        SELECT COUNT(*) INTO total_comments FROM activity_comments;
    EXCEPTION WHEN OTHERS THEN
        total_comments := 0;
    END;
    
    BEGIN
        SELECT COUNT(*) INTO total_likes FROM activity_likes;
    EXCEPTION WHEN OTHERS THEN
        total_likes := 0;
    END;
    
    -- Build the result object
    SELECT jsonb_build_object(
        'total_users', total_users,
        'total_activities', total_activities,
        'total_comments', total_comments,
        'total_likes', total_likes
    ) INTO result;

    RETURN result;
END;
$$;

-- Basic period-based user statistics function with error handling
CREATE OR REPLACE FUNCTION get_user_stats_by_period(
    user_id_param INTEGER,
    period_name TEXT, -- Period name: 'today', 'week', 'month', 'all'
    days_back INTEGER -- How many days to look back (0 for today, 7 for week, etc.)
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    result JSONB;
    activity_count INTEGER := 0;
    likes_count INTEGER := 0;
    date_filter DATE;
BEGIN
    -- Set date filter
    IF days_back = 0 THEN
        date_filter := CURRENT_DATE;
    ELSIF days_back > 0 THEN  
        date_filter := CURRENT_DATE - (days_back || ' days')::INTERVAL;
    ELSE
        date_filter := NULL; -- No filter for 'all'
    END IF;
    
    -- Get activity count for period
    BEGIN
        IF date_filter IS NULL THEN
            SELECT COUNT(*) INTO activity_count 
            FROM activities 
            WHERE user_id = user_id_param;
        ELSIF days_back = 0 THEN
            SELECT COUNT(*) INTO activity_count 
            FROM activities 
            WHERE user_id = user_id_param 
            AND date::DATE = date_filter;
        ELSE
            SELECT COUNT(*) INTO activity_count 
            FROM activities 
            WHERE user_id = user_id_param 
            AND date::DATE >= date_filter;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        activity_count := 0;
    END;
    
    -- Get likes count for period
    BEGIN
        IF date_filter IS NULL THEN
            SELECT COALESCE(SUM(likes), 0) INTO likes_count 
            FROM activities 
            WHERE user_id = user_id_param;
        ELSIF days_back = 0 THEN
            SELECT COALESCE(SUM(likes), 0) INTO likes_count 
            FROM activities 
            WHERE user_id = user_id_param 
            AND date::DATE = date_filter;
        ELSE
            SELECT COALESCE(SUM(likes), 0) INTO likes_count 
            FROM activities 
            WHERE user_id = user_id_param 
            AND date::DATE >= date_filter;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        likes_count := 0;
    END;
    
    -- Return result
    SELECT jsonb_build_object(
        'period', period_name,
        'activities', activity_count,
        'likes', likes_count
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Function that combines all periods for a user
CREATE OR REPLACE FUNCTION get_user_period_stats(user_id_param INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'today', get_user_stats_by_period(user_id_param, 'today', 0),
        'week', get_user_stats_by_period(user_id_param, 'week', 7),
        'month', get_user_stats_by_period(user_id_param, 'month', 30),
        'all_time', get_user_stats_by_period(user_id_param, 'all', -1)
    ) INTO result;
    
    RETURN result;
END;
$$;
