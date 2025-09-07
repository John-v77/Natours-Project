const Tour = require("../models/tourModel")
const catchAsync = require("../utils/catchAsync")
const AppError = require("../utils/appError");
const User = require("../models/userModel");
const Booking = require("../models/bookingModel");
const Review = require("../models/reviewModel");

const getOverview = catchAsync(async (req, res, next) => {
  // Get tour data from colection
  const tours = await Tour.find();
  // Build Template

  // Render that template using tour data from 1)
  res.status(200).render('overview', {
    title: 'All tours',
    tours: tours
  })
})

const getTour = catchAsync(async (req, res, next) => {
  // 1) Get the data, for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name', 404))
  }

  // 2) Build template
  // 3) Render template using data from 1)
  res.status(200)
    .set('Content-Security-Policy', "frame-src 'self'")
    .render('tour', {
      title: `${tour.name} Tour`,
      tour: tour
    });
});

const getAccount = catchAsync(async (req, res) => {
  res.status(200)
    .set('Content-Security-Policy', "frame-src 'self'")
    .render('account', {
      title: `Your account`,
    });
});

const updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    });

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser
  });
});

const getLoginForm = catchAsync(async (req, res) => {
  res.status(200)
    .set('Content-Security-Policy', "frame-src 'self'")
    .render('login', {
      title: `Login into your account`,
    });
});


const getSignupForm = catchAsync(async (req, res) => {
  res.status(200)
    .set('Content-Security-Policy', "frame-src 'self'")
    .render('signup', {
      title: `Create your account`,
    });
});

const getMyBookings = catchAsync(async (req, res, next) => {
  // 1) Find all bookings for the current user
  const bookings = await Booking.find({ user: req.user.id }).populate({
    path: 'tour',
    select: 'name slug imageCover startDates duration difficulty'
  });

  res.status(200)
    .set('Content-Security-Policy', "frame-src 'self'")
    .render('my-bookings', {
      title: 'My Bookings',
      bookings
    });
});

const getMyReviews = catchAsync(async (req, res, next) => {
  // 1) Find all reviews for the current user
  const reviews = await Review.find({ user: req.user.id }).populate({
    path: 'tour',
    select: 'name slug imageCover duration'
  });

  res.status(200)
    .set('Content-Security-Policy', "frame-src 'self'")
    .render('my-reviews', {
      title: 'My Reviews',
      reviews
    });
});

const getSettings = catchAsync(async (req, res) => {
  res.status(200)
    .set('Content-Security-Policy', "frame-src 'self'")
    .render('settings', {
      title: 'Account Settings'
    });
});

const getBilling = catchAsync(async (req, res) => {
  // 1) Get user's bookings for payment history
  const payments = await Booking.find({ user: req.user.id }).populate({
    path: 'tour',
    select: 'name'
  });

  // 2) Calculate totals
  const totalSpent = payments.reduce((sum, payment) => sum + payment.price, 0);
  const totalBookings = payments.length;

  res.status(200)
    .set('Content-Security-Policy', "frame-src 'self'")
    .render('billing', {
      title: 'Billing Information',
      payments,
      totalSpent,
      totalBookings
    });
});

module.exports = {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
  updateUserData,
  getSignupForm,
  getMyBookings,
  getMyReviews,
  getSettings,
  getBilling
}
