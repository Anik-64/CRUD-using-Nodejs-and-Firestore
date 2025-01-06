const express = require('express');
const { commonMiddlewares, createRateLimiter } = require('../middleware/commonMiddleware');
const { body, param, validationResult } = require('express-validator');
const xss = require('xss');
const bcrypt = require('bcrypt');
const admin = require('../config/config');

const userRouter = express.Router();

// Security Middlewares
commonMiddlewares(userRouter);

// Rate Limiting
const userRouterLimiter = createRateLimiter();
userRouter.use(userRouterLimiter);

const db = admin.firestore();

// Create user
userRouter.post('/',
    [
        body('email')
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Invalid email address'),
        body('firstname')
            .notEmpty().withMessage('First name is required')
            .isString().withMessage('First name must be a string')
            .trim().escape()
            .isLength({ max: 127 }).withMessage('First name must be at most 127 characters long')
            .matches(/^[A-Za-z. ]+$/).withMessage('First name can contain only letters, periods, and spaces')
            .customSanitizer(value => {
                return xss(
                    value.split(' ')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')
                );
            }),
        body('lastname')
            .optional()
            .isString().withMessage('Last name must be a string')
            .trim().escape()
            .isLength({ max: 127 }).withMessage('Last name must be at most 127 characters long')
            .matches(/^[a-zA-Z ]+$/).withMessage('First name must contain only alphabetic characters')
            .customSanitizer(value => {
                return xss(
                    value.split(' ')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')
                );
            }),
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

        const { email, firstname, lastname, passphrase } = req.body;

        try {
            // Hash the password
            const hashedPassword = await bcrypt.hash(passphrase, 10);

            // Add user data to Firestore
            const userRef = await db.collection('users').add({
                email,
                firstname,
                lastname: lastname || null,
                passphrase: hashedPassword, 
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            res.status(201).json({
                error: false,
                message: 'Successfully created user',
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

// Get all users
userRouter.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('users').get();
        const users = snapshot.docs.map(doc => ({ 
            id: doc.id, ...doc.data() 
        }));

        res.status(200).json({ 
            error: false, 
            data: users 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ 
            error: true, 
            message: 'Failed to fetch users' 
        });
    }
});

// Get user by ID
userRouter.get('/:id', 
    [
        param('id')
            .isString().withMessage('ID must be a string')
            .trim().escape()
            .isLength({ max: 20 }).withMessage('ID must be at most 20 characters long')
            .customSanitizer(value => xss(value)),
    ],
    async (req, res) => {
        const { id } = req.params;

        try {
            const userRef = db.collection('users').doc(id);
            const doc = await userRef.get();

            if (!doc.exists) {
                return res.status(404).json({ 
                    error: true, 
                    message: 'User not found' 
                });
            }

            res.status(200).json({ 
                error: false, 
                data: { id: doc.id, ...doc.data() } 
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ 
                error: true,
                message: 'Failed to fetch user' 
            });
        }
    }
);

// Update user
userRouter.put('/:id',
    [
        param('id')
            .isString().withMessage('ID must be a string')
            .trim().escape()
            .isLength({ max: 20 }).withMessage('ID must be at most 20 characters long')
            .customSanitizer(value => xss(value)),
        body('email')
            .optional()
            .isEmail().withMessage('Invalid email address'),
        body('firstname')
            .optional()
            .isString().withMessage('First name must be a string')
            .trim().escape()
            .isLength({ max: 127 }).withMessage('First name must be at most 127 characters long')
            .matches(/^[A-Za-z. ]+$/).withMessage('First name can contain only letters, periods, and spaces')
            .customSanitizer(value => {
                return xss(
                    value.split(' ')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')
                );
            }),
        body('lastname')
            .optional()
            .isString().withMessage('Last name must be a string')
            .trim().escape()
            .isLength({ max: 127 }).withMessage('Last name must be at most 127 characters long')
            .matches(/^[a-zA-Z ]+$/).withMessage('First name must contain only alphabetic characters')
            .customSanitizer(value => {
                return xss(
                    value.split(' ')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')
                );
            }),
        body('passphrase')
            .optional()
            .isString().withMessage('Password must be a string')
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    ],
    async (req, res) => {
        const { id } = req.params;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(err => err.msg);
            return res.status(400).json({ 
                error: true, 
                message: errorMessages[0] 
            });
        }

        try {
            const userRef = db.collection('users').doc(id);
            const doc = await userRef.get();

            if (!doc.exists) {
                return res.status(404).json({ 
                    error: true, 
                    message: 'User not found' 
                });
            }

            const updatedData = { ...req.body, updatedAt: admin.firestore.FieldValue.serverTimestamp() };
            await userRef.update(updatedData);

            const updatedUser = await userRef.get();
            res.status(200).json({ 
                error: false, 
                message: 'User updated successfully', 
                data: { id: updatedUser.id, ...updatedUser.data() } 
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ 
                error: true, 
                message: 'Failed to update user' 
            });
        }
    }
);

// Delete user
userRouter.delete('/:id',
    [
        param('id')
            .isString().withMessage('ID must be a string')
            .trim().escape()
            .isLength({ max: 20 }).withMessage('ID must be at most 20 characters long')
            .customSanitizer(value => xss(value)),
    ],
    async (req, res) => {
        const { id } = req.params;

        try {
            const userRef = db.collection('users').doc(id);
            const doc = await userRef.get();

            if (!doc.exists) {
                return res.status(404).json({ 
                    error: true, 
                    message: 'User not found' 
                });
            }

            await userRef.delete();
            res.status(200).json({ 
                error: false, 
                message: 'User deleted successfully' 
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ 
                error: true, 
                message: 'Failed to delete user' 
            });
        }
    }
);

module.exports = userRouter;