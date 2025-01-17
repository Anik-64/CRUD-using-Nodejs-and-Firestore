const admin = require('../../config/config');

const authenticateFirebaseToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; 
    if (!token) {
        return res.status(401).json({ 
            error: true, 
            message: 'Unauthorized access' 
        });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (err) {
        console.error(err);
        res.status(403).json({ 
            error: true, 
            message: 'Invalid or expired token' 
        });
    }
};

module.exports = authenticateFirebaseToken;