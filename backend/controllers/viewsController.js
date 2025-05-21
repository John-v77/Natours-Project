const Tour = require("../models/tourModel")
const catchAsync = require("../utils/catchAsync")

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
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  })
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

module.exports = {
  getOverview,
  getTour,
  getLoginForm
}
