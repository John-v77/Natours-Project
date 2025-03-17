
//import modules
const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError')
const GlobalErrorHandler = require('./utils/errorController')

const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')

const app = express();


app.use(morgan('dev'))
app.use(express.json());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
})


//Routes
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
})

app.use(GlobalErrorHandler)

module.exports = app;
