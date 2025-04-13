const { Schema, model } = require('mongoose');

// const Tour = require('./tourModel');

const reviewSchema = new Schema({
  review: {
    type: String,
    required: [true, 'Review can not be empty!']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  tour: {
    type: Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Review must belong to a tour.']
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to a user']
  }
},
  {
    toJSON: { vituals: true },
    toObject: { virtuals: true }
  }
);

// reviewSchema.index({ tour: 1, user: 1 }, { unique: true });



reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'tour',
    select: 'name'
  }).populate({
    path: 'user',
    select: 'name photo'
  })
  next()
})

const Review = model('Review', reviewSchema);
module.exports = Review;

