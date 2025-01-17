const express = require('express');
const { commonMiddlewares, createRateLimiter } = require('../middleware/commonMiddleware');
const { body, validationResult } = require('express-validator');
const admin = require('../config/config');
const axios = require('axios');
require('dotenv').config();

const authRouter = express.Router();

// Security Middlewares
commonMiddlewares(authRouter);

// Rate Limiting
const authRouterLimiter = createRateLimiter();
authRouter.use(authRouterLimiter);

const db = admin.firestore();

// Auth
authRouter.post('/',
    [
        body('email')
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Invalid email address'),
        body('passphrase')
            .notEmpty().withMessage('Password is required')
            .isString().withMessage('Password must be a string')
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Map errors and return the first message
            const errorMessages = errors.array().map((err) => err.msg);
            return res.status(400).json({
                error: true,
                message: errorMessages[0],
            });
        }

        const { email, passphrase } = req.body;

        try {
            // Check if user already exists
            let duplicateChecking;
            try {
                duplicateChecking = await admin.auth().getUserByEmail(email);
            } catch (err) {
                if (err.code === 'auth/user-not-found') {
                    duplicateChecking = null; 
                } else {
                    throw err; 
                }
            }

            if (duplicateChecking) {
                return res.status(400).json({
                error: true,
                message: 'User already exists with this email.',
                });
            }

            // Add user data to Firestore auth
            const userRecord = await admin.auth().createUser({
                email,
                passphrase, 
                emailVerified: false,
                disabled: false
            });

            const userDocRef = await db.collection('users').doc(userRecord.uid);
            await userDocRef.set({
                email,
                firstname: null,
                lastname: null,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            // Generate a custom token for the newly created user
            const customToken = await admin.auth().createCustomToken(userRecord.uid);

            // Exchange custom token for an ID token
            const response = await axios.post(
                `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${process.env.FIREBASE_API_KEY}`,
                {
                    token: customToken,
                    returnSecureToken: true,
                }
            );

            const idToken = response.data.idToken;

            res.status(201).json({
                error: false,
                message: 'Successfully created user by Firebase',
                token: customToken,
                idToken
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ 
                error: true, 
                message: 'Failed to create user' 
            });
        }
    }
);

module.exports = authRouter;