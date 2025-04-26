const { Schema, model } = require('mongoose');
const Tour = require('./tourModel');

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

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });



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


reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  console.log(stats, 'Stats'.bgCyan)
  if (stats.length > 0) {

    const updatedTour = await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
    console.log(updatedTour, 'Stats'.bgRed)
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }

};


// reviewSchema.pre(/^findOneAnd/, async function (next) {
//   const rev = await this.findOne();
//   console.log('rev')
// })

reviewSchema.post('save', function () {
  // this points to current review
  this.constructor.calcAverageRatings(this.tour);
})


reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.docZ = await this.findOne();
  console.log(docZ)
  next();
})

reviewSchema.post(/^findOneAnd/, async function () {
  await this.docZ.constructor.calcAverageRatings(this.docZ.tour)
})


const Review = model('Review', reviewSchema);
module.exports = Review;

