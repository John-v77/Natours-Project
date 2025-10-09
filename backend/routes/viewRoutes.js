const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/', authController.isLoggedIn, viewsController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/signup', authController.isLoggedIn, viewsController.getSignupForm);
router.get('/me', authController.protect, viewsController.getAccount);
router.get('/settings', authController.protect, viewsController.getSettings);
router.get('/my-bookings', authController.protect, viewsController.getMyBookings);
router.get('/my-reviews', authController.protect, viewsController.getMyReviews);
router.get('/billing', authController.protect, viewsController.getBilling);
router.get('/building-in-progress', viewsController.getBuildingInProgress);

router.post('/submit-user-data', authController.protect, viewsController.updateUserData);

module.exports = router;
