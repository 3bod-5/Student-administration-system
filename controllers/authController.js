const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Imported JWT dependency
const collection = require("../models/config");

// Secret token verification key (Keep this safe in your .env configuration file)
const JWT_SECRET = process.env.JWT_SECRET || "your_super_secure_random_secret_key_change_this";

// Render login screen
exports.loginPage = (req, res) => {
    res.render("login");
};

// Handle login submission via JWT
exports.login = async (req, res) => {
    try {
        const { username, password, type } = req.body;
        
        // Find user by name
        const check = await collection.findOne({ name: username });
        
        // Correct check for user not found in MongoDB
        if (!check) {
            return res.send("User cannot be found");
        }

        // Compare entered password with stored hash
        const checkpass = await bcrypt.compare(password, check.password);
        
        if (checkpass) {
            if (check.type === type) {
                
                // 1. Generate the JWT token payload containing the user context details
                const token = jwt.sign(
                    {
                        id: check._id,
                        username: check.name,
                        type: check.type,
                        department: check.department,
                        email: check.email,
                        nationality: check.nationality,
                        dateofbirth: check.dateofbirth,
                        level: check.level
                    },
                    JWT_SECRET,
                    { expiresIn: '2h' } // Token auto-expires in 2 hours
                );

                // 2. Set the token inside an HTTP-only browser cookie container
                res.cookie('auth_token', token, {
                    httpOnly: true, // Shields against Cross-Site Scripting (XSS)
                    secure: process.env.NODE_ENV === 'production', // True only when running on production HTTPS
                    maxAge: 2 * 60 * 60 * 1000 // Matches expiration window (2 hours in milliseconds)
                });

                // 3. Redirect onto their target secure dashboard route paths
                if (check.type === "student") {
                    return res.redirect('/student/studentpage');
                } else if (check.type === "admin") {
                    return res.redirect('/admin');
                } else {
                    return res.redirect('/staff/staffhome');
                }

            } else {
                return res.send("Wrong user type selected");
            }
        } else {
            return res.send("Wrong password");
        }
    } catch (err) {
        console.error(err);
        res.send("Wrong details or server error");
    }
};