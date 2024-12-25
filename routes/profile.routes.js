const { Router } = require('express')
const { get_profile, save_post } = require('../services/profile.services')

const router = Router();

router.post('/', async (req, res) => {
    global.Logger.log(`get profile request from: ${req.ip}`)
    
    try {
        const user = await get_profile(req.body)
        
        const result_data = {
            status: user.status ? 'success' : 'error',
            message: user.message,
            data: user.data,
            errors: user.errors
        }

        global.Logger.log(`response to: ${req.ip}`, result_data)

        res.status(200).json(result_data)
    }
    catch(e) {
        const result_data = {
            status: "error",
            message: e.message,
            data: null
        }

        global.Logger.log(`response to: ${req.ip}`, result_data)

        res.status(500).json(result_data)
    }
})

router.post('/save-post', async (req, res) => {
    global.Logger.log(`get save-post request from: ${req.ip}`)

    try {
        const user = await save_post(req.body)
        
        const result_data = {
            status: user.status ? 'success' : 'error',
            message: user.message,
            data: user.data,
            errors: user.errors
        }

        global.Logger.log(`response to: ${req.ip}`, result_data)

        res.status(200).json(result_data)
    }
    catch(e) {
        const result_data = {
            status: "error",
            message: e.message,
            data: null
        }

        global.Logger.log(`response to: ${req.ip}`, result_data)

        res.status(500).json(result_data)
    }
})

module.exports = router;