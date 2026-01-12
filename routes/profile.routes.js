const { Router } = require('express')
const { get_profile, save_post, unsave_post, read_notifications } = require('../services/profile.services')
const router = Router();
const multer = require('multer');

const upload = multer({
    limits: { fieldSize: 25 * 1024 * 1024 }
  })

router.get('/', async (req, res) => {
    try {
        const user = await get_profile(req)

        if(user.status) res.status(200)
        else { 
            if(user.errors) res.status(400)
            else res.status(404)
        }

        res.json(user)
    }
    catch(e) {
        global.Logger.log(`Get profile exception`, { message: e.message })

        res.status(500).json({
            status: false,
            message: "Internal server error"
        })
    }
})

router.post('/save-post/:id', async (req, res) => {
    try {
        const result = await save_post(req)
        
        res.status(result.code)

        delete result.code

        res.json(result)
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

router.delete('/save-post/:id', async (req, res) => {
    try {
        const result = await unsave_post(req)
        
        res.status(result.code)

        delete result.code

        res.json(result)
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

router.post('/read-notifications', upload.none(), async(req, res) => {
    try {
        const result = await read_notifications(req.body)

        const result_data = {
            status: result.status ? 'success' : 'error',
            message: result.message,
            data: result.data,
            errors: result.errors
        }

        if(result.status) {
            global.Logger.log(`User ${ result.data.user } readed all notifications`, result.data.nick_name)
        }

        res.status(200).json(result_data)
    }
    catch(e) {
        const result_data = {
            status: "error",
            message: e.message,
            data: null
        }

        global.Logger.log(`Exception on follow`, { message : e.message })

        res.status(500).json(result_data)
    }
})

module.exports = router;