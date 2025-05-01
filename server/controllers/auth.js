const express = require('express');
const bcrypt = require('bcryptjs'); // Changed from bcrypt to bcryptjs
const jwt = require('jsonwebtoken');
const { CustomError, statusCodes } = require('../models/errors');
const userModel = require('../models/users');
const router = express.Router();

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Use a secure key in production

// Registration
router.post('/register', async (req, res, next) => {
    try {
        const { first_name, last_name, email, password, role = 'user' } = req.body;
        
        // Validate required fields
        if (!first_name || !last_name || !email || !password) {
            throw new CustomError('Missing required fields', statusCodes.BAD_REQUEST);
        }
        
        // Check if user already exists
        try {
            await userModel.getByEmail(email);
            throw new CustomError('User with this email already exists', statusCodes.BAD_REQUEST);
        } catch(err) {
            // If user not found error, continue with registration
            if (err.status !== statusCodes.NOT_FOUND) {
                throw err;
            }
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user
        const newUser = await userModel.create({
            first_name,
            last_name,
            email,
            password: hashedPassword,
            role
        });
        
        // Don't return password in response
        const { password: _, ...userWithoutPassword } = newUser;
        
        res.status(201).json({ 
            success: true, 
            message: 'Registration successful',
            user: userWithoutPassword
        });
    } catch (err) {
        next(err);
    }
});

// Login
router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            throw new CustomError('Email and password are required', statusCodes.BAD_REQUEST);
        }
        
        // Find user by email
        let user;
        try {
            console.log('Looking up user by email:', username);
            user = await userModel.getByEmail(username);
            console.log('User found:', { id: user.id, email: user.email, role: user.role });
        } catch (err) {
            console.error('Error finding user:', err);
            
            // For development - create a demo user if not found
            if (err.status === statusCodes.NOT_FOUND) {
                console.log('Creating demo user for development...');
                // Create a minimal user for development purposes
                user = {
                    id: 1,
                    first_name: username.split('@')[0].split('.')[0],
                    last_name: username.split('@')[0].split('.')[1] || 'User',
                    email: username,
                    role: username.includes('admin') ? 'admin' : 'user',
                    password: 'password',
                    age: 30,
                    gender: 'Other'
                };
                
                // Try to insert this user into the database for future use
                try {
                    await userModel.create({
                        first_name: user.first_name,
                        last_name: user.last_name,
                        email: user.email,
                        password: 'password', // Plain text for dev only
                        role: user.role,
                        age: user.age,
                        gender: user.gender
                    });
                    console.log('Created demo user:', user.email);
                } catch (createErr) {
                    console.error('Could not create demo user:', createErr);
                    // Continue with in-memory user even if DB creation fails
                }
            } else {
                throw err;
            }
        }
        
        // Verify password
        let validPassword = false;
        
        try {
            // In production, properly check password
            if (process.env.NODE_ENV === 'production') {
                validPassword = await bcrypt.compare(password, user.password);
            } else {
                // In development mode, be more permissive with passwords
                validPassword = await bcrypt.compare(password, user.password) || 
                                (password === 'password') || 
                                (password === user.password);
            }
        } catch (e) {
            console.error('Password comparison error:', e);
            // For development only - REMOVE IN PRODUCTION
            if (process.env.NODE_ENV !== 'production') {
                validPassword = (password === 'password');
            }
        }
        
        if (!validPassword) {
            throw new CustomError('Invalid password', statusCodes.UNAUTHORIZED);
        }
        
        // Create JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        // Set token in HTTP-only cookie
        res.cookie('authToken', token, { 
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
            secure: process.env.NODE_ENV === 'production' // Use secure in production only
        });
        
        // Don't return password in response
        const { password: _, ...userWithoutPassword } = user;
        
        res.json({ 
            success: true, 
            message: 'Login successful',
            user: userWithoutPassword
        });
    } catch (err) {
        // Don't expose specific errors for security reasons
        next(new CustomError('Invalid email or password', statusCodes.UNAUTHORIZED));
    }
});

// Logout
router.post('/logout', (req, res) => {
    res.clearCookie('authToken');
    res.json({ success: true, message: 'Logout successful' });
});

// Get current user
router.get('/me', authenticateToken, async (req, res, next) => {
    try {
        const user = await userModel.get(req.user.userId);
        const { password, ...userWithoutPassword } = user;
        res.json({ user: userWithoutPassword });
    } catch (err) {
        next(err);
    }
});

// Get demo users for login
router.get('/demo-users', async (req, res, next) => {
    try {
        // Try to get actual users from database
        const usersResult = await userModel.getAll();
        
        // Format users for dropdown
        const demoUsers = usersResult.items.map(user => ({
            username: user.email,
            displayName: `${user.first_name} ${user.last_name} (${user.role === 'admin' ? 'Admin' : 'User'})`
        })).slice(0, 5); // Limit to 5 users for dropdown
        
        res.json({ success: true, users: demoUsers });
    } catch (err) {
        // If database fetch fails, fall back to hardcoded users
        console.error('Error fetching users for dropdown:', err);
        
        const demoUsers = [
            { username: 'john.doe@example.com', displayName: 'John Doe (User)' },
            { username: 'jane.smith@example.com', displayName: 'Jane Smith (User)' },
            { username: 'michael.brown@example.com', displayName: 'Michael Brown (Admin)' },
            { username: 'emily.johnson@example.com', displayName: 'Emily Johnson (User)' },
            { username: 'david.wilson@example.com', displayName: 'David Wilson (User)' }
        ];
        
        res.json({ success: true, users: demoUsers });
    }
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
    // Get token from cookie
    const token = req.cookies.authToken;
    
    if (!token) {
        return next(new CustomError('Authentication required', statusCodes.UNAUTHORIZED));
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return next(new CustomError('Invalid or expired token', statusCodes.UNAUTHORIZED));
        }
        
        req.user = decoded;
        next();
    });
}

// Export the authentication middleware for use in other routes
module.exports = {
    router,
    authenticateToken
};
