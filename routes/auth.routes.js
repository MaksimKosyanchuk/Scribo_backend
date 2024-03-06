const { Router } = require("express");
const Post = require('../models/Post');
const User = require('../models/User');
const {getUserBy } = require('../services/users.services');  
const {compare_passwords, get_jwt_token} = require('../services/auth.services')

const router = Router();

router.post('/login', async (req, res) => {
    const user_nick_name = req.body.nick_name;
    const user_password = req.body.password;

    //Validation of received data
    const auth_result = auth_data_validation(user_nick_name, user_password);
    if(!auth_result.status){
        return res.status(200).json({
                status: "error",
                message: auth_result.message,
                data: null
            }
        )
    }

    //Check if user is exists 
    const find_user = await getUserBy( 'nick_name', user_nick_name );
    if(!find_user.status) {
        return res.status(200).json({
            status: "error",
            message: "User doesn`t exists",
            data: null
        })
    }

    //Check correct password
    const is_match = await compare_passwords(user_password, find_user.data.password)
    if(!is_match) {
        return res.status(200).json({
            status: "error",
            message: "incorrect password ",
            data: null
        })
    }

    //Succes auth
    return res.status(200).json({
        status: "succes",
        message: auth_result.message,
        data: await get_jwt_token(find_user.data._id)
    })
})

function auth_data_validation(nick_name, password)
{
    if(!nick_name || !password) return { status: false, message: "invalid nickname or password" }
    if( 8 > password.length || password.length > 100) return { status: false, message: "Password length must be more than 8 and less then 100!" }
    return { status: true, message: "authorized" }
}

router.get('/register', async (req, res) => {
    try {
        const { title, content_text, image } = req.body;

        console.log(title, content_text, image)
        const newPost = await new User({
            title: title,
            content_text: content_text,
            image: image
        })

        await newPost.save()
        res.status(200).json({ status: "succes", message: "Post created", data: newPost });
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
})

module.exports = router;