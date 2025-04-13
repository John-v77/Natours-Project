
//import modules
const express = require('express');
const morgan = require('morgan');

const rateLimit = require('express-rate-limit');
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean')
const hpp = require('hpp')

const AppError = require('./utils/appError')
const GlobalErrorHandler = require('./controllers/errorController')

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewsRoutes');

const app = express();


// Global Middleware

app.use(helmet())


if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}


const globalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 100, // Max 100 attempts
  message: 'Too many login attempts, please try again after an hour',
});

app.use('/api', globalLimiter);


// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Serves static files
app.use(express.static(`{__dirname}/public`));


// Data satitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevents parameter polution
app.use(hpp(
  {
    whitelist: [
      'duration',
      'ratingAverate',
      'ratingQuantity',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  }
));

// Test Middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.headers)
  next();
})


//Routes
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
})

app.use(GlobalErrorHandler)

module.exports = app;
