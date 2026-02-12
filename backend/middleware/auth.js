const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY || 'super-secret-key';

const authenticateToken = (req) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) return null;

    try {
        return jwt.verify(token, SECRET_KEY);
    } catch (err) {
        return null;
    }
};

module.exports = { authenticateToken, SECRET_KEY };