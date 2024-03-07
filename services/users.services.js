const User = require('../models/User');

async function get_private_user_by(key, value){

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


async function get_public_user_by(key, value) {
    let user = await get_private_user_by(key, value);
    if(!user.status) return user

    return {
        status: true,
        message: "success",
        data: {
            nick_name: user.data.nick_name,
            created_date: user.data.created_date,
            is_admin: user.data.is_admin,
            posts: user.data.posts,
            saved_posts: user.data.save_posts
        }
    }
}

module.exports = {
    get_private_user_by,
    get_public_user_by
};