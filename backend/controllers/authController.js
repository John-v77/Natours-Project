const jwt = require('jsonwebtoken')
//jwt.io
const crypto = require('crypto')
const User = require('./../models/userModel')
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const { promisify } = require('util');
const Email = require('../utils/email');


const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
}

const createSendTaken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions)

  user.password = undefined

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user }
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

  const url = `${req.protocol}://${req.get('host')}/me`;
  // await new Email(newUser, `${req.protocol}://${req.get('host')}/`).sendWelcome();
  await new Email(newUser, url).sendWelcome();

  createSendTaken(newUser, 201, res)
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
  createSendTaken(user, 200, res)
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

  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
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
  res.locals.user = freshUser; // for views
  next();
})



/////////////////////////// 
// 3) RestrictTo Controller
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403))
    }

    next();
  }
}



const isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

      // 2) Check if user still exists
      const freshUser = await User.findById(decoded.id);
      if (!freshUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (freshUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // There is a logged in user
      res.locals.user = freshUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
}




///////////////////////////////
// 4) ForgotPassword Controller
const forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POST email
  const user = await User.findOne({ email: req.body.email })
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }
  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false })

  try {
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token send to email!'
    })
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false })

    return next(new AppError('There was an error sending the email. Try again later!'), 500)
  }
})



///////////////////////////////
// 5) resetPassword Controller
const resetPassword = catchAsync(async (req, res, next) => {

  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }


  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save({ validateBeforeSave: false });

  //  3) Update changePasswordAt property for the user
  //  4) Log the user in, send JWT
  createSendTaken(user, 200, res)
})



const updatePassword = catchAsync(async (req, res, next) => {

  // Get user from colection
  const user = await User.findById(req.user._id).select('+password');



  // Check if POSTed current password
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }
  // If so update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // Login user, send JWT
  createSendTaken(user, 200, res);

})


const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    status: 'success'
  });
}

module.exports = {
  signup,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
  isLoggedIn,
  logout
}
