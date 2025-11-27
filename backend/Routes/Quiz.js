const express = require('express');
const router = express.Router();
const {getQuestions, startQuiz, endQuiz }= require('./../Controllers/QuizController')
const authMiddleware = require('./../middewares/AuthMiddleware')

router.use(authMiddleware)
router.post('/createQuiz', async (req, res, next)=>{
    try{
        const userId = req.userId
        console.log('ln 10 ', userId);
        
        const createdQuiz = await startQuiz(userId)
        
        res.json({message:createdQuiz})
    }
    catch(error) {
        next(error)
    }
})
router.get('/getQuestions', async (req, res, next)=>{
    try{
        const questionData = await getQuestions()
        res.json({data:questionData})
    }
    catch(error) {
        next(error)
    }
})

router.put('/endQuiz/:userId', async (req, res, next)=>{
    try{
        const userId = req.params.userId
        const quizReport = await endQuiz(userId, req.body.responses)
        if(quizReport) {
            res.json({message:"Quiz completed successfully", quizReport})
        }
        else {
            let error = new Error('Unable to complete quiz')
            error.status = 500
            throw error
        }
    }
    catch(error) {
        next(error)
    }
})

module.exports = router