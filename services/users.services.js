const User = require('../models/User')
const { field_validation } = require('./utils/validation')
const { get_user_by_query, get_users_by_query, follow_to_user_by_id, unfollow_to_user_by_id } = require('./db/users')
const { get_profile } = require('./profile.services')

async function get_user(req){
    const validation = await field_validation([ { type: "nick_name", value: req.params.nick_name, source: "Params" } ])

    if(!validation.status) {
        return {
            status: false,
            message: "Some errors in your fields",
            errors: validation.errors
        }
    }

    const user = await get_user_by_query({ "nick_name": req.params.nick_name })

    if(!user.status) {
        return {
            status: false,
            message: "User was not found"
        }
    }
    else {
        return user
    }
}

async function get_users(req){
    const params = req.query;
    const fields = []

    for(field of Object.keys(req.query)) {
        fields.push({ type: field, value: req.query[field], source: "params" })
    }

    const validation = await field_validation(fields)

    if(!validation.status) {
        return {
            status: false,
            message: "Some errors in your fields",
            errors: validation.errors
        }
    }

    const users = await get_users_by_query(params)
    
    if(!users.status) {
        return {
            status: false,
            message: users.message,
        }
    }
    else {
        return users
    }
}

async function follow_by_id(req) {
    const nick_name = req.params["nick_name"]
    const token = req?.headers?.authorization?.split(' ')?.[1]
    
    fields = [
        {
            type: "token",
            value: token,
            source: "Authorization"
        }
    ]
    
    const validation = await field_validation(fields)

    if(!validation.status) {
        return {
            status: false, 
            message: "Some errors in your fields",
            errors: validation.errors,
            code: 401
        }
    }
    
    let profile = await get_profile(req)

    if(!profile.status) return profile

    let followed_user = await get_user_by_query({ "nick_name": nick_name })

    if(!followed_user.status) {
        return {
            status: false,
            message: "Some errors in your fields",   
            errors: {
                params: {
                    nick_name: {
                        message: "User not found!",
                        data: nick_name
                    }
                }
            },
            code: 400
        }
    }
    
    if(profile.data.follows.some(item => item._id.equals(followed_user.data._id))) {
        return {
            status: false,
            message: "You are already following this user!",
            code: 400
        }
    }

    if(profile.data._id.equals(followed_user.data._id)) {
        return {
            status: false,
            message: "You cannot follow yourself!",
            code: 400
        }
    }

    const follow = await follow_to_user_by_id(profile.data._id, followed_user.data._id)

    return {
        status: true,
        message: "Success followed",
        data: {
            follower: {
                id: follow.follower._id,
                nick_name: follow.follower.nick_name,
                follows: follow.follower.follows,
                followers: follow.follower.followers
            },
            followed: {
                id: follow.followed._id,
                nick_name: follow.followed.nick_name,
                follows: follow.followed.follows,
                followers: follow.followed.followers
            }  
        },
        code: 200
    }
}

async function unfollow_by_id(req) {
    const nick_name = req.params["nick_name"]
    const token = req?.headers?.authorization?.split(' ')?.[1]
    
    fields = [
        {
            type: "token",
            value: token,
            source: "Authorization"
        }
    ]
    
    const validation = await field_validation(fields)

    if(!validation.status) {
        return {
            status: false, 
            message: "Some errors in your fields",
            errors: validation.errors,
            code: 401
        }
    }
    
    let profile = await get_profile(req)

    if(!profile.status) return profile

    let followed_user = await get_user_by_query({ "nick_name": nick_name })

    if(!followed_user.status) {
        return {
            status: false,
            message: "Some errors in your fields",   
            errors: {
                params: {
                    nick_name: {
                        message: "User not found!",
                        data: nick_name
                    }
                }
            },
            code: 400
        }
    }
    
    if(!profile.data.follows.some(item => item._id.equals(followed_user.data._id))) {
        return {
            status: false,
            message: "You are not following this user!",
            code: 400
        }
    }

    if(profile.data._id.equals(followed_user.data._id)) {
        return {
            status: false,
            message: "You cannot unfollow yourself!",
            code: 400
        }
    }

    const follow = await unfollow_to_user_by_id(profile.data._id, followed_user.data._id)

    return {
        status: true,
        message: "Success unfollowed",
        data: {
            follower: {
                id: follow.follower._id,
                nick_name: follow.follower.nick_name,
                follows: follow.follower.follows,
                followers: follow.follower.followers
            },
            followed: {
                id: follow.followed._id,
                nick_name: follow.followed.nick_name,
                follows: follow.followed.follows,
                followers: follow.followed.followers
            }  
        },
        code: 200
    }
}

async function add_notification_to_user_by_id(user_id, message) {

}

module.exports = {
    get_users,
    get_user,
    follow_by_id,
    unfollow_by_id
}