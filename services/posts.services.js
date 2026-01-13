const { get_jwt_token } = require('./utils/jwt')
const { get_user_by_query, get_users_by_query, remove_post_from_saved } = require('../db/users')
const { upload_image, delete_file } = require("./aws.services")
const { field_validation } = require("./utils/validation")
const { get_posts_by_query, get_post_by_query, create_new_post, delete_post_by_id } = require('../db/posts')
const { get_profile } = require('./profile.services')
const { ObjectId } = require('mongodb');

async function create_post(req) {
    params = ["content_text", "title"]
    fields = []

    const profile = await get_profile(req)
    
    if(!profile.status) return profile

    params.map((param) => { fields.push({ type: param, value: req.body[param], source: "body" }) })

    const validation = await field_validation(fields)

    if(!validation.status) {
        return {
            status: false,
            message: "Some errors in your fields!",
            data: null,
            errors: validation.errors,
            code: 400
        }
    }

    const token = await get_jwt_token(req.headers.authorization.split(' ')[1])    
    const user = await get_user_by_query({ "_id": token.data })

    if(!user) {
        return {
            status: false,
            message: "Unauthorized!",
            data: null,
            code: 401
        }
    }

    if(!user.data.is_admin) {
        return {
            status: false,
            message: "This user doesn`t have permission to create a post!",
            data: null,
            code: 403 
        }
    }

    var img_url = null

    if(req.file) {
        const image_upload_result = await upload_image(req.file, "featured_image", Date.now().toString())
        
        if(!image_upload_result.status) {
            return {
                status: false,
                message: `Error to upload image: ${image_upload_result.message}`,
                data: null,
                errors: {
                    file: {
                        "featured_image": image_upload_result.errors
                    }
                },
                code: 400
            }
        }
        else {
            img_url = image_upload_result.data.url
        }
    }
        
    const post_creating_result = await create_new_post(req.body.title, req.body.content_text, user.data._id, img_url)

    global.Logger.log({
        type: "create_post",
        message: `User ${user.data.nick_name} created post`,
        data: {
            user: user.data._id,
            post: post_creating_result.data._id
        }
    })

    return {
        status: true,
        message: "Success created post",
        data: post_creating_result.data,
        code: 200
    }
}

async function _insert_author_to_post(post) {
    post = post.toObject()
    
    let author = await get_user_by_query({ '_id': post.author })
    if(author.status) post.author = author.data

    return post
}

async function get_posts(req) {
    const params = req.query;
    const expand = params.expand
    delete params.expand

    const fields = Object.keys(params).map(key => ({
        type: key,
        value: params[key],
        source: "params"
    }));

    const validation = await field_validation(fields)

    if(!validation.status) {
        return {
            status: false,
            message: "Some errors in your fields",
            data: null,
            errors: validation.errors,
            code: 400
        }
    }

    const posts = await get_posts_by_query(params)

    if(!posts.status) {
        return {
            ...posts,
            code: 404
        }
    }

    if(expand === "author") {
        for (let i = 0; i < posts.data.length; i++) {
            posts.data[i] = await _insert_author_to_post(posts.data[i])
        }
    }
    
    return {
        ...posts,
        code: 200
    }
}

async function get_post_by_id(req) {
    const query = req.query
    const expand = query.expand
    delete query.expand

    const fields = [{
        type: "id",
        source: "params",
        value: req.params.id
    }]

    const validation = await field_validation(fields)

    if(!validation.status) {
        return {
            status: false,
            message: "Some errors in your fields",
            data: null,
            errors: validation.errors,
            code: 400
        }
    }

    const post = await get_post_by_query({ "_id": req.params.id })

    if(!post.status) {
        return {
            ...post,
            code: 404
        }
    }

    if(expand === "author") {
        post.data = await _insert_author_to_post(post.data)
    }
    
    return {
        ...post,
        code: 200
    }
}

async function delete_post(req) {
    fields = [{
            type: "token",
            value:  req?.headers?.authorization?.split(' ')[1],
            source:  "Authorization"
        },
        {
            type: "_id",
            value:  req?.params?.id,
            source:  "params"
        }
    ]

    const validation = await field_validation(fields)
    
    if(!validation.status) {
        return {
            status: false,
            message: "Some errors in your fields",
            errors: validation.errors,
            code: validation.errors.Authorization ? 403 : 400
        }
    }

    const token_result = await get_jwt_token((req.headers['authorization'])?.split(' ')[1])

    const user = await get_user_by_query({ "_id": token_result.data })

    if(!user.status) {
        return {
            status: false,
            message: "Unauthorized!",
            data: null,
            code: 401
        }
    }

    if(!user.data.is_admin) {
        return {
            status: false,
            message: "This user doesn`t has permission to delete posts!",
            data: null,
            code: 403
        }
    }

    const result = await delete_post_by_id(req.params.id)

    if(!result.status) {
        return {
            ...result,
            code: 404
        }
    }

    let users_with_saved_post = await get_users_by_query({ saved_posts: new ObjectId(req.params.id) }) 

    if(users_with_saved_post.status) {
        for (const target_user of users_with_saved_post.data) {
            const result = await remove_post_from_saved(target_user._id, req.params.id)
            if(!result.status) {
                global.Logger.log({
                    type: "error",
                    message: "Error to remove post from saved",
                    data: {
                        user_who_deletes_post: user.data._id,
                        target_user: target_user._id,
                        post_id: new ObjectId(req.params.id)
                    }
                })
            }
        }
    }

    await delete_file(result.data.featured_image ?? "")

    global.Logger.log({
        type: "delete_post",
        message: `User ${user.data.nick_name} deleted post`,
        data: {
            user: user.data._id,
            post_id: new ObjectId(req.params.id)
        }
    })

    return {
        ...result,
        code: 200
    }
}

module.exports = {
    get_posts,
    get_post_by_id,
    create_post,
    delete_post
}