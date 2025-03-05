const fs = require('fs');

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
)

const getAllTours = (req, res) => {
    res.status(200).send(tours);
}



module.exports = {
    getAllTours,
}