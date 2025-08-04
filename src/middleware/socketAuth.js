// Socket.io Authentication Middleware
const rateLimit = require('express-rate-limit');

// Simple rate limiting for socket connections
const connectionAttempts = new Map();

function socketAuth(socket, next) {
    try {
        const handshake = socket.handshake;
        
        // Basic validation
        if (!handshake) {
            return next(new Error('Invalid handshake'));
        }
        
        // Rate limiting check
        const clientIP = handshake.address;
        if (!checkRateLimit(clientIP)) {
            return next(new Error('Too many connection attempts'));
        }
        
        // Extract player information from handshake
        const query = handshake.query || {};
        const headers = handshake.headers || {};
        
        // Validate player name if provided
        if (query.playerName) {
            const playerName = query.playerName.trim();
            
            if (playerName.length < 2 || playerName.length > 20) {
                return next(new Error('Invalid player name length'));
            }
            
            // Basic profanity filter (extend as needed)
            if (containsProfanity(playerName)) {
                return next(new Error('Invalid player name content'));
            }
            
            socket.playerName = playerName;
        }
        
        // Store client information
        socket.clientInfo = {
            ip: clientIP,
            userAgent: headers['user-agent'] || 'Unknown',
            origin: headers.origin || 'Unknown',
            connectTime: Date.now()
        };
        
        // Validate origin in production
        if (process.env.NODE_ENV === 'production') {
            const allowedOrigins = [
                'https://your-domain.com',
                'https://www.your-domain.com'
            ];
            
            const origin = headers.origin;
            if (origin && !allowedOrigins.includes(origin)) {
                console.warn(`Connection from unauthorized origin: ${origin} (IP: ${clientIP})`);
                return next(new Error('Unauthorized origin'));
            }
        }
        
        // Log successful connection
        console.log(`Socket auth passed: ${socket.id} from ${clientIP}`);
        
        next();
        
    } catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication failed'));
    }
}

function checkRateLimit(clientIP) {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxAttempts = 10; // Max 10 connections per minute per IP
    
    if (!connectionAttempts.has(clientIP)) {
        connectionAttempts.set(clientIP, []);
    }
    
    const attempts = connectionAttempts.get(clientIP);
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(timestamp => (now - timestamp) < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
        console.warn(`Rate limit exceeded for IP: ${clientIP}`);
        return false;
    }
    
    // Add current attempt
    validAttempts.push(now);
    connectionAttempts.set(clientIP, validAttempts);
    
    return true;
}

function containsProfanity(text) {
    // Basic profanity filter - extend with a proper library for production
    const prohibitedWords = [
        // Add prohibited words here
        'spam', 'test123', 'admin', 'moderator'
    ];
    
    const lowerText = text.toLowerCase();
    return prohibitedWords.some(word => lowerText.includes(word));
}

// Cleanup old rate limit entries periodically
setInterval(() => {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    
    for (const [ip, attempts] of connectionAttempts.entries()) {
        const validAttempts = attempts.filter(timestamp => (now - timestamp) < windowMs);
        
        if (validAttempts.length === 0) {
            connectionAttempts.delete(ip);
        } else {
            connectionAttempts.set(ip, validAttempts);
        }
    }
}, 60000); // Every minute

module.exports = socketAuth;