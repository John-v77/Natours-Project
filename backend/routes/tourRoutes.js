const express = require('express');
const router = express.Router();

const tourController = require('../controllers/tourController');


router
    .route('/top-5-cheap')
    .get(tourController.aliasTopTours, tourController.getAllTours)

router
    .route('/tour-stats')
    .get(tourController.getTourStats)

router
    .route('/monthly-plan/:year')
    .get(tourController.getMonthlyPlan)

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