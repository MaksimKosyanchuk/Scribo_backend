const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const { get_user } = require("./users.services")
const { upload_image } = require("./upload.services")

async function compare_passwords(password, from_db) {    
    return await bcrypt.compare(password, from_db)
}

async function set_jwt_token(user_id) {
    const key = process.env.JWTKEY

    return jwt.sign(
        { user_id: user_id },
        key,
        {}
    )
}

async function get_jwt_token(token) {
    const key = process.env.JWTKEY
    try {
        const decoded = await jwt.verify(token, key);
        
        if (decoded && decoded.user_id) {
            return {
                status: true,
                message: "",
                data: decoded.user_id
            };
        }

        else {
            return {
                status: false,
                message: "Invalid token",
                data: null
            };
        }
    }
    catch (err) {
        return {
            status: false,
            message: err.message,
            data: null
        };
    }
}

async function login(body) {
    let errors = {}

    for (let item of ['nick_name', 'password']) {
        const validation = await field_validation(item, body[item])

        if(!validation.is_valid) {
            errors[item] = validation.message
        }
    }

    const find_user = await get_user({ 'nick_name': body.nick_name }, { with_password: true })
    
    if(!errors.nick_name) {
        if(!find_user.status) {
            errors.nick_name = "Current user doesn`t exists"
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
            user_id: find_user.data._id,
            token: await set_jwt_token(find_user.data._id)
        }
    }
}

async function field_validation(type, value) {
    switch (type) {
        case "description":
            if(!value || value.length > 30) {
                return {
                    is_valid: false,
                    message: "Description must be less then 30",
                }
            }
            break;
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
                    message: "Nick name must be more then 2 and less then 21!",
                }
            }
    }

    return {
        is_valid: true,
        message: "Valide"
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

    const user = await get_user({ "nick_name": body.nick_name })

    if (user.status) {
        errors.nick_name = "Current login is exists"
    }

    const result = await upload_image(avatar, "avatar", body.nick_name)
    console.log(result)
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
    get_jwt_token,
    compare_passwords,
    set_jwt_token
}