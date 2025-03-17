const mongoose = require('mongoose');
const dotenv = require('dotenv');

//
//
//Handle uncaughtException
process.on('uncaughtException', error => {
    console.log('Unhandled Exception! -- Shutting down ...')
    console.log(error.name, error.message);
    process.exit(1)
})


dotenv.config({ path: './config.env' });
const app = require('./app');
const DB = process.env.DATABASE

mongoose
    // .connect(process.env.DATABASE_LOCAL, {})
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: true,
        useUnifiedTopology: true
    }).then((con) => {
        // console.log(con.connections)
        console.log('DB connection successful!');
    })

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`)
})

process.on('unhandledRejection', error => {
    console.log(error.name, error.message);
    console.log('Unhandled Rejection! -- Shutting down ...')
    server.close(() => {
        process.exit(1)
    })
})

