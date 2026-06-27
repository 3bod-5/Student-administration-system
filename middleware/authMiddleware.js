const jwt = require('jsonwebtoken');

// Secret token verification key (Keep this safe in your .env configuration file)
const JWT_SECRET = process.env.JWT_SECRET || "your_super_secure_random_secret_key_change_this";

/**
 * Core authentication guard that verifies if a valid JWT cookie exists
 */
const authenticateToken = (req, res, next) => {
    const token = req.cookies.auth_token;

    // If no token exists, bounce back to the login screen
    if (!token) {
        return res.redirect('/');
    }

    try {
        // Verify token signature against the secret key
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Attach user context data to the request object
        req.user = decoded; 
        
        next(); 
    } catch (error) {
        // Clear bad/expired cookies automatically
        res.clearCookie('auth_token');
        return res.redirect('/');
    }
};

/**
 * Role authorization guard factory
 * Checks if the authenticated user's type matches the required path permissions
 */
const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        // Ensure authentication happened first
        if (!req.user) {
            return res.redirect('/');
        }

        // Verify if user's account type has authorization clearance
        if (!allowedRoles.includes(req.user.type)) {
            return res.status(403).send("Access Denied: You do not have permissions to view this resource.");
        }

        next();
    };
};

// Export both helper guards
module.exports = {
    authenticateToken,
    authorizeRole
};