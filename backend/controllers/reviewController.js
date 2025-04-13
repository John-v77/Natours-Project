const Review = require('../models/reviewModel')
const catchAsync = require('../utils/catchAsync')

const getAllReview = catchAsync(async (req, res, next) => {
  const allReviews = await Review.find()

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
  getAllReview,
  createReview
}