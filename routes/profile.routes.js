const { Router } = require('express')
const { get_profile, save_post } = require('../services/profile.services')

const router = Router();

router.post('/', async (req, res) => {
    try {
        const user = await get_profile(req.body)
        
        const result_data = {
            status: user.status ? 'success' : 'error',
            message: user.message,
            data: user.data,
            errors: user.errors
        }

        res.status(200).json(result_data)
    }
    catch(e) {
        const result_data = {
            status: "error",
            message: e.message,
            data: null
        }

        global.Logger.log(`Get profile exception`, { message: e.message })

        res.status(500).json(result_data)
    }
})

router.post('/save-post', async (req, res) => {
    try {
        const result = await save_post(req.body)
        
        const result_data = {
            status: result.status ? 'success' : 'error',
            message: result.message,
            data: result.data,
            errors: result.errors
        }

        if(result.status) {
            global.Logger.log(`${ result.message }`, result.data)
        }
        else {
            global.Logger.log(`${ result.message }`, { data: result.data, errors: result.errors })
        }

        res.status(200).json(result_data)
    }
    catch(e) {
        const result_data = {
            status: "error",
            message: e.message,
            data: null
        }

        global.Logger.log(`Exception on save post`, { message : e.message })

        res.status(500).json(result_data)
    }
})

module.exports = router;