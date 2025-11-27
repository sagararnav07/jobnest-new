//Import required modules
const { error, timeStamp } = require('console');
const fs = require('fs')

//Implement errorLogger function as per the requirement
let errorLogger = async (err, req, res, next) => {
    
    fs.appendFile('Errorlogger.txt', `${timeStamp} ${err.stack}\n`, (error) => {
        if (error) {
            console.log("Failed in logging error")
        }
    })
    if (err.status) {
        res.status(err.status)
    } else {
        res.status(500)
    }
    res.json({ "message": err.message })
}

module.exports = errorLogger;