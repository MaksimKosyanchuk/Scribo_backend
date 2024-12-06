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
        {user_id: user_id},
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
        } else {
            return {
                status: false,
                message: "Invalid 'token'",
                data: null
            };
        }
    } catch (err) {
        return {
            status: false,
            message: err.message,
            data: null
        };
    }
}

async function login(nick_name, password) {
    const auth_result = auth_data_validation(nick_name, password)

    if(!auth_result.status) {
        return {
            status: false,
            message: auth_result.message,
            data: null
        }
    }

    const find_user = await get_user({ 'nick_name': nick_name }, { with_password: true })

    if(!find_user.status) {
        return {
            status: false,
            message: "User doesn`t exists",
            data: null
        }
    } 

    const is_match = await compare_passwords(password, find_user.data.password)
   
    if(!is_match) {
        return {
            status: false,
            message: "Incorrect 'password'",
            data: null
        }
    }

    return {
        status: true,
        message: auth_result.message,
        data: {
            user_id: find_user.data._id,
            token: await set_jwt_token(find_user.data._id)
        }
    }
}

function auth_data_validation(nick_name, password, description) {
    if(!description){
        description = null
    }
    else{
        if(description.length > 30) {
            return {
                status: false,
                message: "Description must be less then 30",
                data: {
                    description: description
                }
            }
        }
        
    }
    
    if(!nick_name || nick_name.length < 3 || nick_name.length > 20) {
        return {
            status: false,
            message: "'nick_name' must be more then 2 and less then 21!",
            data: {
                description: description
            }
        }
    }
    
    if(!password || password.length < 8 || password.length > 20) {
        return {
            status: false,
            message: "'passowrd' must be more then 7 and less then 21!",
            data: {
                description: description
            }
        }
    }

    return {
        status: true,
        message: "",
        data: {
            description: description
        }
    }
}

async function register(nick_name, password, description, avatar) {
    let auth = auth_data_validation(nick_name, password, description)

    if(!auth.status) {
        return {
            status: false,
            message: auth.message,
            data: null
        }
    }

    let user = await get_user({ "nick_name": nick_name })

    if (user.status) {
        return {
            status: false,
            message: "Current login is exists",
            data: null
        }
    }

    const result = await upload_image(avatar)
    const img = result.status ? result.data.url : null

    const newUser = new User({
        nick_name: nick_name,
        password: await set_password_hash(password),
        description: auth.data.description,
        avatar: img
    })
    
    await newUser.save();

    return {
        status: true,
        message: `Registrated`,
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