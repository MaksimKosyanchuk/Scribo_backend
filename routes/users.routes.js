const { Router } = require('express')
const { get_user } = require('../services/users.services')

const router = Router()

router.get('/:nick_name', async (req, res) => {
    try{
        const user = await get_user({ 'nick_name': req.params.nick_name })
        
        const result_data = {
            status: user.status ? 'success' : 'error',
            message: user.message,
            data: user.data
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

module.exports = router