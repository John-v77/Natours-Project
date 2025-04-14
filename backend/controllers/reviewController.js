const Review = require('../models/reviewModel')
const catchAsync = require('../utils/catchAsync')

const getAllReviews = catchAsync(async (req, res, next) => {

  let filter = {}
  if (req.params.tourId) { filter = { tour: req.params.tourId } };
  const allReviews = await Review.find(filter)

  res.status(200).json({
    status: 'success',
    results: allReviews.length,
    data: {
      allReviews
    }
  });
})


const createReview = catchAsync(async (req, res, next) => {

  console.log("create review".bgRed)
  const newReview = Review.create(req.body)

  res.status(201).json({
    status: 'success',
    data: {
      newReview
    }
  });
})


module.exports = {
  getAllReviews,
  createReview
}