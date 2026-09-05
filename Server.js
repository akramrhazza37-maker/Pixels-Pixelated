const express = require('express');
const app = express();
const path = require('path');

// This allows your server to "see" and send dashboard.html
app.use(express.static(path.join(__dirname))); 

// If you need a specific route:
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});
require('dotenv').config({ path: './test.env' });

console.log("DB_PASSWORD Loaded:", process.env.DB_PASSWORD ? "Yes" : "No");

const mysql = require('mysql2');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});


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


// ROUTE 1: Handle User Signup Form Data
app.post('/signup', (req, res) => {
    const { username, email, password } = req.body;

    const verificationCode =
        Math.floor(1000 + Math.random() * 9000).toString();

    const sqlQuery =
        'INSERT INTO users (username, email, password, verification_code) VALUES (?, ?, ?, ?)';

    bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
        if (hashErr) {
            return res.status(500).json({
                error: "Password encryption failed."
            });
        }

        pool.query(
            sqlQuery,
            [username, email, hashedPassword, verificationCode],
            async (err, result) => {

                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        if (err.message.includes('username')) {
                            return res.status(400).json({
                                error: "This username is already taken."
                            });
                        } else {
                            return res.status(400).json({
                                error: "This email address is already registered."
                            });
                        }
                    }

                    console.error("Database Save Error:", err.message);

                    return res.status(500).json({
                        error: "Failed to store user details."
                    });
                }

                // Send verification email
                try {
                    await transporter.sendMail({
                        from: process.env.EMAIL_USER,
                        to: email,
                        subject: "Your verification code",
                        text: `Your verification code is: ${verificationCode}`
                    });

                    console.log(`Verification code sent to ${email}`);

                    res.status(200).json({
                        message: "Signup successful!",
                        email: email
                    });

                } catch (emailError) {
                    console.error("Email error:", emailError);

                    res.status(500).json({
                        error: "Account created, but verification email failed."
                    });
                }
            }
        );
    });
});

// ROUTE 2: Handle User Login Form Data (Updated to use bcrypt.compare)
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sqlQuery = 'SELECT * FROM users WHERE email = ?';

    pool.query(sqlQuery, [email], (err, results) => {
        if (err) {
            console.error("❌ Database Authentication Error:", err.message);
            return res.status(500).json({ error: "Server authentication error." });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: "Invalid email or password mismatch." });
        }

        const user = results[0];

        bcrypt.compare(password, user.password, (bcryptErr, match) => {
            if (bcryptErr || !match) {
                return res.status(401).json({ error: "Invalid email or password mismatch." });
            }

            console.log(`🔓 User logged in successfully: ${email}`);
            return res.status(200).json({ message: "Login verified successfully! Welcome back." });
        });
    });
});

app.post('/verify-code', (req, res) => {
    const { email, code } = req.body;

    const sql = 'SELECT verification_code FROM users WHERE email = ?';

    pool.query(sql, [email], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                error: "Database error."
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                error: "User not found."
            });
        }

        const savedCode = results[0].verification_code;

        // Compare the code from the user with the code in MySQL
        if (String(code) === String(savedCode)) {

            // Codes match!
            pool.query(
                'UPDATE users SET verified = TRUE WHERE email = ?',
                [email],
                (updateErr) => {
                    if (updateErr) {
                        console.error(updateErr);
                        return res.status(500).json({
                            error: "Could not verify account."
                        });
                    }

                    res.json({
                        verified: true,
                        message: "Verification successful!"
                    });
                }
            );

        } else {

            // Codes don't match
            res.status(400).json({
                verified: false,
                error: "Incorrect verification code."
            });
        }
    });
});

app.post("/resend-code", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required." });
    }

    // Generate a new 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    try {
        // Update the user's verification code
        await db.promise().query(
            "UPDATE users SET verification_code = ? WHERE email = ?",
            [code, email]
        );

        // Send the new code
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your new verification code",
            text: `Your new verification code is: ${code}`
        });

        console.log(`Verification code resent to ${email}`);

        res.json({ message: "Verification code resent!" });

    } catch (error) {
        console.error("Resend email error:", error);

        res.status(500).json({
            error: "Could not resend verification code."
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`🚀 Server successfully launched and listening active`);
    console.log(`🔗 Endpoint URL: http://localhost:${PORT}`);
    console.log(`===================================================`);
});