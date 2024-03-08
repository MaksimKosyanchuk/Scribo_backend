const User = require('../models/User');


async function get_public_user_by(key, value) {
    let user = await User.findOne({ [key]: value });
    
    if(!user) {
        return {
            status: false,
            message: "User not found",
            data: null
        }
    }

    return {
        status: true,
        message: "success",
        data: {
            nick_name: user.nick_name,
            created_date: user.created_date,
            avatar: user.avatar,
            is_admin: user.is_admin,
            posts: user.posts,
        }
    }
}

module.exports = {
    get_public_user_by
};