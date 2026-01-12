const Post = require('../models/Post')
const { get_jwt_token } = require('./utils/jwt')
const { get_user_by_query } = require('./db/users')
const { upload_image, delete_file } = require("./aws.services")
const { field_validation } = require("./utils/validation")
const { get_posts_by_query, create_new_post, delete_post_by_id } = require('./db/posts')

async function create_post(req) {
    params = ["content_text", "title"]

    fields = []

    params.map((param) => { fields.push({ type: param, value: req.body[param], source: "body" }) })

    fields.push({
        type: "token",
        value:  (req.headers['authorization'])?.split(' ')[1],
        source:  "Authorization"
    })

    const validation = await field_validation(fields)

    if(!validation.status) {
        return {
            status: false,
            message: "Some errors in your fields!",
            errors: validation.errors
        }
    }

    const token = await get_jwt_token(req.headers.authorization.split(' ')[1])    
    const user = await get_user_by_query({ "_id": token.data })

    if(!user.data.is_admin) {
        return {
            status: false,
            message: "This user doesn`t have permission to create a post"
        }
    }

    var img_url = null

    if(req.file) {
        const image_upload_result = await upload_image(req.file, "featured_image", Date.now().toString())
        
        if(!image_upload_result.status) {
            return {
                status: false,
                message: `Error to upload image: ${image_upload_result.message}`,
                errors: {
                    file: {
                        "featured_image": image_upload_result.errors
                    }
                }
            }
        }
        else {
            img_url = image_upload_result.data.url
        }
    }
        
    const post_creating_result = await create_new_post(req.body.title, req.body.content_text, user.data._id, img_url)

    if(!post_creating_result.status) {
        delete_file(img_url)

        return {
            status: false,
            message: "Post creation failed",
            errors: post_creating_result.errors
        }
    }

    return {
        status: true,
        message: "Success post creating",
        data: post_creating_result.data
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
            errors: validation.errors
        }
    }

    const posts = await get_posts_by_query(params)

    if(expand === "author") {
        for (let i = 0; i < posts.data.length; i++) {
            posts.data[i] = await _insert_author_to_post(posts.data[i])
        }
    }
    
    return posts
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
            errors: validation.errors
        }
    }

    const posts = await get_posts_by_query({ "_id": req.params.id })

    if(expand === "author") {
        for (let i = 0; i < posts.data.length; i++) {
            posts.data[i] = await _insert_author_to_post(posts.data[i])
        }
    }
    
    return posts
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
            errors: validation.errors
        }
    }

    const token_result = await get_jwt_token((req.headers['authorization'])?.split(' ')[1])

    const user = await get_user_by_query({ "_id": token_result.data })

    if(!user.data.is_admin) {
        return {
            status: false,
            message: "This user doesn`t has permission to delete posts!"
        }
    }

    const result = await delete_post_by_id(req.params.id)

    if(!result.status) return result

    await delete_file(result.data.featured_image ?? "")

    return result
}

module.exports = {
    get_posts,
    get_post_by_id,
    create_post,
    delete_post
}