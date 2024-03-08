const { get_jwt_token} = require('./auth.services')
const { get_private_user_by } = require('./users.services')

async function get_profile(token) {
    if(!token) {
        return {
            status: false,
            message: 'Token is null',
            data: null
        }
    }

    const token_result = await get_jwt_token(token)
    
    if(!token_result.status) {
        return {
            status: false,
            message: `Incorrect jwt token - ${token_result.message}`,
            data: null
        }
    }
    
    user = await get_private_user_by('_id', token_result.data.user_id)

    delete user.data._id;
    delete user.data.password;

    return {
        status: true,
        message: '',
        data: user.data
    }
}

module.exports = {
    get_profile
}