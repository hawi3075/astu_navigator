const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    // Check if no header or doesn't start with Bearer
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token, authorization denied' });
    }

    try {
        // Extract the token (remove "Bearer " prefix)
        const token = authHeader.split(' ')[1];
        
        // Verify token (Ensure your JWT_SECRET matches your login logic)
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_fallback_secret');

        // Add user from payload to request object
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token is not valid' });
    }
};

module.exports = authMiddleware;