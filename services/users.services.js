const User = require('../models/User')
const { field_validation } = require('./utils/validation')
const { get_user_by_query, get_users_by_query } = require('./db/user')

async function get_user(req){
    const validation = await field_validation([ { type: "nick_name", value: req.params.nick_name, source: "Params" } ])

    if(!validation.status) {
        return {
            status: false,
            message: "Some errors in your fields",
            errors: validation.errors
        }
    }

    const user = await get_user_by_query({ "nick_name": req.params.nick_name })

    if(!user.status) {
        return {
            status: false,
            message: "User was not found"
        }
    }
    else {
        return user
    }
}

async function get_users(req){
    const params = req.query;
    const fields = []

    for(field of Object.keys(req.query)) {
        if(field === "_id") fields.push({ type: "user_id", value: req.query[field], source: "params" })
        fields.push({ type: field, value: req.query[field], source: "params" })
    }

    const validation = await field_validation(fields)

    if(!validation.status) {
        return {
            status: false,
            message: "Some errors in your fields",
            errors: validation.errors
        }
    }

    const users = await get_users_by_query(params)
    
    if(!users.status) {
        return {
            status: false,
            message: users.message,
        }
    }
    else {
        return users
    }
}

module.exports = {
    get_users,
    get_user
}