const jwt = require('jsonwebtoken')
const dotenv = require('dotenv').config()

const SECRET_KEY = process.env.JWT_SECRET || 'development-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '10h';
const NODE_ENV = process.env.NODE_ENV || 'development';

if (!process.env.JWT_SECRET) {
    console.warn('[JwtController] JWT_SECRET is not set. Falling back to development-secret-key. Do NOT use this in production.');
}

// Cookie options
const cookieOptions = {
    httpOnly: true,
    secure: NODE_ENV === 'production', // Only send over HTTPS in production
    sameSite: 'strict',
    maxAge: 10 * 60 * 60 * 1000, // 10 hours in milliseconds
    path: '/',
};

// Generate JWT token
const generateToken = (payload) => {
    return jwt.sign(payload, SECRET_KEY, { expiresIn: JWT_EXPIRES_IN });
};

// Set JWT token in httpOnly cookie
const setTokenCookie = (res, token) => {
    res.cookie('jwt', token, cookieOptions);
};

// Clear JWT cookie
const clearTokenCookie = (res) => {
    res.clearCookie('jwt', {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
    });};

// Verify JWT token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, SECRET_KEY);
    } catch (error) {
        return null;
    }
};

// Get token from request (cookie or header)
const getTokenFromRequest = (req) => {
    // Check for token in cookies first
    if (req.cookies?.jwt) {
        return req.cookies.jwt;
    }
    
    // Fallback to Authorization header (for backward compatibility)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.split(' ')[1];
    }
    
    return null;
};

module.exports = {
    generateToken,
    verifyToken,
    setTokenCookie,
    clearTokenCookie,
    getTokenFromRequest,
};