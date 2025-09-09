const mongoose = require('mongoose');
const dotenv = require('dotenv');

//
//
//Handle uncaughtException
process.on('uncaughtException', error => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log('Error name:', error.name);
    console.log('Error message:', error.message);
    console.log('Stack trace:', error.stack);
    process.exit(1)
})


dotenv.config({ path: './config.env' });
const app = require('./app');
const DB = process.env.DATABASE

mongoose
    // .connect(process.env.DATABASE_LOCAL, {})
    .connect(DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log('DB connection successful!');
    })

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`)
})

process.on('unhandledRejection', error => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log('Error name:', error.name);
    console.log('Error message:', error.message);
    console.log('Stack trace:', error.stack);
    server.close(() => {
        process.exit(1)
    })
})

