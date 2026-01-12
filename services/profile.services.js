const { get_jwt_token } = require('./utils/jwt')
const { get_users } = require('./users.services')
const { field_validation } = require('./utils/validation')
const { get_posts } = require('./posts.services')
const User = require('../models/User')
const mongoose = require('mongoose');
const { get_user_by_query } = require('./db/users')
const { add_post_to_saved, remove_post_from_saved, follow_to_user_by_id } = require('./db/profile')

async function get_profile(req) {
    const validation = await field_validation([{ type: "token", value: req.headers['authorization']?.split(' ')[1], source: "Authorization" }]) 
    
    if(!validation.status) {
        return {
            status: false,
            message: "Some errors in your fields",
            errors: validation.errors
        }
    }

    const token = (await get_jwt_token(req.headers['authorization']?.split(' ')[1])).data

    const user = await get_user_by_query({ '_id': token }, { with_saved_posts: true, with_notifications: true })
    
    if(!user.status) {
        return {
            status: false,
            message: "User was not found"
        }
    }

    return {
        status: true,
        message: "Success",
        data: user.data
    }
}

async function save_post(req) {
    const token = req?.headers?.authorization?.split(' ')?.[1]
    fields = [
        {
            type: "token",
            value: token,
            source: "Authorization"
        },
        {
            type: "_id",
            value: req.params.id,
            source: "params"
        }
    ]
    
    const validation = await field_validation(fields)

    if(!validation.status) {
        return {
            status: false, 
            message: "Some errors in your fields",
            errors: validation.errors
        }
    }

    const user = await get_user_by_query({ "_id": (await get_jwt_token(token)).data }, { with_saved_posts: true })

    if(!user.status) return user

    if(user.data.saved_posts.some((p) => String(p) === req.params.id )) {
        return await remove_post_from_saved(user.data._id, req.params.id)
    }
    else {
        return await add_post_to_saved(user.data._id, req.params.id)
    }
}

async function follow_by_id(req) {
    const token = req?.headers?.authorization?.split(' ')?.[1]
    
    fields = [
        {
            type: "token",
            value: token,
            source: "Authorization"
        },
        {
            type: "_id",
            value: req.params.id,
            source: "params"
        }
    ]
    
    const validation = await field_validation(fields)

    if(!validation.status) {
        return {
            status: false, 
            message: "Some errors in your fields",
            errors: validation.errors
        }
    }
    
    let profile = await get_profile(req)

    if(!profile.status) return profile

    let followed_user = await get_user_by_query({ "_id": req.params.id })

    if(!followed_user.status) {
        return {
            status: false,
            message: "Some errors in your fields",   
            errors: {
                params: {
                    _id: {
                        message: "User not found!",
                        data: req.params.id
                    }
                }
            }
        }
    }
    
    if(profile.data.follows.some(item => item._id.equals(followed_user.data._id))) {
        return {
            status: false,
            message: "U are already following this user!"
        }
    }

    if(profile.data._id.equals(followed_user.data._id)) {
        return {
            status: false,
            message: "You cannot follow yourself!"
        }
    }

    const follow = await follow_to_user_by_id(profile.data._id, followed_user.data._id)

    if(!follow.status) {
        return {
            status: false,
            message: "Internal server error"
        }
    }

    return {
        status: true,
        message: "Success followed",
        data: follow.data
    }
}

async function unfollow(body) {
    let profile = await get_profile(body)
    let errors = {}

    if(!profile.status) {
        errors = profile.errors
    }

    const id_validation_result = await field_validation("user_id", body.user_id)
    const nick_name_validation_result = await field_validation("nick_name", body.nick_name)

    let followed_user = null

    if(!id_validation_result.is_valid && !nick_name_validation_result.is_valid) {
        errors["user_id"] = id_validation_result.message
        errors["nick_name"] = nick_name_validation_result.message
    } else {
        let followed_user_by_id = null;
        let followed_user_by_nick_name = null;

        try {
            if (id_validation_result.is_valid) {
                followed_user_by_id = await User.findOne({ "_id": new mongoose.Types.ObjectId(body.user_id) });
            }
        } catch (e) {
            followed_user_by_id = null;
        }

        if (nick_name_validation_result.is_valid) {
            followed_user_by_nick_name = await User.findOne({ "nick_name": body.nick_name });
        }

        if (followed_user_by_nick_name) {
            followed_user = followed_user_by_nick_name.toObject();
        } else if (followed_user_by_id) {
            followed_user = followed_user_by_id.toObject();
        } else {
            if (nick_name_validation_result.is_valid) {
                errors["nick_name"] = "User not found!";
            }
            if (id_validation_result.is_valid) {
                errors["user_id"] = "User not found!";
            }
        }
    }

    if(Object.keys(errors).length === 0) {
        if(profile.data._id.equals(followed_user._id)) {
            errors["user_id/nick_name"] = "You cannot unfollow yourself!"
        }
    }

    if(Object.keys(errors).length === 0) {
        if(!profile.data.follows.some(item => item._id.equals(followed_user._id))) {
            errors["user_id/nick_name"] = "You are not following this user!"
        }
    }

    if(Object.keys(errors).length > 0) {
        return { 
            status: false,
            message: "Some errors in your fields!",
            errors: errors
        }
    }

    try {
        await User.findOneAndUpdate(
            { _id: followed_user._id },
            {
                $pull: {
                    followers: profile.data._id
                },
                $push: {
                    notifications: {
                        type: "unfollow",
                        user: profile.data._id
                    }
                }
            }
        );

        await User.findOneAndUpdate(
            { _id: profile.data._id },
            { $pull: { follows: followed_user._id }});

        profile.data.follows = profile.data.follows.filter(item => !item._id.equals(followed_user._id));
        followed_user.followers = followed_user.followers.filter(item => !item._id.equals(profile.data._id));

        return {
            status: true,
            message: "Success unfollowed",
            data: { follower: profile.data, followed: followed_user }
        }
    } catch (error) {
        return {
            status: false,
            message: "Failed to unfollow",
            data: { message: error.message }
        };
    }
}

async function read_notifications(body) {
    try{
        const user = await get_profile(body)
        if(!user.status) {
            return {
                status: false,
                message: "Failed to read notifications",
                errors: user.errors
            };
        }

        await User.findOneAndUpdate(
            { _id: user.data._id },
            {
                $set: {
                    'notifications.$[].is_read': true
                }
            }
        );

        return {
            status: true,
            message: "Success readed all notifications",
            data: {
                ...user.data,
                notifications: user.data.notifications.map((item) => {
                    return { ...item, is_read: true };
                })
            }
        }
    }
    catch(error) {
        return {
            status: false,
            message: "Failed to read notifications",
            data: { message: error.message }
        };
    }        
}

module.exports = {
    get_profile,
    save_post, 
    follow_by_id,
    unfollow,
    read_notifications
}