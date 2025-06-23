const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const loginLimiter = require('../utils/rateLimiter')


const router = express.Router();


router.post('/signup', authController.signup);
router.get('/logout', loginLimiter, authController.logout);
router.post('/login', loginLimiter, authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Protect all routes after this middleware
router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);
router.patch('/updateMyInfo', userController.uploadUserPhoto, userController.resizeUserPhoto, userController.updateUser);
router.delete('/deleteMe', userController.deleteUser);
router.get('/me',
    userController.getMe,
    userController.getUserById
);


router.use(authController.restrictTo('admin'));

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