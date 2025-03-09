const { Schema, model } = require('mongoose');

const TourSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Add a name for Tours'],
        unique: true
    },
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
    ratingAverate: {
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
})


const Tour = model('Tour', TourSchema)
module.exports = Tour;