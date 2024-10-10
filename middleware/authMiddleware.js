const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();  // Load environment variables

exports.authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    console.log('No token found in request headers');
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    // Decode the token without verifying (for debugging)
    const decodedToken = jwt.decode(token);
    console.log('Decoded Token (for debugging):', decodedToken);

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('JWT verification success. Decoded token:', decoded);

    req.user = await User.findById(decoded.userId);
    if (!req.user) {
      console.log('User not found for decoded userId:', decoded.userId);
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    next();
  } catch (error) {
    console.error('Error verifying token:', error);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Unauthorized: Token expired' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    } else {
      return res.status(500).json({ message: 'Internal server error during token verification' });
    }
  }
};
