const Auth = {}
const JwtController = require('./JwtController')
const bcrypt = require('bcryptjs')
const { getJobSeekerCollection, getEmployeerCollection } = require('./../utlities/connection')
const { validateName, validateEmail, validatePassword } = require('./../utlities/Validation')

Auth.register = async (user) => {
    try {
        //validations             
        validateName(user.name)
        validateEmail(user.emailId)
        validatePassword(user.password)
        if (user.userType === 'Jobseeker')
            return Auth.jobSeekerRegister(user)
        else if (user.userType === 'Employeer')
            return Auth.employeerRegister(user)
        else {
            let error = new Error('Invalid user type')
            error.status = 406
            throw error
        }
    }
    catch (error) {
        throw error
    }
}

Auth.jobSeekerRegister = async (user) => {
    try {
        //check user exists
        const userCollection = await getJobSeekerCollection()
        const existingUser = await userCollection.findOne({ emailId: user.emailId })
        if (existingUser) {
            let error = new Error('Email already exists')
            error.status = 400
            throw error
        }
        //hash password
        const hashedPassword = await bcrypt.hash(user.password, 11)
        user.password = hashedPassword
        // create user
        const newUser = await userCollection.create({ name: user.name, emailId: user.emailId, password: user.password, userType: user.userType })
        // create token
        console.log('ln 43 ', newUser);
        
        const token = JwtController.generateToken({_id: newUser._id, userType: user.userType })
        return { newUser, token }
    }
    catch (error) {
        throw error
    }

}

Auth.employeerRegister = async (user) => {
    try {
        //check user exists
        const userCollection = await getEmployeerCollection()
        const existingUser = await userCollection.findOne({ emailId: user.emailId })
        if (existingUser) {
            let error = new Error('Email already exists')
            error.status = 400
            throw error
        }
        //hash password
        const hashedPassword = await bcrypt.hash(user.password, 11)
        user.password = hashedPassword
        // create user
        const newUser = await userCollection.create({ name: user.name, emailId: user.emailId, password: user.password, userType: user.userType })
        // create token
        const token = JwtController.generateToken({ _id: newUser._id, userType: user.userType })
        return { newUser, token }
    }
    catch (error) {
        throw error
    }
}

//login
Auth.login = async (user) => {
    try {
        //validations
        validateEmail(user.emailId);
        validatePassword(user.password);

        let result;

        // Primary path based on explicit userType
        if (user.userType === 'Jobseeker') {
            try {
                result = await Auth.jobSeekerLogin(user);
            } catch (err) {
                // If credentials are invalid for Jobseeker, try employer as fallback
                if (err.status === 400 && err.message === 'Invalid Email or Password') {
                    result = await Auth.employeerLogin({ ...user, userType: 'Employeer' });
                } else {
                    throw err;
                }
            }
        } else if (user.userType === 'Employeer') {
            try {
                result = await Auth.employeerLogin(user);
            } catch (err) {
                // Optional: fallback the other way around too
                if (err.status === 400 && err.message === 'Invalid Email or Password') {
                    result = await Auth.jobSeekerLogin({ ...user, userType: 'Jobseeker' });
                } else {
                    throw err;
                }
            }
        } else {
            // If userType is missing or invalid, try both collections
            try {
                result = await Auth.jobSeekerLogin({ ...user, userType: 'Jobseeker' });
            } catch (firstErr) {
                if (firstErr.status === 400 && firstErr.message === 'Invalid Email or Password') {
                    result = await Auth.employeerLogin({ ...user, userType: 'Employeer' });
                } else {
                    throw firstErr;
                }
            }
        }

        // Ensure we're returning both user and token
        if (result && !result.user) {
            const userCollection = result.userType === 'Jobseeker'
                ? await getJobSeekerCollection()
                : await getEmployeerCollection();
            const userData = await userCollection.findOne({ emailId: user.emailId });

            if (!userData) {
                throw new Error('User not found after login');
            }

            return {
                user: userData,
                token: result.token || result
            };
        }

        return result;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

Auth.jobSeekerLogin = async (user) => {
    try {
        const jobSeekerCollection = await getJobSeekerCollection()
        // Check if user exists
        const userData = await jobSeekerCollection.findOne({emailId: user.emailId})
        
        if (!userData) {
            let error = new Error('Invalid Email or Password')
            error.status = 400
            throw error
        }
        
        // Compare password
        const isMatch = await bcrypt.compare(user.password, userData.password)
        if (!isMatch) {
            let error = new Error('Invalid Email or Password')
            error.status = 400
            throw error
        }
        
        // Create token
        const token = JwtController.generateToken({ 
            _id: userData._id, 
            userType: 'Jobseeker' // Hardcoded to ensure consistency
        })
        
        if (!token) {
            let error = new Error('Unable to generate session token')
            error.status = 500
            throw error
        }
        
        // Convert userData to plain object and remove sensitive data
        const userObj = userData.toObject();
        delete userObj.password;
        
        return {
            user: userObj,
            token: token
        };
    } catch(error) {
        console.error('Job seeker login error:', error);
        throw error;
    }
}

Auth.employeerLogin = async (user) => {
    try {
        const employeerCollection = await getEmployeerCollection()
        // Check if user exists
        const userData = await employeerCollection.findOne({emailId: user.emailId})
        
        if (!userData) {
            let error = new Error('Invalid Email or Password')
            error.status = 400
            throw error
        }
        
        // Compare password
        const isMatch = await bcrypt.compare(user.password, userData.password)
        if (!isMatch) {
            let error = new Error('Invalid Email or Password')
            error.status = 400
            throw error
        }
        
        // Create token
        const token = JwtController.generateToken({ 
            _id: userData._id, 
            userType: 'Employeer' // Hardcoded to ensure consistency
        })
        
        if (!token) {
            let error = new Error('Unable to generate session token')
            error.status = 500
            throw error
        }
        
        // Convert userData to plain object and remove sensitive data
        const userObj = userData.toObject();
        delete userObj.password;
        
        return {
            user: userObj,
            token: token
        };
    } catch(error) {
        console.error('Employer login error:', error);
        throw error;
    }
}
module.exports = Auth