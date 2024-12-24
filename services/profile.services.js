const { get_jwt_token } = require('./auth.services')
const { get_user } = require('./users.services')
const { get_posts } = require('./posts.services')
const User = require('../models/User')

async function get_profile(token) {
    if(!token) {
        return {
            status: false,
            message: "'token' is null",
            data: null
        }
    }

    const token_result = await get_jwt_token(token)

    if(!token_result.status) {
        return {
            status: false,
            message: `Incorrect 'token' - ${token}`,
            data: null
        }
    }

    let user = await get_user({ '_id': token_result.data }, { with_saved_posts: true })
    
    if(!user) {
        return {
            status: false,
            message: "User not found",
            data: null
        }
    }

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

async function save_post(token, post_id) {
    const user = await get_profile(token)

    if(!user.status) {
        return user
    }
    
    if(!post_id) {
        return {
            status: false,
            message: "'post_id' is null",
            data: null
        }
    }

    const posts = await get_posts(query = { "_id": post_id })

    if(!posts.status) {
        return posts
    }

    const post = posts.data[0]
    const result = user.data.saved_posts.some(savedPost => savedPost.equals(post._id))  ? await __unsave_post(user.data, post) : await __save_post(user.data, post)

    return result
}

module.exports = {
    get_profile,
    save_post
}