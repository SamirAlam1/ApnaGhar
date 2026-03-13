const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 400, 'Name, email and password are required');
    }
    if (password.length < 6) {
      return sendError(res, 400, 'Password must be at least 6 characters');
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return sendError(res, 400, 'An account with this email already exists');
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone ? phone.trim() : '',
      role: ['buyer', 'seller'].includes(role) ? role : 'buyer',
    });

    const token = signToken(user._id);
    return sendSuccess(res, 201, 'Account created successfully', { token, user });
  } catch (err) {
    return sendError(res, 500, 'Registration failed, please try again');
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, 'Email and password are required');
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return sendError(res, 401, 'Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password');
    }

    const token = signToken(user._id);
    return sendSuccess(res, 200, 'Login successful', { token, user });
  } catch (err) {
    return sendError(res, 500, 'Login failed, please try again');
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  return sendSuccess(res, 200, 'Profile fetched', { user: req.user });
};
