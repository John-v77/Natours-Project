const Tour = require("../models/tourModel")
const catchAsync = require("../utils/catchAsync")
const AppError = require("../utils/appError")

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
    })
})


const getLoginForm = catchAsync(async (req, res) => {
  res.status(200)
    .set('Content-Security-Policy', "frame-src 'self'")
    .render('login', {
      title: `Login into your account`,
    })
})



const getAccount = catchAsync(async (req, res) => {
  res.status(200)
    .set('Content-Security-Policy', "frame-src 'self'")
    .render('account', {
      title: `Your account`,
    })
}
)

module.exports = {
  getOverview,
  getTour,
  getLoginForm,
  getAccount
}
