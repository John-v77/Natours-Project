const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser)


router
    .route('/:id')
    .get(userController.getUserById)
    .patch(userController.updateUserPackage)
    .delete(userController.deleteUserPackage)


module.exports = router;