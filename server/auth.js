const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const pool = require('./db');
require('dotenv').config();

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Auto-assign admin role if email matches ADMIN_EMAIL
        const isAdminEmail = email?.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase();
        const role = isAdminEmail ? 'admin' : 'customer';
        
        // Check if user exists
        const [existing] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ message: 'Email already exists' });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user
        const [result] = await pool.execute(
            'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, role]
        );

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(400).json({ message: 'Invalid credentials' });

        const user = users[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // Create token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;
        
        if (!process.env.GOOGLE_CLIENT_ID) {
            throw new Error("GOOGLE_CLIENT_ID is missing in server .env file");
        }

        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        
        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, sub: googleId } = payload;
        const isAdminEmail = email?.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase();
        const initialRole = isAdminEmail ? 'admin' : 'customer';

        // Check if user exists
        let [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        let user;

        if (users.length === 0) {
            // Create user if doesn't exist
            const [result] = await pool.execute(
                'INSERT INTO users (name, email, role, google_id) VALUES (?, ?, ?, ?)',
                [name, email, initialRole, googleId]
            );
            user = { id: result.insertId, name, email, role: initialRole };
        } else {
            user = users[0];
            // Update google_id and role if needed
            if (!user.google_id || (isAdminEmail && user.role !== 'admin')) {
                await pool.execute(
                    'UPDATE users SET google_id = ?, role = ? WHERE id = ?', 
                    [googleId, isAdminEmail ? 'admin' : user.role, user.id]
                );
                user.role = isAdminEmail ? 'admin' : user.role;
            }
        }

        // Create JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Google login error:', error);
        res.status(400).json({ 
            message: 'Google login error: ' + error.message
        });
    }
};

module.exports = { register, login, googleLogin };
