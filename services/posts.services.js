const Post = require('../models/Post')
const { get_jwt_token } = require('./auth.services')
const { get_user } = require('./users.services')
const {upload_image} = require("./upload.services") 

async function field_validation(type, value) {
    switch(type){
        case "title":
            if(!value || value.replace(' ', '').length == 0) {
                return {
                    is_valid: false,
                    message: "Title must not be empty",
                }
            }
            break;
        case "content_text":
            if(!value || value.replace(' ', '').length == 0) {
                return {
                    stais_validtus: false,
                    message: "Content length must be more than 0",
                }
            }
            break;
        case "token":
            if(!value) {
                return {
                    is_valid: false,
                    message: "Token is empty"
                }
            }

            const token_result = await get_jwt_token(value)

            if(!token_result.status) {
                return {
                    is_valid: false,
                    message: `Incorrect token`,
                }
            }
            
            let user = await get_user({ "_id": token_result.data })

            if(!user.status) {
                return {
                    is_valid: false,
                    message: `Incorrect token`,
                }
            }

            return {
                is_valid: true,
                message: "Success",
            }
        case "post_id":
            if(!value || value.replace(' ', '').length === 0) {
                return {
                    is_valid: false,
                    message: "Post id is empty or not exists"
                }
            }

            const posts = await get_posts(query = { "_id": value })

            if(!posts.status) {
                return {
                    is_valid: false,
                    message: "Incorrect post id"
                }
            }
            
            return {
                is_valid: true,
                message: "Success"
            }
    }

    return {
        is_valid: true,
        message: "Success"
    }
}

async function create_post(body, file) {
    const token_result = await get_jwt_token(body.token)
    
    let  errors = {}
        
        for(let item of ['token', 'title', 'content_text']) {
            const validation = await field_validation(item, body[item])

            if(!validation.is_valid) {
                errors[item] = validation.message
            }
        }   

    let user = await get_user({ "_id": token_result.data })

    if(!user.data.is_admin) {
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
        data: newPost
    }
}

async function insert_author_to_post(post) {
    post = post.toObject()
    
    let author = await get_user({ '_id': post.author })

    post.author = author.status ? author.data : null 

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
    field_validation,
    create_post
}