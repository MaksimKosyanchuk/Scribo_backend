const Post = require('../models/Post')
const { get_jwt_token, validate_image } = require('./auth.services')
const { get_user } = require('./users.services')

function post_validation(title, image, content) {
    if(!title || title.replace(' ', '').length == 0) {
        return {
            status: false,
            message: 'Incorrect "title"',
        }
    }

    //добавить валидацию фотки
    //if(image && )

    if(!content || content.replace(' ', '').length == 0) {
        return {
            status: false,
            message: 'Content length must be mroe than 0',
        }
    }

    return {
        status: true,
        message: 'Success',
    }
}

async function create_post(req) {
    const { token, title, featured_image, content_text } = req.body

    const token_result = await get_jwt_token(token)
    
    if(!token_result.status) {
        return {
            status: false,
            message: `Incorrect jwt token - ${token_result.message}`,
            data: null
        }
    }

    let validation_result = post_validation(title, featured_image, content_text)
        
    if(!validation_result.status) {
        return {
            status: false,
            message: validation_result.message,
            data: null
        }
    }
    
    let user = await get_user({ "_id": token_result.data.user_id })

    if(!user.data.is_admin) {
        return {
            status: false,
            message: 'This user doesn`t have permission to create a post',
            data: null
        }
    }

    const img = validate_image(featured_image)

    const newPost = new Post({
        author: token_result.data.user_id,
        title: title,
        featured_image: img.data,
        content_text: content_text 
    })
    
    await newPost.save()

    return {
        status: true,
        message: 'Post created, ' + img.message,
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