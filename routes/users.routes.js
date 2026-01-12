const { Router } = require('express')
const { get_user, get_users, follow_by_id, unfollow_by_id } = require('../services/users.services')

const router = Router()

router.get('/:nick_name', async (req, res) => {
    try {
        const user = await get_user(req)
        
        if(user.status) res.status(200)
        else {
            if(user.errors) res.status(400)
            else res.status(404)
        }

        res.json(user)
    }
    catch(e) {
        console.log(e.message)

        res.status(500).json({
            status: false,
            message: "Internal server error"
        })
    }
})

router.get('/', async (req, res) => {
    try {
        const users = await get_users(req)

        if(users.status) res.status(200)
        else {
            if(users.errors) res.status(400)
            else res.status(404)
        }

        res.json(users)
    }
    catch (e) {
        console.log(e.message)

        res.status(500).json({
            status: false,
            message: "Internal server error"
        })
    }
})

router.post('/:nick_name/follow', async (req, res) => {
    try {
        const user = await follow_by_id(req)

        res.status(user.code)

        delete user.code

        res.json(user)
    }
    catch(e) {
        console.log(e)

        res.status(500).json({
            status: false,
            message: "Internal server error"
        })
    }
})

router.delete('/:nick_name/follow', async (req, res) => {
    try {
        const user = await unfollow_by_id(req)
        
        res.status(user.code)
        
        delete user.code

        res.json(user)
    }
    catch(e) {
        console.log(e)

        res.status(500).json({
            status: false,
            message: "Internal server error"
        })
    }
})

module.exports = router