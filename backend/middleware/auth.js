const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/response');

const protect = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return sendError(res, 401, 'Not authorized, no token provided');
  }

  try {
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return sendError(res, 401, 'User no longer exists');
    }
    req.user = user;
    next();
  } catch {
    return sendError(res, 401, 'Token is invalid or has expired');
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return sendError(res, 403, `Role '${req.user.role}' is not permitted to access this resource`);
  }
  next();
};

module.exports = { protect, authorize };
