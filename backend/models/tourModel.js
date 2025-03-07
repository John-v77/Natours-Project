const { Schema, model } = require('mongoose');

const TourSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Add a name for Tours'],
        unique: true
    },
    rating: {
        type: Number,
        default: 4.5
    },
    price: {
        type: Number,
        required: [true, 'Add price for tour package'],
    },
})



exports.tourModel = model('Tour', TourSchema)
