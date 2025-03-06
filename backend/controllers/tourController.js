const fs = require('fs');

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
)


// Bulk actions

const getAllTours = (req, res) => {
    console.log(req.params)
    res.status(200).send(tours);
}


// Sigle Item controlers

const createTour = (req, res) => {
    console.log(req.body)
    res.status(201).send('Creating tour');
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