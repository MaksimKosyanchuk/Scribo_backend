const User = require('../models/User')

async function get_user(query = {}, options = { with_password: false, with_saved_posts: false }) {
    try {
        let user = await User.findOne(query)
        
        if(!user) {
            return {
                status: false,
                message: 'User not found',
                data: null
            }
        }

        user = user.toObject()

        if(!options.with_password) delete user.password
        if(!options.with_saved_posts) delete user.saved_posts

        return {
            status: true,
            message: 'Success',
            data: user
        }
    }
    catch(e) {
        return {
            status: false,
            message: e,
            data: null
        }
    }
}

module.exports = {
    get_user
}