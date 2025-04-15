const Tour = require('../models/tourModel');
const catchAsync = require('./../utils/catchAsync')
const APIFeatures = require('../utils/apiFeatures')
const AppError = require('../utils/appError');
const factory = require('../controllers/handlerFactory')

// Need to write documentation on api


// Bulk actions
const aliasTopTours = (req, res, next) => {
    try {
        req.query.limit = '5';
        req.query.sort = '-ratingsAverate, price';
        req.query.fields = 'name, price, ratingsAverate, summary, difficulty';
        next()
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
}

const getAllTours = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .paginate();

    const tours = await features.query

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: { tours }
    })

})

// Sigle Item controlers
const createTour = catchAsync(async (req, res, next) => {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            tour: newTour
        }
    });
});

const getTourById = catchAsync(async (req, res, next) => {
    const searchedTour = await Tour.findById(req.params.id).populate('reviews');

    if (!searchedTour) {
        return next(new AppError('No tour found with that ID', 404))
    }
    res.status(200).json({
        status: 'success',
        data: { tour: searchedTour }
    })

});


const updateTourPackage = catchAsync(async (req, res, next) => {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        status: 'success',
        data: { tour: updatedTour }
    })
})


const getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        // {
        //     $match: { ratingsAverage: { $gte: 4.5 } }
        // },
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
                num: { $sum: 1 },
                numRatings: { $sum: '$ratingQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $min: '$price' }
            }
        },
        { $sort: { avgPrice: 1 } },
        { $match: { _id: { $ne: 'EASY' } } }

    ]);
    res.status(200).json({
        status: 'success',
        data: { stats }
    })
})


const getMonthlyPlan = catchAsync(async (req, res, next) => {

    const year = req.params.year * 1

    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: {
                _id: 0
            }
        },
        {
            $sort: { numTourStarts: -1 }
        },
        {
            $limit: 6
            // only show first 6 month in results.
        }
    ]);
    res.status(200).json({
        status: 'success',
        data: { plan }
    })
})

console.log(factory, "factory".red)

const deleteTourPackage = factory.deleteOne(Tour);


module.exports = {
    getAllTours,
    createTour,
    getTourById,
    updateTourPackage,
    deleteTourPackage,
    aliasTopTours,
    getTourStats,
    getMonthlyPlan
}