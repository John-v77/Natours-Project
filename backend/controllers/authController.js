const jwt = require('jsonwebtoken')
//jwt.io
const User = require('./../models/userModel')
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const { promisify } = require('util');
const colors = require('colors');


const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
}


const signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role,
    passwordConfirm: req.body.passwordConfirm
  });

  const token = await signToken(newUser._id);


  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  })

})



/////////////////////// 
// 1) Login Controller
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exists=
  if (!email || !password) {
    next(new AppError('Please provide email and password!'), 400);
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !await user.correctPassword(password, user.password)) {
    return next(new AppError('Incorrect email or password', 401))
  }

  // 3) If everything is ok, send token to client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token
  })
})



//////////////////////// 
// 2) Protect Controller
const protect = catchAsync(async (req, res, next) => {
  // 1) get token and check if it is there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];

  }
  if (!token) {
    return next(
      new AppError('You are not logged in!')
    )
  }

  // 2) verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);


  // 3) Check if user still exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError(
        'The user beloging to this token no longer exists.', 401
      )
    )
  }

  // 4) Check if user changed password after the token was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('password recently changed! Please login in again.', 401)
    );
  }
  // Grant Access to protected route
  req.user = freshUser
  next();
})


//////////////////////// 
// 2) RestrictTo Controller

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403))
    }

    next();
  }
}

module.exports = {
  signup,
  login,
  protect,
  restrictTo
}
