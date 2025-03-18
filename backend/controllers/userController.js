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
const getUserById = (req, res) => {
    console.log(req.params)
    res.status(200).send('get User by ID');
}


const updateUser = (req, res) => {
    console.log(req.params)
    res.status(200).send('updating User by ID');
}


const deleteUser = (req, res) => {
    console.log(req.params)
    res.status(204).send('delete User by ID');
}



module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
}