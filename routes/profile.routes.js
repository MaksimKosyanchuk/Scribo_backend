const { Router } = require('express')
const { get_profile, save_post, follow, unfollow, read_notifications } = require('../services/profile.services')
const router = Router();
const multer = require('multer');

const upload = multer({
    limits: { fieldSize: 25 * 1024 * 1024 }
  })

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
            global.Logger.log(`User ${ result.data.user.nick_name } saved post`, result.data)
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

router.post('/follow', upload.none(), async (req, res) => {
    try {
        const result = await follow(req.body)

        const result_data = {
            status: result.status ? 'success' : 'error',
            message: result.message,
            data: result.data,
            errors: result.errors
        }

        if(result.status) {
            global.Logger.log(`User ${ result.data.follower.nick_name } followed ${result.data.followed.nick_name }`, result.data)
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

router.post('/unfollow', upload.none(), async (req, res) => {
    try {
        const result = await unfollow(req.body)
        
        const result_data = {
            status: result.status ? 'success' : 'error',
            message: result.message,
            data: result.data,
            errors: result.errors
        }

        if(result.status) {
            global.Logger.log(`User ${ result.data.follower.nick_name } unfollowed ${result.data.followed.nick_name }`, result.data)
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