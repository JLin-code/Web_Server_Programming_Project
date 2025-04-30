-- SQL for a posgresql database
-- Create the users table
CREATE TABLE users (
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
-- Add indexes for performance optimization
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_handle ON users(handle);



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

-- Create activities table
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
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_type ON activities(type);
CREATE INDEX idx_activities_date ON activities(date);

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
CREATE INDEX idx_activity_comments_activity_id ON activity_comments(activity_id);
CREATE INDEX idx_activity_comments_user_id ON activity_comments(user_id);

-- Create activity_likes table to track who liked what
CREATE TABLE IF NOT EXISTS activity_likes (
    id SERIAL PRIMARY KEY,
    activity_id INT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(activity_id, user_id)
);

-- Add indexes for activity_likes
CREATE INDEX idx_activity_likes_activity_id ON activity_likes(activity_id);
CREATE INDEX idx_activity_likes_user_id ON activity_likes(user_id);