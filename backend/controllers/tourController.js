const Tour = require('../models/tourModel');
const colors = require('colors')

// Bulk actions

const getAllTours = async (req, res) => {
    try {
        const tours = await Tour.find()
        console.log(tours, 'tours'.blue)
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
    console.log(req.body, "body".red)

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

const getTourById = (req, res) => {
    console.log(req.params)
    res.status(200).send('get tour by ID');
}


const updateTourPackage = (req, res) => {
    console.log(req.params)
    res.status(200).send('updating tour by ID');
}


const deleteTourPackage = (req, res) => {
    console.log(req.params)
    res.status(204).send('delete tour by ID');
}



module.exports = {
    getAllTours,
    createTour,
    getTourById,
    updateTourPackage,
    deleteTourPackage
}