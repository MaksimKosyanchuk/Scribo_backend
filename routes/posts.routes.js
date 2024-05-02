const { Router } = require('express')
const { create_post, get_posts } = require('../services/posts.services')
const router = Router()
const multer = require('multer');
const upload = multer({
    limits: { fieldSize: 25 * 1024 * 1024 }
  })

router.get('/', async (req, res) => {
    try {
        let posts = await get_posts(req.query)

        return res.status(200).json({
            status: posts.status ? 'success' : 'error',
            message: posts.message,
            data: posts.data
        })
    }
    catch (e) {
        console.log(e)
    }
})

router.get('/:id', async (req, res) => {
    try {
        let posts = await get_posts({ "_id": req.params.id })

        return res.status(200).json({
            status: posts.status ? 'success' : 'error',
            message: posts.message,
            data: posts.data ? posts.data[0] : null
        })
    }
    catch(e) {
        console.log(e)
    }
})

router.post('/create-post', upload.single('featured_image'), async (req, res) => {
    try {
        const result = await create_post(req.body.token, req.body.title, req.body.featured_image, req.body.content_text)

        return res.status(200).json({
            status: result.status ? 'success' : 'error',
            message: result.message,
            data: result.data
        })

    } catch (e) {
        console.log(e)
    }
})

module.exports = router