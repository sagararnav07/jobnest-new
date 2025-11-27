const express = require('express')
const app = express()
const router = express.Router()
const User = require('./../models/Users')
const Profile = require('../models/profile')
const AuthController = require('../Controllers/AuthController');
const JobSeekerController = require('../Controllers/ProfileController')
const multer = require('multer')
const Job = require('../Controllers/ViewJobController')
const authMiddleware = require('../middewares/AuthMiddleware')
const { getJobSeekerCollection, getEmployeerCollection } = require('../utlities/connection')

// signup
router.post('/auth/signup', async (req, res, next)=>{
    try{
    const body  = req.body;
    const user = new User(body)
    const newUser = await AuthController.register(body)
    res.status(201).json({"message": "User created successfully"})   
    }
    catch(error) {
        next(error)
    }
})

// login
router.post('/auth/login', async (req, res, next)=>{
    try {
        const body = req.body;
        const { user, token } = await AuthController.login(body);
        
        // Set httpOnly cookie
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 10 * 60 * 60 * 1000, // 10 hours
            path: '/',
        });

        // Return user data (excluding sensitive info)
        const userResponse = { ...user._doc };
        delete userResponse.password;
        
        res.json({
            success: true,
            message: "Login successful",
            user: userResponse,
            token // Still include token in response for clients that need it
        });
    } catch (error) {
        next(error);
    }
})

const storage = multer.diskStorage({
    destination: (req, file, cb)=> cb(null, "uploads/"),
    filename: (req, file, cb) =>{
        const ext = file.originalname.split(".").pop();
        cb(null, file.fieldname + "_" + Date.now() + "." + ext);

    }
})

const upload = multer({storage: storage})

//profile register
router.post('/createprofile/jobseeker',
    upload.fields([
        {name:"resume", maxCount:1},
        {name:"coverLetter", maxCount:1}
    ]),
    JobSeekerController.updateJobSeekerProfile)


//view jobs
router.get('/jobs', async(req,res,next)=>{
    try{
        // const jobPreference = req.query.jobPreference;
        // const skillsArray = req.query.skills;
        // console.log("query", req.query);
        
        // const skills = skillsArray ? skillsArray.split(",").map(s=>s.trim()) : [];
        const viewJobs = await Job.viewJobs('69245232edd8eb31842dc8ff');
        res.json(viewJobs)
    }catch(error){
        next(error)
    }
})


router.get('/users/me', authMiddleware, async (req, res, next) => {
    try {
        const collection = req.userType === 'Employeer'
            ? await getEmployeerCollection()
            : await getJobSeekerCollection();
        const userDoc = await collection.findOne({ _id: req.userId });
        if (!userDoc) {
            let error = new Error('User not found');
            error.status = 404;
            throw error;
        }
        const user = {
            id: userDoc._id,
            name: userDoc.name,
            email: userDoc.emailId,
            userType: userDoc.userType,
            jobPreference: userDoc.jobPreference,
            skills: userDoc.skills,
            description: userDoc.description,
            linkedIn: userDoc.linkedIn,
            website: userDoc.website,
        };
        res.json({ user });
    } catch (error) {
        next(error);
    }
});

module.exports = router