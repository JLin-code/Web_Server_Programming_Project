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
        
        // Find user by email (username is actually the email)
        const user = await userModel.getByEmail(username);
        
        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
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
            sameSite: 'strict', 
            secure: process.env.NODE_ENV === 'production' 
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
router.get('/demo-users', (req, res) => {
    // Demo users data
    const demoUsers = [
        { username: 'Admin', displayName: 'Administrator' },
        { username: 'Jane Smith', displayName: 'Jane Smith' },
        { username: 'John Doe', displayName: 'John Doe' },
        { username: 'Major Major', displayName: 'Major Major' },
        { username: 'Laura Green', displayName: 'Laura Green' }
    ];
    
    res.json({ success: true, users: demoUsers });
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
