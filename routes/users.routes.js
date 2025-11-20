const { Router } = require('express')
const { get_user, get_users } = require('../services/users.services')

const router = Router()

router.get('/:nick_name', async (req, res) => {
    try{
        const user = await get_user(req)
        
        if(user.status) res.status(200)
        else {
            if(user.errors) res.status(400)
            else res.status(404)
        }

        res.json(user)
    }
    catch(e) {
        const result_data = {
            status: false,
            message: "Internal server error",
            data: {
                params: req.params.nick_name
            }
        }

        console.log(e.message)

        res.status(500).json(result_data)
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
        const result_data = {
            status: "error",
            message: "Internal server error",
            data: req.query
        }

        console.log(e.message)

        res.status(500).json(result_data)
    }
})


module.exports = router