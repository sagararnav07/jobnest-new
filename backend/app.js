const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');
const create = require('./utlities/dbsetup')
const app = express();
const requestLogger = require('./utlities/requestLogger');
const errorLogger = require('./utlities/errorLogger')
const router = require('./Routes/Users')
const quizRouter = require('./Routes/Quiz')
const employeerRouter = require('./Routes/Employers')
const jobSeekerRouter = require('./Routes/JobSeekers')

const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:3000'];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json())
app.use(requestLogger)

app.get('/setupDb', async(req, res, next) => {
    try {
        let data = await create.setupDb();
        res.send(data)
    } catch (err) {
        console.log(err);
        
        res.send("Error occurred during insertion of data")
    }
})

app.use('/api/v1/user',router);
app.use('/api/v1/employeer',employeerRouter)
app.use('/api/v1/quiz', quizRouter)
app.use('/api/v1/jobSeeker', jobSeekerRouter)
 

app.get('/test', async(req, res, next) => {
    try {
        let data = await tester();
        console.log("--- Verification Completed ---")
        res.send(data);
    } catch (err) {
        console.log(err.message);
    }
})

app.use(errorLogger)

const PORT = process.env.PORT || 5001;
if (!module.parent) {
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
}


module.exports = app;