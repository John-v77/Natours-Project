const jwt = require('jsonwebtoken');
const User = require('../../models/userModel');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'test-secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d',
  });
};

const createTestUser = async (userData = {}) => {
  const defaultUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    passwordConfirm: 'password123',
    ...userData,
  };

  const user = await User.create(defaultUser);
  const token = signToken(user._id);
  
  return { user, token };
};

const createAdminUser = async () => {
  return createTestUser({
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
  });
};

const createGuideUser = async () => {
  return createTestUser({
    name: 'Guide User',
    email: 'guide@example.com',
    role: 'guide',
  });
};

module.exports = {
  signToken,
  createTestUser,
  createAdminUser,
  createGuideUser,
};