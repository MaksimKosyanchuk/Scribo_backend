const { Router } = require('express')
const { get_users } = require('../services/users.services')

const router = Router()

router.get('/:nick_name', async (req, res) => {
    try{
        const user = await get_users({ 'nick_name': req.params.nick_name })
        
        const result_data = {
            status: user.status ? 'success' : 'error',
            message: user.message,
            data: user.data[0]
        }
        
        res.status(200).json(result_data)
    }
    catch(e){
        const result_data = {
            status: "error",
            message: e.message,
            data: null
        }

        global.Logger.log(`Exception on get user`, { message : e.message })

        res.status(500).json(result_data)
    }
})

router.get('/', async (req, res) => {
    try {
        const users = await get_users(req.query)

        const result_data = {
            status: users.status ? 'success' : 'error',
            message: users.message,
            data: users.data
        }

        res.status(200).json(result_data)
    }
    catch (e) {
        const result_data = {
            status: "error",
            message: e.message,
            data: null
        }

        global.Logger.log(`Get post exception`, { message: e.message })

        res.status(500).json(result_data)
    }
})


module.exports = router