const { get_jwt_token } = require('./auth.services')
const { get_user } = require('./users.services')
const { get_posts, field_validation } = require('./posts.services')
const User = require('../models/User')

async function get_profile(body) {
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
    const user = await get_user({ '_id': token_result.data }, { with_saved_posts: true })

    return {
        status: true,
        message: "",
        data: user.data
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
            data: { post: post }
        }
    } catch (error) {
        return {
            status: false,
            message: "Failed to save post: " + error,
            data: { post: post }
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
            data: { post: post }
        }
    }
    catch (error) {
        return {
            status: false,
            message: "Failed to unsave post: " + error,
            data: { post: post }
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

module.exports = {
    get_profile,
    save_post
}