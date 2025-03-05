const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tourController')

router.route('/')
.get(tourController.testController)

module.exports = router;