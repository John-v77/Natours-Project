
//import modules
const express = require('express');
const morgan = require('morgan');

const rateLimit = require('express-rate-limit');

const AppError = require('./utils/appError')
const GlobalErrorHandler = require('./controllers/errorController')

const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')

const app = express();


// Global Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}


const globalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 100, // Max 100 attempts
  message: 'Too many login attempts, please try again after an hour',
});

app.use('/api', globalLimiter);

app.use(express.json());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.headers)
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
