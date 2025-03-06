const express = require('express');
const router = express.Router();

const tourController = require('../controllers/tourController');

router
    .route('/')
    .get(tourController.getAllTours)
    .post(tourController.createTour)


router
    .route('/:id')
    .get(tourController.getTourById)
    .patch(tourController.updateTourPackage)
    .delete(tourController.deleteTourPackage)


module.exports = router;