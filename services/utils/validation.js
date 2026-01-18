const { get_jwt_token } = require('./jwt')
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
        const isBooleanValue = v =>
            v === true ||
            v === false ||
            v === "true" ||
            v === "false" ||
            v === 1 ||
            v === 0 ||
            v === "1" ||
            v === "0";
        switch(field.type){
            case "title":
                if(!field.value || field.value.trim().length === 0) {
                    errors = push_to_errors(errors, field.source, { type: "title", data: { message: "Title must be not empty!", data: field.value }})   
                    break
                }
                if(field.value.length > 120) {
                    errors = push_to_errors(errors, field.source, { type: "title", data: { message: "The title must cannot be less than 120 characters!", data: field.value }})   
                }
                break
            case "content_text":
                if(!field.value || field.value.trim().length === 0) {
                    errors = push_to_errors(errors, field.source, { type: "content_text", data: { message: "Content text must be not empty!", data: field.value }})   
                    break
                }
                if(!field.value.length > 2000) {
                    errors = push_to_errors(errors, field.source, { type: "content_text", data: { message: "Content text cannot be less than 2000 characters!", data: field.value }})   
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
                }
                catch(e) {
                    console.log(e.message)
                    errors = push_to_errors(errors, field.source, { type: "token", data: { message: "Incorrect token!", data: field.value }})
                }
                break
            case "description":
                if(field.value && field.value.length > 60) {
                    errors = push_to_errors(errors, field.source, { type: "description", data: { message: "Description must be longer than 60 characters!", data: field.value }})
                }
                break
            case "category":
                if(field.value && field.value.length > 60) {
                    errors = push_to_errors(errors, field.source, { type: "category", data: { message: "Post category must be less then 60 characters!", data: field.value }})
                    break
                }
                if(!field.value || field.value.length < 3) {
                    errors = push_to_errors(errors, field.source, { type: "category", data: { message: "The post category must be longer than 3 characters!", data: field.value }})
                }
                break
            case "password":
                if(!field.value || field.value.length < 8) {
                    errors = push_to_errors(errors, field.source, { type: "password", data: { message: "Passowrd must be longer than 7 characters!", data: field.value }})
                    break
                }
                if(field.value.length > 20) {
                    errors = push_to_errors(errors, field.source, { type: "password", data: { message: "Passowrd must be less than 21 characters!", data: field.value }})
                }
                break
            case "nick_name":
                if(!field.value || field.value.length < 3) {
                    errors = push_to_errors(errors, field.source, { type: field.type, data: { message: "Nick name must be longer than 3 characters!", data: field.value }})
                    break
                }
                if(field.value.length > 20) {
                    errors = push_to_errors(errors, field.source, { type: field.type, data: { message: "Nick name must be less than 21 characters!", data: field.value }})
                }
                break
            case "_id":
                if(!field.value || field.value.toString().trim().length === 0) {
                    errors = push_to_errors(errors, field.source, { type: field.type, data: { message: "Id must be not empty!", data: field.value }})
                }
                else {
                    if (!mongoose.Types.ObjectId.isValid(field.value)) {
                        errors = push_to_errors(errors, field.source, { type: field.type, data: { message: "Incorrect type!", data: field.value }})
                    }
                }
                break
            case "id":
                if(!field.value || field.value.trim().length === 0) {
                    errors = push_to_errors(errors, field.source, { type: field.type, data: { message: "Id must be not empty!", data: field.value }})
                }
                else {
                    if (!mongoose.Types.ObjectId.isValid(field.value)) {
                        errors = push_to_errors(errors, field.source, { type: field.type, data: { message: "Incorrect type!", data: field.value }})
                    }
                }
                break
            case "author":
                if(!field.value || field.value.trim().length === 0) {
                    errors = push_to_errors(errors, field.source, { type: field.type, data: { message: "Id must be not empty!", data: field.value }})
                    break
                }
                if (!mongoose.Types.ObjectId.isValid(field.value)) {
                    errors = push_to_errors(errors, field.source, { type: field.type, data: { message: "Incorrect type!", data: field.value }})
                }
                break
            case "is_verified":
                if(!isBooleanValue(field.value)) {
                    errors = push_to_errors(errors, field.source, { type: field.type, data: { message: "Field is_verified should be boolean!", data: field.value }})
                }
                break
            case "is_admin":
                if(!isBooleanValue(field.value)) {
                    errors = push_to_errors(errors, field.source, { type: field.type, data: { message: "Field is_verified should be boolean!", data: field.value }})
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