const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory')


const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
}


// Bulk actions
const getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find()

    res.status(200).json({
        status: 'success',
        results: users.length,
        data: { users }
    })
})

// remove this controller after development
const deleteAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.deleteMany()

    res.status(204).json({
        status: 'success',
        results: users.length,
        message: 'users have been deleted'
    })
})


// Sigle Item controlers
const getUserById = factory.getOne(User)

const getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
}


const updateUser = catchAsync(async (req, res, next) => {
    // Creates an error if the user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError('This route is not for password updates. Please use reset password feature.',
                400
            ))
    }

    // Filters out unwanted fields names that are note allowed to be updated
    filteredBody = filterObj(req.body, 'name', 'email');

    // Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    })
    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
})




const deleteUser = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false })

    res.status(204).json({
        status: 'success',
        data: null
    })
});



module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    deleteAllUsers,
    getMe
}