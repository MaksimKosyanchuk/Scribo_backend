const { get_jwt_token } = require('./utils/jwt')
const { get_users } = require('./users.services')
const { field_validation } = require('./utils/validation')
const { get_posts } = require('./posts.services')
const User = require('../models/User')
const mongoose = require('mongoose');

async function get_profile(body, with_saved_posts=true) {
    const result = await field_validation("token", body.token)

    if(!result.is_valid) {
        return {
            status: false,
            message: "Some errors in your fields",
            errors: {
                "token": result.message
            }
        }
    }

    const token_result = await get_jwt_token(body.token)
    const user = await get_users({ '_id': token_result.data }, { with_saved_posts: with_saved_posts })
    
    return {
        status: true,
        message: "",
        data: user.data[0]
    }
}

async function __save_post(user, post) {
    try {
        const result = await User.findOneAndUpdate(
            { _id: user._id },
            { $push: { saved_posts: post._id }});

        return {
            status: true,
            message: "Post has been saved",
            data: { user: user, post: post }
        }
    } catch (error) {
        return {
            status: false,
            message: "Failed to save post: " + error,
            data: { user: user, post: post }
        };
    }
    
}

async function __unsave_post(user, post) {
    try {
        const result = await User.findOneAndUpdate(
            { _id: user._id },
            { $pull: { saved_posts: post._id }});

        return {
            status: true,
            message: "Post has been unsaved",
            data: { user: user, post: post }
        }
    }
    catch (error) {
        return {
            status: false,
            message: "Failed to unsave post: " + error,
            data: { user: user, post: post }
        };
    }
}

async function save_post(body) {
    const user = await get_profile(body)
    
    const validation = await field_validation("post_id", body.post_id)
    
    if(!validation.is_valid) {
        if(!user.errors) {
            user.errors = {}
        }
        user.errors.post_id = validation.message
    }
    
    if(user.errors) {
        return { 
            status: false,
            message: "Some errors in your fields!",
            errors: user.errors
        }
    }

    const posts = await get_posts(query = { "_id": body.post_id })

    const post = posts.data[0]
    const result = user.data.saved_posts.some(savedPost => savedPost.equals(post._id))  ? await __unsave_post(user.data, post) : await __save_post(user.data, post)
    
    return result
}

async function follow(body) {
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
    }

    else {
        let followed_user_by_id = null;
        let followed_user_by_nick_name = null;

        if (nick_name_validation_result.is_valid) {
            followed_user_by_nick_name = await User.findOne({ "nick_name": body.nick_name });
        }

        try {
            if (id_validation_result.is_valid) {
                followed_user_by_id = await User.findOne({ "_id": new mongoose.Types.ObjectId(body.user_id) });
            }
        } catch (e) {
            followed_user_by_id = null;
        }

        if (followed_user_by_nick_name) {
            followed_user = followed_user_by_nick_name.toObject();
        } 
        else if (followed_user_by_id) {
            followed_user = followed_user_by_id.toObject();
        } 
        else {
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
            errors["user_id/nick_name"] = "U cacanot follow your self!"
        }
    }

    if(Object.keys(errors).length === 0) {
        if(profile.data.follows.some(item => item._id.equals(followed_user._id))) {
            errors["user_id/nick_name"] = "U are already following this user!"
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
                $push: {
                    followers: profile.data._id,
                    notifications: {
                        type: "follow",
                        user: profile.data._id
                    }
                }
            }
        );
        
        await User.findOneAndUpdate(
            { _id: profile.data._id },
            {
                $push: {
                    follows: followed_user._id
                }
            }
        );

        profile.data.follows.push(followed_user._id)
        followed_user.followers.push(profile.data._id)

        return {
            status: true,
            message: "Success followed",
            data: { follower: profile.data, followed: followed_user }
        }
    } catch (error) {
        return {
            status: false,
            message: "Failed to follow",
            data: { message: error.message }
        };
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
    follow,
    unfollow,
    read_notifications
}