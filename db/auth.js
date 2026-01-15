const User = require('../models/User')

async function create_new_user(user) {
    if(!user) {
        return {
            status: false,
            message: "User object is empty!",
            data: null
        }
    }

    const newUser = new User(user)
        
    const savedUser = await newUser.save();

    return {
        status: true,
        message: "Success created new account",
        data: savedUser
    }
}

module.exports = {
    create_new_user
}