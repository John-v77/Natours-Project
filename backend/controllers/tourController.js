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
        req.query.sort = '-ratingsAverage, price';
        req.query.fields = 'name, price, ratingsAverage, summary, difficulty';
        next()
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
}


const getToursWithin = catchAsync(async (req, res, next) => {

    console.log("tours within".bgRed)
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;



    if (!lat || !lng) {
        next(
            new AppError(
                'Please provide latitude and longitude in the format lat,lng.',
                400
            )
        );
    }

    const tours = await Tour.find({
        startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    });

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: { data: tours }
    });

    // /tours-within?distance=233&center=-40,45&unit=mi
    // /tours-within/233/center/-40,45/unit/mi
});


// Sigle Item controlers
const getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        // {
        //     $match: { ratingsAverage: { $gte: 4.5 } }
        // },
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
                num: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
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

const getAllTours = factory.getAll(Tour);
const getTourById = factory.getOne(Tour, { path: 'reviews' });
const createTour = factory.createOne(Tour);
const updateTourPackage = factory.updateOne(Tour);
const deleteTourPackage = factory.deleteOne(Tour);


module.exports = {
    getAllTours,
    createTour,
    getTourById,
    updateTourPackage,
    deleteTourPackage,
    aliasTopTours,
    getTourStats,
    getMonthlyPlan,
    getToursWithin
}