const Post = require('../models/Post');
const { get_jwt_token } = require('./auth.services');
const { get_user_by } = require("./users.services");

function post_validation(title, image, content) {
    if(!title || title.replace(" ", "").length == 0) {
        return res.status(200).json({
            status: false,
            message: "Wtf are u doing, dude, this title shouldn`t be empty or only spaces symbols",
        })
    }


    //добавить валидацию фотки
    //if(image && )

    if(!content || content.replace(" ", "").length == 0) {
        return({
            status: false,
            message: "Content length must be mroe than 0",
        })
    }

    return ({
        status: true,
        message: "Success",
    })
}

function id_is_correct(id) {
    return id.length == 24;
}

async function get_post_by_id(post_id) {
    if(!id_is_correct(post_id)) {
        return({
            status: false,
            message: "Input must be a 24 character hex string",
            data: null
        })
    }

    const post = await Post.findById(post_id);

    if(!post) {
        return {
            status: false,
            message: "Post not found",
            data: null
        }
    }

    return{
        status: true,
        message: "Success",
        data: post
    }
}

async function create_post(req) {
    const { token, title, featured_image, content_text } = req.body;

    const token_result = await get_jwt_token(token);
    if(!token_result.status) {
        return{
            status: false,
            message: `Incorrect jwt token - ${token_result.message}`,
            data: null
        }
    }

    let validation_result = post_validation( title, featured_image, content_text);
        
    if(!validation_result.status) {
        return {
            status: false,
            message: validation_result.message,
            data: null
        }
    }
    
    let user = await get_user_by("_id", token_result.data.user_id);

    if(!user.data.is_admin) {
        return{
            status: false,
            message: "This user doesn`t have permission to create a post!",
            data: null
        }
    }

    const newPost = new Post({
        author: token_result.data.user_id,
        title: title,
        featured_image: featured_image,
        content_text: content_text 
    })
    
    await newPost.save();
    return { status: true, message: "Post created", data: newPost };
}


module.exports = {
    post_validation,
    get_post_by_id,
    create_post
};