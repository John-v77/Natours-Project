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
  res.status(200).render('tour', {
    title: 'The forest Hiker Tour',
    tour: tour
  })
})

module.exports = {
  getOverview,
  getTour
}
