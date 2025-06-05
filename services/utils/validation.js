const Post = require('../../models/Post')
const { get_jwt_token } = require('./jwt')
const { get_users } = require('../users.services')

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
                    is_valid: false,
                    message: "Content length must be more than 0",
                }
            }
            break;
        case "token":
            if(!value) {
                return {
                    is_valid: false,
                    message: "Token is empty",
                    data: ""
                }
            }
            try{
                const token_result = await get_jwt_token(value)
                
                if(!token_result.status) {
                    return {
                        is_valid: false,
                        message: `Incorrect token`,
                        data: value
                    }
                }
                
                let user = await get_users({ "_id": token_result.data })
                
                if(!user.status) {
                    return {
                        is_valid: false,
                        message: `User not found`,
                        data: value
                    }
                }
                return {
                    is_valid: true,
                    data: user.data[0]
                }
            }
            catch(e) {
                return {
                    is_valid: false,
                    message: "User not found",
                    data: value
                }
            }
            break
        case "post_id":
            if(!value || value.replace(' ', '').length === 0) {
                return {
                    is_valid: false,
                    message: "Post id is empty or not exists",
                    data: ''
                }
            }
            try{
                const posts = await Post.findOne({ _id: value })
                
                if(!posts) {
                    return {
                        is_valid: false,
                        message: "Incorrect post id",
                        data: value
                    }
                }
                else{
                    return {
                        is_valid: true,
                        data: posts
                    }
                }
            }
            catch(e) {
                return {
                    is_valid: false,
                    message: "Incorrect post id",
                    data: value
                }
            }
        case "description":
            if(!value || value.length > 60) {
                return {
                    is_valid: false,
                    message: "Description must be less then 60",
                }
            }
            break
        case "password":
            if(!value || value.length < 8 || value.length > 20) {
                return {
                    is_valid: false,
                    message: "Passowrd must be more then 7 and less then 21!",
                }
            }
            break
        case "nick_name":
            if(!value || value.length < 3 || value.length > 20) {
                return {
                    is_valid: false,
                    message: "Nick name must be more then 2 and less then 21!"
                }
            }
            break
        case "user_id":
            if(!value || value.replace(" ", "").length === 0) {
                return {
                    is_valid: false,
                    message: "User id must be non empty!"
                }
            }
            break
        }

    return {
        is_valid: true,
        message: "Success"
    }
}

module.exports = {
    field_validation
}