const { Router } = require('express')
const { create_post, get_posts, delete_post } = require('../services/posts.services')
const router = Router()
const multer = require('multer');

const upload = multer({
    limits: { fieldSize: 25 * 1024 * 1024 }
  })

router.get('/', async (req, res) => {
    try {
        const posts = await get_posts(req.query)

        const result_data = {
            status: posts.status ? 'success' : 'error',
            message: posts.message,
            data: posts.data
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

router.get('/:id', async (req, res) => {
    try {
        const posts = await get_posts({ "_id": req.params.id })
        
        const result_data = {
            status: posts.status ? 'success' : 'error',
            message: posts.message,
            data: posts.data ? posts.data[0] : null
        }

        res.status(200).json(result_data)
    }
    catch(e) {
        const result_data = {
            status: "error",
            message: e.message,
            data: null
        }

        global.Logger.log(`Get post exception`, { message: e.message })

        res.status(500).json(result_data)
    }
})

router.post('/create-post', upload.single('featured_image'), async (req, res) => {
    try {
        const result = await create_post(req.body, req.file)

        const result_data = {
            status: result.status ? 'success' : 'error',
            message: result.message,
            data: result.data,
            errors: result.errors
        }

        if(result.status) {
            global.Logger.log(`User ${ result_data.data.user.nick_name } created post`, result.data)
        }

        res.status(200).json(result_data)

    } catch (e) {
        console.log(e)
        const result_data = {
            status: "error",
            message: e.message,
            data: null
        }

        global.Logger.log(`Create post exception`, { message: e.message })

        res.status(500).json(result_data)
    }
})

router.delete('/delete-post/:id', async (req, res) => {
    try {
        const result = await delete_post(req.headers, req.params)

        const result_data = {
            status: result.status ? 'success' : 'error',
            message: result.message,
            data: result.data,
            errors: result.errors
        }

        if(result.status) {
            global.Logger.log(`User ${ result_data.data.user.nick_name } deleted post`, result.data)
        }

        res.status(200).json(result)

    } catch (e) {
        console.log(e)
        const result_data = {
            status: "error",
            message: e.message,
            data: null
        }

        global.Logger.log(`Delete post exception`, { message: e.message })

        res.status(500).json(result_data)
    }
})

module.exports = router