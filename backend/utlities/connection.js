const mongoose = require("mongoose");
const { type } = require("os");
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
// mongoose.set('useCreateIndex', true)
const url = 'mongodb://127.0.0.1:27017/Jobnest';

const jobseekerSchema = Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), required: true },
    name: { type: String, required: true },
    emailId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    jobPreference: { type: String },
    skills: { type: [String] },
    experience: { type: Number, default:0 },
    resume: {data: Buffer, contenttype: String},
    coverLetter: {data: Buffer, contenttype: String },
    socialProfiles: { type: [String] },
    test: { type: Boolean, required: true, default: false },
    userType: { type: String, required: true, enum: ["Employeer", "Jobseeker"] },
    tags: { type: [String] }
}, { collection: "Jobseeker" });



const employeerSchema = Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), required: true },
    name: { type: String, required: true },
    emailId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    description: { type: String },
    companyIcon: { data: Buffer, contenttype: String },
    userType: { type: String, required: true, enum: ["Employeer", "Jobseeker"] },
    industry: { type: String, enum: ["IT", "Manufacturing", "Production", "Services"] },
    linkedIn: { type: String},
    website: { type: String},
    tags: { type: [String] }
}, { collection: "Employeer" });

const experienceSchema = Schema({
    minExperience: { type: Number },
    maxExperience: { type: Number }
})

const jobSchema = Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), required: true },
    jobTitle: { type: String, required: true, min:4 },
    salary: { type: String, required: true },
    currencytype: { type: String, required: true },
    skills: { type: [String], required: true },
    descripton: { type: String, required: true },
    jobPreference: { type: String, required: true },
    experience: { type: experienceSchema, required: true },
    location: { type: String, required: true },
    postedDate: { type: Date, required: true },
    expiryDate: { type: Date },
    employeerId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), required: true, ref: "Employeer" }
}, { collection: "Job" })

const applicationSchema = Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), required: true, ref: "Job" },
    userId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), required: true, ref: "Jobseeker" },
    appliedAt: { type: Date, required: true },
    status: { type: String, enum: ["Applied", "Inprogress", "Rejected", "To Be Interviewed", "Hired"], required: true },
}, { collection: "Application" })

const questionSchema = Schema({
    id: { type: String, required: true },
    // _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), required: true },
    text: { type: String, required: true },
    category: { type: String, required: true, enum: ["Openness", "Conscientiousness", "Extraversion", "Agreeableness", "Neuroticism"] },
    isReversed: { type: Boolean, required: true }
}, { collection: "Question" })

const responseSchema = Schema({
    questionId: { type: String, required: true },
    // questionId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), required: true, ref: "Question", },
    score: { type: Number, min: 1, max: 5, required: true },
    category: { type: String, required: true, enum: ["Openness", "Conscientiousness", "Extraversion", "Agreeableness", "Neuroticism"] },
})

const quizSchema = Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), required: true, ref: "Jobseeker" },
    responses: { type: [responseSchema] },
    submittedAt: { type: Date }
}, { collection: "Quiz" })


const messageSchema = Schema({
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, required: true }
}, { collection: "Message" })

const categoriesSchema = Schema({
    categoryName: { type: String, required: true },
    score: { type: Number, required: true, default: 0 },
    tags: { type: [String] },
})
const resultSchema = Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), required: true },
    categories: { type: [categoriesSchema], required: true },
    overAllTags: { type: [String], required: true },
    generatedAt: { type: Date, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), required: true, ref: "Jobseeker" }
}, { collection: "Result" })

// const reportSchema = Schema({
//     _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), required: true },
//     userId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), required: true , ref: "Jobseeker"},
//     quizId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), required: true , ref: "Quiz"},
//     resultId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), required: true, ref: "Result" },
// }, { collection: "Report" })

let collection = {}

//connects with JobSeeker Collection
collection.getJobSeekerCollection = async () => {
    try {
        await mongoose.connect(url);
        const model = await mongoose.model('JobSeeker', jobseekerSchema);
        return model;
    } catch (err) {
        let error = new Error("Could not connect to database")
        error.status = 500;
        throw error;
    }
}

//connects with Employeer Collection
collection.getEmployeerCollection = async () => {
    try {
        await mongoose.connect(url);
        const model = await mongoose.model('Employeer', employeerSchema);
        return model;
    } catch (err) {
        let error = new Error("Could not connect to database")
        error.status = 500;
        throw error;
    }
}

//connects with Question Collection
collection.getQuestionCollection = async () => {
    try {
        await mongoose.connect(url);
        const model = await mongoose.model('Question', questionSchema);
        return model;
    } catch (err) {
        let error = new Error("Could not connect to database")
        error.status = 500;
        throw error;
    }
}

//connects with Quiz Collection
collection.getQuizCollection = async () => {
    try {
        await mongoose.connect(url);
        const model = await mongoose.model('Quiz', quizSchema);
        return model;
    } catch (err) {
        let error = new Error("Could not connect to database")
        error.status = 500;
        throw error;
    }
}

//connects with catgory collection
collection.getCategoryCollection = async () => {
    try {
        await mongoose.connect(url);
        const model = await mongoose.model('Category', categoriesSchema);
        return model;
    } catch (err) {
        let error = new Error("Could not connect to database")
        error.status = 500;
        throw error;
    }
}

//connects with result collection
collection.getResultCollection = async () => {
    try {
        await mongoose.connect(url);
        const model = await mongoose.model('Result', resultSchema);
        return model;
    } catch (err) {
        let error = new Error("Could not connect to database")
        error.status = 500;
        throw error;
    }
}

//connects with Job collection
collection.getJobCollection = async () => {
    try {
        await mongoose.connect(url);
        const model = await mongoose.model('Job', jobSchema);
        return model;
    } catch (err) {
        let error = new Error("Could not connect to database")
        error.status = 500;
        throw error;
    }
}
module.exports = collection;