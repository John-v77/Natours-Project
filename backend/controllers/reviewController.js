const Review = require('../models/reviewModel')
const catchAsync = require('../utils/catchAsync')
const factory = require('../controllers/handlerFactory')



const setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) { req.body.tour = req.params.tourId };
  if (!req.body.user) { req.body.user = req.user.id };
  next();
}

const getAllReviews = factory.getAll(Review)
const getReviewById = factory.getOne(Review);
const createReview = factory.createOne(Review);
const updateReview = factory.updateOne(Review);
const deleteReviewById = factory.deleteOne(Review);


module.exports = {
  getAllReviews,
  createReview,
  deleteReviewById,
  updateReview,
  setTourUserIds,
  getReviewById
}