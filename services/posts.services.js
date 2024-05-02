const Post = require('../models/Post')
const { get_jwt_token } = require('./auth.services')
const { get_user } = require('./users.services')
const {upload_image} = require("./upload.services") 

function post_validation(title, content) {
    if(!title || title.replace(' ', '').length == 0) {
        return {
            status: false,
            message: "Incorrect 'title'",
        }
    }

    if(!content || content.replace(' ', '').length == 0) {
        return {
            status: false,
            message: "'content_text' length must be mroe than 0",
        }
    }

    return {
        status: true,
        message: 'Success',
    }
}

async function create_post(token, title, featured_image, content_text) {
    const token_result = await get_jwt_token(token)

    if(!token_result.status) {
        return {
            status: false,
            message: `Incorrect 'token' - ${token_result.message}`,
            data: null
        }
    }

    let validation_result = post_validation(title, content_text)
        
    if(!validation_result.status) {
        return {
            status: false,
            message: validation_result.message,
            data: null
        }
    }

    let user = await get_user({ "_id": token_result.data })

    if(!user.status) {
        return user
    }

    if(!user.data.is_admin) {
        return {
            status: false,
            message: 'This user doesn`t have permission to create a post',
            data: null
        }
    }

    const response = await upload_image(featured_image)
    const img = response.status ? response.data.url : null
    
    const newPost = new Post({
        author: token_result.data,
        title: title,
        featured_image: img,
        content_text: content_text 
    })
    
    await newPost.save()

    return {
        status: true,
        message: 'Post created, ',
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
                message: 'There is no posts',
                data: null
            }
        }
        
        for (let i = 0; i < posts.length; i++) {
            posts[i] = await insert_author_to_post(posts[i])
        }
        
        return {
            status: true,
            message: '',
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
    post_validation,
    create_post
}