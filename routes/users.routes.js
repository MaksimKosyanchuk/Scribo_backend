const { Router } = require('express')
const { get_user, get_users, follow_by_nick_name, unfollow_by_nick_name } = require('../services/users.services')

const router = Router()

router.get('/:nick_name', async (req, res) => {
    try {
        const user = await get_user(req)
        
        res.status(user.code)

        delete user.code

        res.json(user)
    }
    catch(e) {
        console.log(e)

        res.status(500).json({
            status: false,
            message: "Internal server error",
            data: null
        })
    }
})

router.get('/', async (req, res) => {
    try {
        const users = await get_users(req)

        res.status(users.code)

        delete users.code

        res.json(users)
    }
    catch (e) {
        console.log(e)

        res.status(500).json({
            status: false,
            message: "Internal server error",
            data: null
        })
    }
})

router.post('/:nick_name/follow', async (req, res) => {
    try {
        const user = await follow_by_nick_name(req)

        res.status(user.code)

        delete user.code

        res.json(user)
    }
    catch(e) {
        console.log(e)

        res.status(500).json({
            status: false,
            message: "Internal server error",
            data: null
        })
    }
})

router.delete('/:nick_name/follow', async (req, res) => {
    try {
        const user = await unfollow_by_nick_name(req)
        
        res.status(user.code)
        
        delete user.code

        res.json(user)
    }
    catch(e) {
        console.log(e)

        res.status(500).json({
            status: false,
            message: "Internal server error",
            data: null
        })
    }
})

module.exports = router