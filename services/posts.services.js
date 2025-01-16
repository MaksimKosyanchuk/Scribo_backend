const Post = require('../models/Post')
const { get_jwt_token } = require('./utils/jwt')
const { get_users } = require('./users.services')
const { upload_image } = require("./upload.services")
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

async function insert_author_to_post(post) {
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
            posts[i] = await insert_author_to_post(posts[i])
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

module.exports = {
    get_posts,
    create_post
}