const dbModel = require('./../utlities/connection')
const createJob = async (job, employeerId) =>{
    try{
        const jobCollection = await dbModel.getJobCollection()
        validateJob(job)
        const newJob = await jobCollection.create({job, postedDate:new Date(), employeerId})
        if(!newJob) {
            let error = new Error('Unable to create job')
            error.status = 500
            throw error
        }
        return true 
    }
    catch(error) {throw error}
}