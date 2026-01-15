const { get_jwt_token } = require('./utils/jwt')
const { field_validation } = require('./utils/validation')
const { get_user_by_query } = require('../db/users')
const { add_post_to_saved, remove_post_from_saved, read_notifications_by_user_id } = require('../db/profile')
const { get_post_by_query } = require('../db/posts')
const mongoose = require('mongoose');

async function get_profile(req) {
    const token = req.headers['authorization']?.split(' ')[1]

    const validation = await field_validation([{ type: "token", value: token, source: "Authorization" }]) 

    if(!validation.status) {
        return {
            status: false,
            message: "Unauthorized!",
            data: null,
            errors: validation.errors,
            code: 401
        }
    }

    const user_id = (await get_jwt_token(req.headers['authorization']?.split(' ')[1])).data
    const user = await get_user_by_query({ '_id': user_id }, { with_saved_posts: true, with_notifications: true })

    if(!user.status) {
        return {
            status: false,
            message: "Unauthorized!",
            data: null,
            code: 401
        }
    }

    return {
        status: true,
        message: "Success authorized",
        data: user.data,
        code: 200
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
            data: null,
            errors: validation.errors,
            code: validation.errors.authorization ? 401 : 400
        }
    }

    const user = await get_user_by_query({ "_id": (await get_jwt_token(token)).data }, { with_saved_posts: true })

    if(!user.status) {
        return {
            ...user,
            code: 401
        }
    }

    if(!(await get_post_by_query({ "_id": req.params.id })).status) {
        return {
            status: false,
            message: "Post not found!",
            data: null,
            code: 404
        }
    }

    if(user.data.saved_posts.some((p) => String(p) === req.params.id )) {
        return {
            status: false,
            message: "Post is already in saved posts!",
            data: null,
            code: 409
        }    
    }

    const result =  await add_post_to_saved(user.data._id, req.params.id) 

    global.Logger.log({
        type: "save_post",
        message: `User ${result.data.nick_name} saved post ${req.params.id}`,
        data: {
            user: result.data._id,
            post_id: new mongoose.Types.ObjectId(req.params.id)
        }
    })
    
    return {
        status: true,
        message: "Success saved post",
        data: {
            saved_posts: result.data.saved_posts
        },
        code: 200
    }
}

async function unsave_post(req) {
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
            data: null,
            errors: validation.errors,
            code: validation.errors.authorization ? 401 : 400
        }
    }

    const user = await get_user_by_query({ "_id": (await get_jwt_token(token)).data }, { with_saved_posts: true })

    if(!user.status) {
        return {
            ...user,
            code: 401
        }
    }

    if(!(await get_post_by_query({ "_id": req.params.id })).status) {
        return {
            status: false,
            message: "Post not found!",
            data: null,
            code: 404
        }
    }

    if(!user.data.saved_posts.some((p) => String(p) === req.params.id )) {
        return {
            status: false,
            message: "Post is not in saved posts!",
            data: null,
            code: 409
        }
    }

    const result = await remove_post_from_saved(user.data._id, req.params.id)

    global.Logger.log({ 
        type: "unsave_post",
        message: `User ${result.data.nick_name} unsaved post ${req.params.id}`,
        data: {
            user: result.data._id,
            post_id: new mongoose.Types.ObjectId(req.params.id)
        }
    })

    return {
        status: true,
        message: "Success unsaved post",
        data: {
            saved_posts: result.data.saved_posts
        },
        code: 200
    }
}

async function read_notifications(req) {
    const validation = await field_validation([{ type: "token", value: req.headers['authorization']?.split(' ')[1], source: "Authorization" }]) 
    
    if(!validation.status) {
        return {
            status: false,
            message: "Some errors in your fields",
            data: null,
            errors: validation.errors,
            code: 401
        }
    }

    const user = await get_user_by_query({ '_id': (await get_jwt_token(req.headers['authorization']?.split(' ')[1])).data }, { with_notifications: true })
    
    if(!user.status) {
        return {
            status: false,
            message: "Unauthorized",
            data: null,
            code: 401
        }
    }

    const result = await read_notifications_by_user_id(user.data._id)

    return {
        status: true,
        message: "Success readed all notifications",
        data: { 
            notifications: result.data.notifications
        },
        code: 200
    }
}     

module.exports = {
    get_profile,
    save_post, 
    unsave_post,
    read_notifications
}