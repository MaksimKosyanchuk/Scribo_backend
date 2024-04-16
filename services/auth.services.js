const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const { get_user } = require("./users.services")

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
                message: "Invalid token or user_id not found",
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

async function login(user_nick_name, user_password) {
    const auth_result = auth_data_validation(user_nick_name, user_password)

    if(!auth_result.status) {
        return {
            status: false,
            message: auth_result.message,
            data: null
        }
    }

    const find_user = await get_user({ 'nick_name': user_nick_name }, { with_password: true })

    if(!find_user.status) {
        return {
            status: false,
            message: "User doesn`t exists",
            data: null
        }
    } 

    const is_match = await compare_passwords(user_password, find_user.data.password)
   
    if(!is_match) {
        return {
            status: false,
            message: 'Incorrect "password"',
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

function auth_data_validation(nick_name, password) {
    if(!nick_name || !password) {
        return {
            status: false,
            message: 'Invalid "nick_name" or "password"' 
        }
    }

    if(8 > password.length || password.length > 100) { 
        return {
            status: false,
            message: '"password" length must be more than 8 and less then 100!'
        }
    }

    return {
        status: true,
        message: "Authorized" 
    }
}

async function register(nick_name, password) {
    let auth = auth_data_validation(nick_name, password)

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

    const avatar = validate_image(req.body.avatar)

    const newUser = new User({
        nick_name: nick_name,
        password: await set_password_hash(password),
        avatar: avatar.data
    })
    
    await newUser.save();

    return {
        status: true,
        message: `Registrated, ${avatar.message}`,
        data: user.data
    }
}

function validate_image(avatar){
    let is_link = /^https?:\/\/\S+$/.test(avatar)

    return {
        status: is_link,
        message: is_link ? '"avatar" path is correct' : '"avatar" path is not a link',
        data: is_link ? avatar : null 
    }
}

async function set_password_hash(password) {
    return bcrypt.hashSync(password, process.env.PSSWORD_SALT)
}

module.exports = {
    login,
    register,
    get_jwt_token,
    validate_image,
    compare_passwords,
    set_jwt_token
}