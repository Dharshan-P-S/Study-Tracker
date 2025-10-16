import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  let token;

  // Check for the token in the authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (e.g., "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using your secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user by the ID from the token and attach it to the request object
      // We exclude the password from being attached
      req.user = await User.findById(decoded.id).select('-password');

      // Move on to the next function (the actual route controller)
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
      return; // Use return to stop further execution
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export { protect };