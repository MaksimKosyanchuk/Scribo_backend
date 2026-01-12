const User = require('../../models/User')
const { get_post_by_query } = require('./posts')
const { get_user_by_query } = require('./users')

async function add_post_to_saved(user_id, post_id) {
    const user = await get_user_by_query({ "_id": user_id }, { with_saved_posts: true })

    if(!user.status) return user

    const post = await get_post_by_query({ "_id": post_id })

    if(!post.status) return post

    if(user.data.saved_posts.some(p => p.toString() === post_id)) {
        return {
            status: false,
            message: "Post is already in saved posts!",
            data: null
        }
    }

    const result = await User.findOneAndUpdate(
        { _id: user_id },
        { $push: { saved_posts: post_id }},
        { new: true }
    );

    return {
        status: true,
        message: "Success saved post",
        data: result
    }
}

async function remove_post_from_saved(user_id, post_id) {
    const user = await get_user_by_query({ "_id": user_id }, { with_saved_posts: true })

    if(!user.status) return user

    const post = await get_post_by_query({ "_id": post_id })

    if(!post.status) return post

    if(!user.data.saved_posts.some(p => p.toString() === post_id)) {
        return {
            status: false,
            message: "Post is not in saved posts!"
        }
    }

    const result = await User.findOneAndUpdate(
        { _id: user_id },
        { $pull: { saved_posts: post_id }},
        { new: true }
    );

    return {
        status: true,
        message: "Success unsaved post",
        data: result
    }
}

module.exports = {
    add_post_to_saved,
    remove_post_from_saved
}