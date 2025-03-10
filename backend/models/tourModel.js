const { Schema, model } = require('mongoose');
const slugify = require('slugify')

const tourSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Add a name for Tours'],
        unique: true
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
    },
    ratingsAverate: {
        type: Number,
        default: 4.5
    },
    ratingQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'Add price for tour package'],
    },
    priceDiscount: Number,
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
    startDates: [Date]
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    });

// Virtual fields - cannot query agains them. 
tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
})

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


const Tour = model('Tour', tourSchema)
module.exports = Tour;