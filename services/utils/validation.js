const Post = require('../../models/Post')
const { get_jwt_token } = require('./jwt')
const { get_users } = require('../users.services')
const { get_posts_by_query } = require('../posts.services')
const mongoose = require('mongoose');

function push_to_errors(errors, source, field) {
    if(!errors[source]) {
        errors[source] = {}
    }
    
    errors[source][field.type] = field.data
    
    return errors
}

async function field_validation(fields) {
    let errors = { }
    if(!fields) {
        return {
            status: true,
            errors: errors
        }
    }

    for(const field of fields) {
        switch(field.type){
            case "title":
                if(!field.value || field.value.trim().length === 0) {
                    errors = push_to_errors(errors, field.source, { type: "title", data: { message: "Title is empty!", data: field.value }})   
                }

                break
            case "content_text":
                if(!field.value || field.value.trim().length === 0) {
                    errors = push_to_errors(errors, field.source, { type: "content_text", data: { message: "Content text is empty!", data: field.value }})   
                }
                
                break
            case "token":
                if(!field.value || field.value.trim().length === 0) {
                    errors = push_to_errors(errors, field.source, { type: "token", data: { message: "Token is empty!", data: field.value }})
                    break
                }
                try{
                    const token_result = await get_jwt_token(field.value)
                    
                    if(!token_result.status) {
                        errors = push_to_errors(errors, field.source, { type: "token", data: { message: "Incorrect token!", data: field.value }})
                        break
                    }
                    
                    let user = await get_users({ "_id": token_result.data })
                    
                    if(!user.status) {
                        errors = push_to_errors(errors, field.source, { type: "token", data: { message: "Incorrect token!", data: field.value }})
                       
                        break
                    }
                }
                catch(e) {
                    console.log(e.message)
                    errors = push_to_errors(errors, field.source, { type: "token", data: { message: "Incorrect token!", data: field.value }})
                }

                break
            case "post_id":
                if(!field.value || field.value.trim().length === 0) {
                    errors = push_to_errors(errors, field.source, { type: "post_id", data: { message: "Post id is empty!", data: field.value }})
                    break
                }
                try {
                    let posts = await get_posts_by_query({ "_id": field.value }) 

                    if(!posts) {
                        errors = push_to_errors(errors, field.source, { type: "post_id", data: { message: "Post is not found!", data: field.value }})
                    }

                    break
                }
                catch(e) {
                    errors = push_to_errors(errors, field.source, { type: "post_id", data: { message: "Internal server error!", data: field.value }})
                }
            case "description":
                if(!field.value || field.value.length > 60) {
                    errors = push_to_errors(errors, field.source, { type: "description", data: { message: "Description must be less then 60!", data: field.value }})
                }
                break
            case "password":
                if(!field.value || field.value.length < 8 || field.value.length > 20) {
                    errors = push_to_errors(errors, field.source, { type: "password", data: { message: "Passowrd must be more then 7 and less then 21!", data: field.value }})
                }
                break
            case "nick_name":
                if(!field.value || field.value.length < 3 || field.value.length > 20) {
                    errors = push_to_errors(errors, field.source, { type: field.type, data: { message: "Nick name must be more then 2 and less then 21!", data: field.value }})
                }
                break
            case "user_id":
                if(!field.value || field.value.trim().length === 0) {
                    errors = push_to_errors(errors, field.source, { type: "user_id", data: { message: "User id must be non empty!", data: field.value }})
                }
                else {
                    if (!mongoose.Types.ObjectId.isValid(field.value)) {
                        errors = push_to_errors(errors, field.source, { type: "user_id", data: { message: "Incorrect type!", data: field.value }})
                    }
                }
                break
            }
    }
    return {
        status: Object.keys(errors).length === 0,
        errors: errors
    }
}

module.exports = {
    field_validation
}