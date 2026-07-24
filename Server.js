require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

const app = express();

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    host: "mysql-16e976b-akramrhazza37-679b.b.aivencloud.com",
    port: 19991,
    user: "avnadmin",
    password: process.env.DB_PASSWORD,
    database: "defaultdb",
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// CONFIGURE LIVE EMAIL TRANSPORTER (Nodemailer)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'YOUR_EMAIL@gmail.com',         // Safe environment variable
        pass: process.env.EMAIL_PASS || 'your_16char_app_password'     // Safe environment variable
    }
});

// ROUTE 1: Handle User Signup Form Data
app.post('/signup', (req, res) => {
    const { username, email, password } = req.body;
    const sqlQuery = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    
    bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
    if (hashErr) {
        return res.status(500).json({ error: "Password encryption failed." });
    }

    pool.query(sqlQuery, [username, email, hashedPassword], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                console.log(`⚠️ Signup attempt rejected: Duplicate entry found.`);
                if (err.message.includes('username')) {
                    return res.status(400).json({ error: "This username is already taken." });
                } else {
                    return res.status(400).json({ error: "This email address is already registered." });
                }
            }
            console.error("❌ Database Save Error:", err.message);
            return res.status(500).json({ error: "Failed to store user details in database." });
        }
        console.log(`✅ Successfully registered user: ${username} (${email})`);
        return res.status(200).json({ message: "Registration successful! Account has been saved." });
    });
});

// ROUTE 2: Handle User Login Form Data
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sqlQuery = 'SELECT * FROM users WHERE email = ? AND password = ?';

    pool.query(sqlQuery, [email, password], (err, results) => {
        if (err) {
            console.error("❌ Database Authentication Error:", err.message);
            return res.status(500).json({ error: "Server authentication error." });
        }

        if (results.length > 0) {
            console.log(`🔓 User logged in successfully: ${email}`);
            return res.status(200).json({ message: "Login verified successfully! Welcome back." });
        } else {
            return res.status(401).json({ error: "Invalid email or password mismatch." });
        }
    });
});

// ROUTE 3: Request Password Reset Pin and Send Email
app.post('/forgot-password', (req, res) => {
    const { email } = req.body;

    pool.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({ error: "Server error." });
        if (results.length === 0) return res.status(404).json({ error: "No account found with this email." });

        const generatedPin = Math.floor(1000 + Math.random() * 9000).toString();
        const expirationTime = new Date(Date.now() + 15 * 60 * 1000); 

        const updateQuery = 'UPDATE users SET reset_pin = ?, pin_expires = ? WHERE email = ?';
        pool.query(updateQuery, [generatedPin, expirationTime, email], (err) => {
            if (err) return res.status(500).json({ error: "Failed to issue security PIN." });
            
            const emailOptions = {
                from: `"Security Verification" <${process.env.EMAIL_USER || 'YOUR_EMAIL@gmail.com'}>`, 
                to: email, 
                subject: 'Password Reset Verification PIN',
                text: `Hello, \n\nYou have requested a password reset. Your temporary 4-digit security verification PIN is: ${generatedPin}\n\nThis PIN will expire in 15 minutes for your security.`,
                html: `<h3>Password Reset Verification</h3><p>Your temporary 4-digit security verification PIN is: <b style="font-size: 1.3em; color: #007bff; letter-spacing: 2px;">${generatedPin}</b></p><p>This PIN will expire in 15 minutes.</p>`
            };

            transporter.sendMail(emailOptions, (mailErr, info) => {
                if (mailErr) {
                    console.error("❌ Email Delivery Failure:", mailErr.message);
                    return res.status(500).json({ error: "Failed to dispatch recovery email. Check server configuration." });
                }
                console.log(`✉️ Email dispatched cleanly: ${info.response}`);
                return res.status(200).json({ message: "Recovery PIN has been sent straight to your email inbox!" });
            });
        });
    });
});

// ROUTE 4: Verify Pin and Update Password
app.post('/reset-password', (req, res) => {
    const { email, pin, newPassword } = req.body;
    const selectQuery = 'SELECT * FROM users WHERE email = ? AND reset_pin = ? AND pin_expires > NOW()';
    
    pool.query(selectQuery, [email, pin], (err, results) => {
        if (err) return res.status(500).json({ error: "Server authentication error." });
        if (results.length === 0) return res.status(400).json({ error: "Invalid pin, incorrect email, or security token expired." });

        const updateQuery = 'UPDATE users SET password = ?, reset_pin = NULL, pin_expires = NULL WHERE email = ?';
        pool.query(updateQuery, [newPassword, email], (err) => {
            if (err) return res.status(500).json({ error: "Password update compilation error." });
            console.log(`🔒 Password successfully updated for account: ${email}`);
            return res.status(200).json({ message: "Password updated successfully! You can now log in." });
        });
    });
});
pool.getConnection((err, connection) => {
    if (err) {
        console.log("❌ Aiven MySQL connection failed:");
        console.log(err.message);
    } else {
        console.log("✅ Connected to Aiven MySQL!");
        connection.release();
    }
});
// Initialize Server listener state on Port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`🚀 Server successfully launched and listening active`);
    console.log(`🔗 Endpoint URL: http://localhost:${PORT}`);
    console.log(`===================================================`);
});
});