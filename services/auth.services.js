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
    let fields = []
    const hasGoogleToken = Boolean(body.google_token);
    const hasPasswordAuth = Boolean(body.user_login) && Boolean(body.password);

    if (
        (hasGoogleToken && hasPasswordAuth) ||
        (!hasGoogleToken && !hasPasswordAuth)
    ) {
        return {
            status: false,
            message: "Authentication requires either googleToken OR user_login + password",
            data: null,
            code: 400
        };
    }

    if(body.password) fields.push({ type: "password", source: "body", value: body.password })
    if(body.google_token) fields.push({ type: "google_token", source: "body", value: body.google_token })
    
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
    if(hasGoogleToken) {
        const result = await google_token_verify(req)

        if(result.status) {
            if(result.code === 200) {
                return {
                    status: true,
                    message: "Authorized!",
                    data: {
                        token: await set_jwt_token(result.data._id)
                    },
                    code: 200
                }
            }
        }
        return result
    }

    let user = null

    if(body.user_login) user = await get_user_by_query(
        {
            $or: [
            { nick_name: body.user_login },
            { email: body.user_login }
            ]
        },
        { with_password: true }
    );
    
    if(!user) {
        return {
            status: false,
            message: "User not found!",
            data: null,
            code: 404
        }
    }
    
    if(!user.status) {
        return {
            status: false,
            message: "User not found!",
            data: null,
            errors: {
                body: { 
                    user_login: {
                        message: "User not found!",
                        data: body.user_login
                    }
                }
            },
            code: 404
        }
    }

    const is_match = await compare_passwords(body.password, user.data.password)
    
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
        message: `User ${user.data.nick_name} logged in`,
        data: {
            user: user.data._id
        }
    })

    return {
        status: true,
        message: "Authorized!",
        data: {
            token: await set_jwt_token(user.data._id)
        },
        code: 200
    }
}

async function register(req) {
    const body = req.body
    const avatar = req.file
    params = ["nick_name", "description", "password"]
    fields = []
    const hasGoogle = Boolean(body.google_token);
    const hasEmailAuth = Boolean(body.email) && Boolean(body.code);
    const isValid =
    (hasGoogle && !hasEmailAuth) ||
    (!hasGoogle && hasEmailAuth);
    
    if (!isValid) {
        return {
            status: false,
            message: "Authentication requires either a google token or email and verification code",
            data: null,
            code: 400
        };
    }
    
    params.map((param) => { fields.push({ type: param, value: body[param], source: "body" }) })
    
    let email

    if(hasGoogle) {
        const google_token_verification = await google_token_verify(req)
        if(google_token_verification.status) {
            return {
                status: false,
                message: "This email is already registered!",
                data: null,
                code: 409
            }
        }
        if(google_token_verification.code === 404) email = google_token_verification.data.email
    }

    if(hasEmailAuth) {
        email = body.email
        fields.push({ type: "email_code", value: body.code, source: "body" })
        fields.push({ type: "email", value: body.email, source: "body" })
    }

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

    const user_by_email = await get_user_by_query({ "email": email })
    if (user_by_email.status) {
        return {
            status: false,
            message: "User with this email is exists!",
            data: null,
            errors: {
                body: {
                    email: {
                        message: "This email is already in use!",
                        data: body.email
                    }
                }
            },
            code: 409
        }
    }

    if(hasEmailAuth) {
        const email_code_verification = await verify_code(email, body.code)
    
        if(!email_code_verification.status){
            return {
                status: false,
                message: "Email verification code is invalid or expired!",
                errors: {
                    body: {
                        code: {
                            message: email_code_verification.message,
                            data: body.code
                        }
                    }
                },
                code: 403
            }
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
        avatar: img,
        email: email
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

    const user = await get_user_by_query({ email: req.body.email })

    if(user.status) {
        return {
            status: false,
            message: "This email is already registered!",
            data: null,
            code: 409
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
        return {
            status: true,
            message: result.message,
            data: null,
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

async function google_token_verify(req) {
    const body = req.body
    const validation = await field_validation([
        {
            type: "google_token",
            source: "body",
            value: body.google_token
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

    const google_result = await fetch(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
            headers: {
                Authorization: `Bearer ${body.google_token}`
            }
        }
    );

    if(google_result.status === 401){ 
        return {
            status: false,
            message: "Bad request!",
            data: null,
            errors: {
                google_token: {
                    message: "Unauthorized!",
                    data: body.google_token
                }
            },
            code: 400
        }
    }
    const user_email = (await google_result.json()).email
    const user = await get_user_by_query({ email: user_email })

    if(!user.status) {
        return {
            status: false,
            message: "User not found!",
            data: {
                email: user_email
            },
            code: 404
        }
    }

    return {
        status: true,
        message: "Success",
        data: {
            email: user_email,
            _id: user.data._id
        },
        code: 200
    }
}

module.exports = {
    login,
    register,
    compare_passwords,
    request_verification_code,
    verify_email_code,
    google_token_verify
}