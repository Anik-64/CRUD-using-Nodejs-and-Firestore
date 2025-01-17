const admin = require('../../config/config');

// const authenticateToken = async (req, res, next) => {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//         return res.status(401).json({
//             error: true,
//             message: 'Unauthorized: Missing or invalid token',
//         });
//     }

//     const idToken = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

//     try {
//         // Verify the ID token
//         const decodedToken = await admin.auth().verifyIdToken(idToken);
//         req.user = decodedToken; // Attach user information to the request object

//         // Optional: Verify user existence in Firebase Auth
//         const userRecord = await admin.auth().getUser(decodedToken.uid);
//         if (!userRecord) {
//             return res.status(404).json({
//                 error: true,
//                 message: 'User not found in Firebase',
//             });
//         }

//         next(); // Proceed to the next middleware or route handler
//     } catch (error) {
//         console.error('Error verifying token:', error.message);
//         return res.status(401).json({
//             error: true,
//             message: 'Unauthorized: Invalid or expired token',
//         });
//     }
// };

// module.exports = authenticateToken ;


const authenticateFirebaseToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Expect 'Bearer <token>'
    if (!token) {
        return res.status(401).json({ 
            error: true, 
            message: 'Unauthorized access' 
        });
    }

    console.log(token);

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