const User = require('../models/User')

async function get_private_user_by(key, value) {
    if(!key) throw new Error('Key is null')

    if(!key || !value) return {
        status: false,
        message: `Value of ${ key } is null`,
        data: null
    }

    let user = await User.findOne({ [key]: value })
    
    if(!user) {
        return {
            status: false,
            message: 'User not found',
            data: null
        }
    }

    return {
        status: true,
        message: 'success',
        data: user.toObject()
    }
}

async function get_public_user_by(key, value) {
    let user = await get_private_user_by(key, value)

    delete user.data._id
    delete user.data.password
    delete user.data.saved_posts

    return user
}

module.exports = {
    get_public_user_by,
    get_private_user_by
}