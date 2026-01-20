const bcrypt = require("bcryptjs")
const { get_user_by_query } = require('../db/users')
const { create_new_user } = require('../db/auth')
const { upload_image } = require("./aws.services")
const { field_validation } = require("./utils/validation")
const { set_jwt_token } = require("./utils/jwt")
const { send_verification_code, verify_code, is_verification_code_exists, invalidate_verification_code } = require("./email/email.services")
const email = require("../models/email")

async function compare_passwords(password, from_db) {    
    return await bcrypt.compare(password, from_db)
}

async function login(req) {
    const body = req.body
    params = ["nick_name", "password"]
    fields = []

    params.map((param) => { fields.push({ type: param, value: req.body[param], source: "body" }) })
    let validation = await field_validation(fields)

    if(!validation.status) {
        return {
            status: false,
            message: "Some errors in your fields!",
            data: null,
            errors: validation.errors,
            code: 400
        }
    }

    let find_user = await get_user_by_query({ 'nick_name': body.nick_name }, { with_password: true })
    
    if(!find_user.status) {
        return {
            status: false,
            message: "User not found!",
            data: null,
            errors: {
                body: { 
                    nick_name: {
                        message: "User not found!",
                        data: body.nick_name
                    }
                }
            },
            code: 404
        }
    }

    const is_match = await compare_passwords(body.password, find_user.data.password)
    
    if(!is_match) {
        return {
            status: false,
            message: "Wrong password!",
            data: null,
            errors: {
                body: { 
                    password: {
                        message: "Wrong password!",
                        data: body.password
                    }
                }
            },
            code: 401
        }
    }
    
    global.Logger.log({
        type: "login",
        message: `User ${find_user.data.nick_name} logged in`,
        data: {
            user: find_user.data._id
        }
    })

    return {
        status: true,
        message: "Authorized!",
        data: {
            token: await set_jwt_token(find_user.data._id)
        },
        code: 200
    }
}

async function register(req) {
    const body = req.body
    const avatar = req.file
    params = ["nick_name", "description", "password"]
    fields = []

    params.map((param) => { fields.push({ type: param, value: req.body[param], source: "body" }) })

    let validation = await field_validation(fields)

    if(!validation.status) {
        return {
            status: false,
            message: "Some errors in your fields!",
            data: null,
            errors: validation.errors,
            code: 400
        }
    }

    const user = await get_user_by_query({ "nick_name": body.nick_name })

    if (user.status) {
        return {
            status: false,
            message: "User with this nick_name is exists!",
            data: null,
            errors: {
                body: {
                    nick_name: {
                        message: "This username is already in use!",
                        data: body.nick_name
                    }
                }
            },
            code: 409
        }
    }

    let upload_image_result

    if(avatar) {
        upload_image_result = await upload_image(avatar, "avatar", body.nick_name)
        if(!upload_image_result.status) {
            return {
                status: false,
                message: "Something wrong with your avatar",
                data: null,
                errors: {
                    file: {
                        avatar: result.errors
                    }
                },
                code: 400
            }
        }
    }
    
    const img = upload_image_result ? upload_image_result.data.url : null

    let new_user = await create_new_user({
        nick_name: body.nick_name,
        password: await set_password_hash(body.password),
        description: body.description,
        avatar: img
    })

    delete new_user.data.password

    global.Logger.log({
        type: "register",
        message: `User ${new_user.data.nick_name} has registered`
    })

    return {
        status: true,
        message: "Success registered",
        data: new_user.data,
        code: 200
    }
}

async function set_password_hash(password) {
    return bcrypt.hashSync(password, process.env.PSSWORD_SALT)
}

async function request_verification_code(req) {
    const validation = await field_validation([ {
        type: "email",
        source: "body",
        value: req.body.email
    }])

    if(!validation.status) {
        return {
            status: false,
            message: "Some errors in your fields!",
            data: null,
            errors: validation.errors,
            code: 400
        }
    }

    const result = await send_verification_code(req.body.email)

    if(result.status) {
        return {
            status: true,
            message: result.message,
            data: null,
            code: 200
        }
    }
}

async function verify_email_code(req) {
    const validation = await field_validation([
        {
            type: "email",
            source: "body",
            value: req.body.email
        },
        {
            type: "email_code",
            source: "body",
            value: req.body.code
        }
    ])

    if(!validation.status) {
        return {
            status: false,
            message: "Some errors in your fields!",
            data: null,
            errors: validation.errors,
            code: 400
        }
    }

    const code_exists = await is_verification_code_exists(req.body.email)

    if(!code_exists) {
        return {
            status: false,
            message: "Verification code has expired or does not exist!",
            data: null,
            code: 404
        }
    }

    const result = await verify_code(req.body.email, req.body.code)

    if(result.status) {
        await invalidate_verification_code(req.body.email)
        return {
            status: true,
            message: result.message,
            data: result.data,
            code: 200
        }
    }

    return {
        ...result,
        data: {
            email: req.body.email,
            code: req.body.code
        },
        code: 401
    }
}

module.exports = {
    login,
    register,
    compare_passwords,
    request_verification_code,
    verify_email_code
}