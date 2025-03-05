
//import modules
const express = require('express');
const tourRouter = require('./routes/tourRoutes')

const app = express();

//Routes
app.use('/', tourRouter)

//Server
const port = 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
})
