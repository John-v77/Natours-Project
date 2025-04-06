
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 5, // Max 5 attempts per IP
  message: 'Too many login attempts, please try again after an hour',
  handler: (req, res, next, options) => {
    res.status(options.statusCode).send(options.message);
  },
  keyGenerator: (req, res) => {
    return req.ip;
  },
});

module.exports = loginLimiter