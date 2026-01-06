const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    console.error('No Authorization header provided');
    return res.status(401).json({ error: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    console.error('No token found in Authorization header');
    return res.status(401).json({ error: 'Token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded JWT in authenticateToken:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const authenticateAdminOrKey = (req, res, next) => {
  const adminKey = req.headers['admin-key'];
  const authHeader = req.headers['authorization'];

  // Check for admin-key: food123
  if (adminKey === 'food123') {
    console.log('Authenticated via admin-key');
    req.user = { role: 'admin' }; // Set user object to mimic admin role
    return next();
  }

  // If no admin-key, check for JWT token
  if (!authHeader) {
    console.error('No Authorization header or admin-key provided');
    return res.status(401).json({ error: 'Authorization header or admin-key missing' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    console.error('No token found in Authorization header');
    return res.status(401).json({ error: 'Token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded JWT in authenticateAdminOrKey:', decoded);
    if (decoded.role !== 'admin') {
      console.error('Non-admin user attempted admin access:', decoded);
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = {
  authenticateAdminOrKey,
  authenticateToken
};