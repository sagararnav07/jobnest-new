const express = require('express');
const router = express.Router();
const authMiddleware = require('./../middewares/AuthMiddleware')
const Job = require('./../models/Jobs')
const {createProfile}=require('./../Controllers/JobSeekerController')
router.use(authMiddleware)
router.use((req, res, next)=>{
    try{
    if(req.userType === 'Jobseeker') {
            let error= new Error("Jobseeker don't have permission")
            error.status = 403
            throw error 
        }
    else next()
    }
    catch(err) {
        next(err)
    }
})
router.post('/createJob', async (req, res, next)=>{
    try{
        const body = req.body
        let job  = new Job(body, req.userId)
        
    }
    catch(error) {
        next(error)
    }
})
module.exports = router