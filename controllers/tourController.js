exports.testController = (req, res) => {
    console.log(req)
    res.status(200).send('Hello fromm the server side! - controller');  
}    