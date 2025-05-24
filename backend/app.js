
//import modules
const express = require('express');
const morgan = require('morgan');

const rateLimit = require('express-rate-limit');
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean')
const hpp = require('hpp')
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError')
const GlobalErrorHandler = require('./controllers/errorController')

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewsRoutes');
const viewRouter = require('./routes/viewRoutes');

const path = require('path');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, './views'))

// Serves static files
app.use(express.static(path.join(__dirname, 'public')));


// Global Middleware


// Customize Helmet's Content Security Policy
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "script-src": ["'self'"], // Allow scripts from same origin
      // Optional: Allow scripts from specific external domains or add hashes
      "script-src": ["'self'", "'unsafe-inline'", "'sha256-...'", "https://api.mapbox.com/mapbox-gl-js/v0.54.0/mapbox-gl.js"],
      "script-src": ["'self'", "'unsafe-inline'", "'sha256-...'", "https://api.mapbox.com/mapbox-gl-js/v0.54.0/mapbox-gl.css"],
    },
  })
);

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
app.use(cookieParser());




// Data satitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevents parameter polution
app.use(hpp(
  {
    whitelist: [
      'duration',
      'ratingAverage',
      'ratingsQuantity',
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
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
})

app.use(GlobalErrorHandler)

module.exports = app;
