const { Schema, model } = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');


const tourSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Add a name for Tours'],
        unique: true,
        maxlength: [40, 'A tour name must have less or equal then 40 characters'],
        minlength: [10, 'A tour name must have less or equal then 10 characters'],
        validate: function (strName) {
            return validator.isAlpha(strName, 'en-US', { ignore: ' ' });
        },
        message: 'Tour name must only contain characters and spaces'
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'a tour must have a duration'],
    },
    maxGroupSize: {
        type: String,
        required: [true, 'a tour must have a group size'],
    },
    difficulty: {
        type: String,
        required: [true, 'a tour must have a dificulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either: easy, medium, difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
        set: val => Math.round(val * 100) / 100
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'Add price for tour package'],
    },
    priceDiscount: {
        type: Number,
        validate: function (val) {
            // Important!
            // this only points to current doc on NEW document creation
            return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price'
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description'],

    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        // Geo JSON
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type:
            {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [{
        type: Schema.ObjectId,
        ref: 'User'
    }],
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    });


tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });


// Virtual fields - cannot query agains them. 
tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
})


// Important!
// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
})

// tourSchema.pre('save', function (next) {
//     console.log('Will save document'...);
//     next();
// })


// tourSchema.post('save', function (doc, next) {
//     console.log(doc);
//     next();
// })


// tourSchema.pre('save', async function (next) {
//     const guidesPromises = this.guides.map(async id => await User.findById(id));
//     this.guides = await Promise.all(guidesPromises);
//     next();
// })

tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } });
    this.start = Date.now();
    next();
})

tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
})

tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v -active'
    })
    next();
})



tourSchema.pre('aggregate', function (next) {

    const firstStage = this.pipeline()?.[0]
    if (!firstStage?.$geoNear) {
        // If the first stage is $geoNear, don't add $match before it
        this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
        console.log(this.pipeline());
    }
    return next();
});


tourSchema.post(/^find/, function (docs, next) {
    console.log(`Query took ${Date.now() - this.start} milliseconds!`)
    next();
})


const Tour = model('Tour', tourSchema)
module.exports = Tour;