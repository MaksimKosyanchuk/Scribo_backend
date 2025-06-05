const Post = require('../models/Post')
const { get_jwt_token } = require('./utils/jwt')
const { get_users } = require('./users.services')
const { upload_image, delete_image } = require("./aws.services")
const { field_validation } = require("./utils/validation")

async function create_post(body, file) {
    let  errors = {}
    
    for(let item of ['token', 'title', 'content_text']) {
        const validation = await field_validation(item, body[item])
        
        if(!validation.is_valid) {
            errors[item] = validation.message
        }
    }
    
    const token_result = await get_jwt_token(body.token)
    let user = await get_users({ "_id": token_result.data })

    if(!user.status || !user.data[0].is_admin) {
        if (!errors.token) {
            errors.token = [];
        }
        errors.token.push(
            { message: "This user doesn`t have permission to create a post" }
        );
    }

    const result = await upload_image(file, "featured_image", Date.now())
    const img = result.status ? result.data.url : null
    
    if(!result.status && result.errors) {
        errors.featured_image = result.errors
    }

    if(Object.keys(errors).length > 0) {
        return {
            status: false,
            message: "Errors in your form",
            errors: errors
        }
    }

    const newPost = new Post({
        author: token_result.data,
        title: body.title,
        featured_image: img,
        content_text: body.content_text 
    })
    
    await newPost.save()

    return {
        status: true,
        message: {
            "Post": "Created!",
            "Banner": {
                "Status": result.status,
                "Message": result.message
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

async function get_posts(query = {}) {
    try {
        let posts = await Post.find( query )
        
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

async function delete_post(headers, params) {
    errors = {  
        headers: [],
        body: [],
        params: []
    }

    const authHeader = headers.authorization;

    const user = await field_validation("token", authHeader.split(' ')[1])

    if(!user.is_valid) {
        errors.headers.push({ Authorization: { message: user.message, data: user.data }})
    }
    else {
        if(!user.data.is_admin) {
            errors.headers.push({ Authorization: { message: "This user doesn`t has permission to delete post", data: user.data }})
        }
    }
    
    const post = await field_validation("post_id", params.id)
    
    if(!post.is_valid) {
        errors.params.push({ "/": { message: post.message, data: post.data }})
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
        console.log(e.message)
    }
    
    return {
        status: true,
        message: "Succes deleted post",
        data: { user: user.data, post: post.data },
        errors: errors
    }
}

module.exports = {
    get_posts,
    create_post,
    delete_post
}