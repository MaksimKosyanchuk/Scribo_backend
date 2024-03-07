const User = require('../models/User');

async function get_user_by(key, value){
    let user = await User.findOne({ [key]: value });

    if(!user){
        return {
            status: false,
            message: "User not found",
            data: null
        }
    }

    return {
        status: true,
        message: "Success",
        data: user
    }
};

async function get_user_by_name(name) {
    let user = await get_user_by('nick_name', name)

    if(user.status) {
        return {
            status: true,
            message: "success",
            data: {
                nick_name: user.data.nick_name,
                avatar: user.data.avatar,
                created_date: user.data.created_date,
                is_admin: user.data.is_admin,
                posts: user.data.posts,
                saved_posts: user.data.saved_posts
            }
        }
    }

    return {
        status: false,
        message: "error",
        data: null
    }
}

module.exports = {
    get_user_by,
    get_user_by_name
};