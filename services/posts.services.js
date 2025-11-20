const Post = require('../models/Post')
const { get_jwt_token } = require('./utils/jwt')
const { get_users } = require('./users.services')
const { upload_image, delete_image } = require("./aws.services")
const { field_validation } = require("./utils/validation")

async function create_post(req) {
    validation_result = await field_validation([
        {
            type: "token",
            source: "headers",
            value: req.headers.authorization
        },
        {
            type: "title",
            source: "body",
            value: req.body.title
        },
        {
            type: "content_text",
            source: "body",
            value: req.body.content_text
        }
    ])

    if(!validation_result.status) {
        return {
            status: false,
            message: "Some errors in your fields!",
            errors: validation_result.errors
        }
    }

    const token_result = await get_jwt_token(req.headers.authorization.split(' ')[1])
    let user = (await get_users({ "_id": token_result.data })).data[0]

    if(!user.is_admin) {
        return {
            status: false,
            message: "This user doesn`t have permission to create a post",
            errors: errors
        }
    }

    const image_upload_result = await upload_image(req.file, "featured_image", Date.now().toString())
    const img = image_upload_result.status ? image_upload_result.data.url : null

    const newPost = new Post({
        author: user._id,
        title: req.body.title,
        featured_image: img,
        content_text: req.body.content_text 
    })
    
    await newPost.save()

    return {
        status: true,
        message: {
            "Post": "Created!",
            "Banner": {
                status: image_upload_result.status,
                message: image_upload_result.message,
                errors: image_upload_result.errors
            }
        },
        data: { user: user, post: newPost }
    }
}

async function _insert_author_to_post(post) {
    post = post.toObject()
    
    let author = await get_users({ '_id': post.author })

    post.author = author.status ? author.data[0] : null 

    return post
}

async function get_posts_by_query(query = {}) {
    try {
        let posts = await Post.find(query)
        
        if (!posts.length) {
            return {
                status: true,
                message: "There is no posts",
                data: null,
            }
        }
        
        for (let i = 0; i < posts.length; i++) {
            posts[i] = await _insert_author_to_post(posts[i])
        }
        
        return {
            status: true,
            message: "Success",
            data: posts
        }
    }
    catch(e) {
        return {
            status: false,
            message: e,
            data: null
        }
    }
}

async function delete_post(req) {
    errors = {  
        headers: [],
        body: [],
        params: []
    }

    const token = req.headers.authorization.split(' ')[1]

    const validation = await field_validation(
        [ {
            type: "token",
            value: token,
            source: "Authorization"
        },
        {
            type: "post_id",
            value: req.params.id,
            source: "Params"
        } ]
    )

    if(!is_valid) {
        errors.headers.push()
    }

    else {        
        const token_result = await get_jwt_token(token)
        const user = (await get_users({ "_id": token_result.data })).data[0]

        if(!user.is_admin) {
            errors.headers.push({ Authorization: { message: "This user doesn`t has permission to delete post", data: user.data }})
        }
    }
    const post = await field_validation("post_id", req.params.id)

    if(!post.is_valid) {
        errors.params.push({ "id": { message: post.message, data: post.data }})
    }

    if (errors.headers.length > 0 || errors.body.length > 0 || errors.params.length > 0) {
        return {
            status: false,
            message: "Some errors in your fields",
            data: [],
            errors: errors
        }
    }

    try { 
        if(post.data.featured_image) {
            const delete_image_result = await delete_image(post.data.featured_image)
        }
        await Post.findByIdAndDelete(post.data._id);
    }
    catch(e) {
        global.Logger.log(`Delete post exception`, { message: e.message })
    }
    
    return {
        status: true,
        message: "Succes deleted post",
        data: { user: user.data, post: post.data },
        errors: errors
    }
}

module.exports = {
    get_posts_by_query,
    create_post,
    delete_post
}