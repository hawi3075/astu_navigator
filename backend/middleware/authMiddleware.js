const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware
 * Checks for a JWT in the Authorization header and verifies it.
 */
const authMiddleware = (req, res, next) => {
    // 1. Get the Authorization header from the request
    const authHeader = req.header('Authorization');
    
    // 2. Check if the header exists and follows the 'Bearer <token>' format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.warn("🛡️ Auth Denied: No Bearer token found in header.");
        return res.status(401).json({ 
            error: 'No token provided, authorization denied. Please log in again.' 
        });
    }

    try {
        // 3. Extract the actual token from the "Bearer " string
        const token = authHeader.split(' ')[1];
        
        // 4. Verify the token using your JWT_SECRET from .env
        // We use a fallback string only to prevent the server from crashing 
        // if the .env file fails to load, though process.env is preferred.
        const secret = process.env.JWT_SECRET || 'fallback_secret_for_testing_only';
        const decoded = jwt.verify(token, secret);

        // 5. Attach the decoded user payload (id, role, email) to the request object
        // This allows your routes (like /save-location) to know exactly WHO is logged in.
        req.user = decoded;
        
        console.log(`🛡️ Auth Success: User ${decoded.email} verified.`);

        // 6. Proceed to the next function (the controller)
        next();
    } catch (err) {
        // Handle specific JWT errors gracefully
        console.error("🛡️ Auth Error:", err.message);

        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Session expired. Please log in again.' });
        }
        
        res.status(401).json({ error: 'Token is not valid or has been tampered with.' });
    }
};

module.exports = authMiddleware;