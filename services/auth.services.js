const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {get_user_by_name} = require('./users.services')

async function compare_passwords(password, from_db) {    
    return await bcrypt.compare(password, from_db);
}

async function set_jwt_token(user_id) {
    const key = process.env.JWTKEY;
    
    let token = await jwt.sign(
        {user_id: user_id},
        key,
        {}
    );

    console.log(token)

    return token;
}

async function get_jwt_token(token) {
    const key = process.env.JWTKEY

    return jwt.verify(token, key, function(err, decoded) {
        if (err){
            return({
                status: false,
                message: err,
                data: null
            })
        }
        return ({
            status: true,
            message: "",
            data: decoded
        });
      });
}

async function login(user_nick_name, user_password) {

    const auth_result = auth_data_validation(user_nick_name, user_password);

    if(!auth_result.status){
        return {
            status: false,
            message: auth_result.message,
            data: null
        }
    }

    const find_user = await User.findOne({ 'nick_name': user_nick_name });

    if(!find_user) {
        return {
            status: false,
            message: "User doesn`t exists",
            data: null
        }
    } 
    const is_match = await compare_passwords(user_password, find_user.password)
   
    if(!is_match) {
        return {
            status: false,
            message: "incorrect password ",
            data: null
        }
    }

    return {
        status: true,
        message: auth_result.message,
        data: await set_jwt_token(find_user._id)
    }
}

function auth_data_validation(nick_name, password)
{
    if(!nick_name || !password) return { status: false, message: "invalid nickname or password" }
    if( 8 > password.length || password.length > 100) return { status: false, message: "Password length must be more than 8 and less then 100!" }
    return { status: true, message: "authorized" }
}

async function register(req) {
    console.log(req.body)
    const { nick_name, password } = req.body;

    let auth = auth_data_validation(nick_name, password)
    if(!auth.status){
        return {
            status: false,
            message: auth.message,
            data: null
        }
    }

    let user = await get_user_by_name(nick_name);
    if (user.status) {
        return {
            status: false,
            message: "Current login is exists",
            data: null
        }
    }

    const newUser = new User({
        nick_name: nick_name,
        password: await set_password_hash(password),
        avatar: req.body.avatar,
    })
    
    await newUser.save();

    return {
        status: true,
        message: "Registrated",
        data: user.data
    }
}

async function set_password_hash(password) {
    return await bcrypt.hashSync(password, process.env.PSSWORD_SALT);
}

module.exports = {
    compare_passwords,
    login,
    register,
    get_jwt_token
};