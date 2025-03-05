
//import modules
const express = require('express');

const tourRouter = require('./routes/tourRoutes')

const app = express();

//Routes
app.use('/api/v1/tours', tourRouter)

module.exports = app;
