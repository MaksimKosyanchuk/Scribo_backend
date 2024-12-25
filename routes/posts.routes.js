const { Router } = require('express')
const { create_post, get_posts } = require('../services/posts.services')
const router = Router()
const multer = require('multer');
const upload = multer({
    limits: { fieldSize: 25 * 1024 * 1024 }
  })

router.get('/', async (req, res) => {
    global.Logger.log(`get posts request from: ${req.ip}`)
    
    try {
        const posts = await get_posts(req.query)

        const result_data = {
            status: posts.status ? 'success' : 'error',
            message: posts.message,
            data: posts.data
        }

        global.Logger.log(`response to: ${req.ip}`, result_data)

        res.status(200).json(result_data)
    }
    catch (e) {
        const result_data = {
            status: "error",
            message: e.message,
            data: null
        }

        global.Logger.log(`response to: ${req.ip}`, result_data)

        res.status(500).json(result_data)
    }
})

router.get('/:id', async (req, res) => {
    global.Logger.log(`get posts/${req.params.id} request from: ${req.ip}`)

    try {
        const posts = await get_posts({ "_id": req.params.id })
        
        const result_data = {
            status: posts.status ? 'success' : 'error',
            message: posts.message,
            data: posts.data ? posts.data[0] : null
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

router.post('/create-post', upload.single('featured_image'), async (req, res) => {
    global.Logger.log(`get create-post request from: ${req.ip}`)
    try {
        const result = await create_post(req.body, req.file)

        const result_data = {
            status: result.status ? 'success' : 'error',
            message: result.message,
            data: result.data,
            errors: result.errors
        }

        global.Logger.log(`response to: ${req.ip}`, result_data)

        res.status(200).json(result_data)

    } catch (e) {
        console.log(e)
        const result_data = {
            status: "error",
            message: e.message,
            data: null
        }

        global.Logger.log(`response to: ${req.ip}`, result_data)

        res.status(500).json(result_data)
    }
})

module.exports = router