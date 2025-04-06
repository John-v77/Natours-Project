const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const loginLimiter = require('../utils/rateLimiter')

router.post('/signup', authController.signup);
router.post('/login', loginLimiter, authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch('/updateMyPassword', authController.protect, authController.updatePassword);
router.patch('/updateMyInfo', authController.protect, userController.updateUser);
router.delete('/deleteMe', authController.protect, userController.deleteUser);

router
    .route('/')
    .get(userController.getAllUsers)
    .delete(userController.deleteAllUsers) // remove this route after development


router
    .route('/:id')
    .get(userController.getUserById)
    .patch(userController.updateUser)
    .delete(userController.deleteUser)


module.exports = router;