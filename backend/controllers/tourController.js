const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures')
const colors = require('colors')
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

const getAllTours = async (req, res) => {
    try {
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
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
}


// Sigle Item controlers
const createTour = async (req, res) => {

    try {
        const newTour = await Tour.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        })

    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        })
    }
}

const getTourById = async (req, res) => {
    try {
        const searchedTour = await Tour.findById(req.params.id)

        res.status(200).json({
            status: 'success',
            data: { tour: searchedTour }
        })
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
}


const updateTourPackage = async (req, res) => {
    try {
        const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        })

        res.status(200).json({
            status: 'success',
            data: { tour: updatedTour }
        })
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
}


const deleteTourPackage = async (req, res) => {
    try {
        await Tour.findByIdAndRemove(req.params.id)

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
}


module.exports = {
    getAllTours,
    createTour,
    getTourById,
    updateTourPackage,
    deleteTourPackage,
    aliasTopTours
}