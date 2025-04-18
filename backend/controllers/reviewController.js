const Review = require('../models/reviewModel')
const catchAsync = require('../utils/catchAsync')
const factory = require('../controllers/handlerFactory')

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

const setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) { req.body.tour = req.params.tourId };
  if (!req.body.user) { req.body.user = req.user.id };
  next();
}

const createReview = factory.createOne(Review);
const updateReview = factory.updateOne(Review);
const deleteReviewById = factory.deleteOne(Review);


module.exports = {
  getAllReviews,
  createReview,
  deleteReviewById,
  updateReview,
  setTourUserIds
}