const Tour = require('../models/tourModel');
const colors = require('colors')
// Need to write documentation on api

// Bulk actions

const getAllTours = async (req, res) => {
    try {
        // Filtering
        const queryObj = { ...req.query }
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);


        // Advanced filtering
        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)

        let toursQueried = Tour.find(JSON.parse(queryStr))

        // Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ')
            toursQueried = toursQueried.sort(sortBy)
        } else {
            toursQueried = toursQueried.sort('-createdAt')
        }


        // Field limiting
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ')
            toursQueried = toursQueried.select(fields)
        } else {
            toursQueried = toursQueried.select('-__v')
        }


        // Pagination
        const page = req.query.page * 1 || 1;
        const limitNo = req.query.limit * 1 || 20;
        const skipNo = (page - 1) * limitNo;

        if (req.query.page) {
            const numTours = await Tour.countDocuments();
            if (skip >= numTours) throw new Error('This page does not exists');
        }

        toursQueried = toursQueried.skip(skipNo).limit(limitNo);

        const tours = await toursQueried

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
    deleteTourPackage
}