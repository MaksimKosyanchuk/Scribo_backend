const bcrypt = require("bcryptjs")
const User = require("../models/User")
const { get_users } = require("./users.services")
const { upload_image } = require("./aws.services")
const { field_validation } = require("./utils/validation")
const { set_jwt_token } = require("./utils/jwt")

async function compare_passwords(password, from_db) {    
    return await bcrypt.compare(password, from_db)
}

async function login(body) {
    let errors = {}

    // for (let item of ['nick_name', 'password']) {
    //     const validation = await field_validation(item, body[item])

    //     if(!validation.is_valid) {
    //         errors[item] = validation.message
    //     }
    // }

    let find_user = await get_users({ 'nick_name': body.nick_name }, { with_password: true })
    
    if(!errors.nick_name) {
        if(!find_user.status) {
            errors.nick_name = "Current user doesn`t exists"
        }
        else {
            find_user.data = find_user.data[0]
        }
    }

    if(Object.keys(errors).length === 0) {
        const is_match = await compare_passwords(body.password, find_user.data.password)

        if(!is_match) {
            errors.password = "Incorrect password"
        }
    }

    if(Object.keys(errors).length > 0) {
        return {
            status: false,
            message: "Errors in your form",
            errors
        }
    }

    return {
        status: true,
        message: "Authorized!",
        data: {
            user: find_user.data,
            token: await set_jwt_token(find_user.data._id)
        }
    }
}

async function register(body, avatar) {
    let errors = {}

    for(let item of ['nick_name', 'password']){
        let validation = await field_validation(item, body[item])
        if(!validation.is_valid) {
            errors[item] = validation.message
        }
    }

    const user = await get_users({ "nick_name": body.nick_name })

    if (user.status) {
        errors.nick_name = "Current login is exists"
    }

    const result = await upload_image(avatar, "avatar", body.nick_name)

    if(!result.status && result.errors) {
        errors.avatar = result.errors
    }

    if(Object.keys(errors).length > 0) {
        return {
            status: false,
            message: "Errors in your form",
            errors
        }
    }
    
    const img = result.status ? result.data.url : null

    const newUser = new User({
        nick_name: body.nick_name,
        password: await set_password_hash(body.password),
        description: body.description,
        avatar: img
    })
    
    await newUser.save();

    return {
        status: true,
        message: {
            "User": "Registrated",
            "Avatar": {
                "Status": result.status,
                "Messsage": result.message,
            }             
        },
        data: newUser
    }
}

async function set_password_hash(password) {
    return bcrypt.hashSync(password, process.env.PSSWORD_SALT)
}

module.exports = {
    login,
    register,
    compare_passwords,
}