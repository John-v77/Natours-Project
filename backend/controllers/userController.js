const fs = require('fs');

const users = JSON.parse(
    fs.readFileSync(`${__dirname}/../dev-data/data/users.json`)
)


// Bulk actions

const getAllUsers = (req, res) => {
    console.log(req.params)
    res.status(200).send(users);
}


// Sigle Item controlers

const createUser = (req, res) => {
    console.log(req.body)
    res.status(201).send('Creating User');
}

const getUserById = (req, res) => {
    console.log(req.params)
    res.status(200).send('get User by ID');
}


const updateUserPackage = (req, res) => {
    console.log(req.params)
    res.status(200).send('updating User by ID');
}


const deleteUserPackage = (req, res) => {
    console.log(req.params)
    res.status(204).send('delete User by ID');
}



module.exports = {
    getAllUsers,
    createUser,
    getUserById,
    updateUserPackage,
    deleteUserPackage
}