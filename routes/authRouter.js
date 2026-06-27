const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Main Entry Authentication Pipeline
router.route('/')
    .get(authController.loginPage)
    .post(authController.login);

/**
 * Global Session Destruction / Cookie Clear
 * Clears the JWT and returns the user to the splash login interface
 */
router.get('/logout', (req, res) => {
    // Overwrites and eliminates the browser authentication cookie
    res.clearCookie('auth_token');
    
    // Redirect back to the login page view
    res.redirect('/');
});

module.exports = router;