const { Router } = require('express')
const { create_post, get_posts, get_post_by_id, delete_post } = require('../services/posts.services')
const router = Router()
const multer = require('multer');

const upload = multer({
    limits: { fieldSize: 25 * 1024 * 1024 }
})

router.get('/', async (req, res) => {
    try {
        const posts = await get_posts(req)

        res.status(posts.code)

        delete posts.code

        res.json(posts)
    }
    catch (e) {
        console.log(e)

        res.status(500).json({
            status: false,
            message: "Internal server error",
            data: null
        })
    }
})

router.get('/:id', async (req, res) => {
    try {
        const posts = await get_post_by_id(req)
        
        res.status(posts.code)

        delete posts.code

        res.json(posts)
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

router.post('/', upload.single('featured_image'), async (req, res) => {
    try {
        const result = await create_post(req)

        res.status(result.code)

        delete result.code
        
        res.json(result) 

    } catch (e) {
        console.log(e)

        res.status(500).json({
            status: false,
            message: "Internal server error",
            data: null
        })
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const result = await delete_post(req)

        res.status(result.code)

        delete result.code

        res.json(result)

    } catch (e) {
        console.log(e)

        res.status(500).json(
            {
                status: false,
                message: "Internal server error",
                data: null
            }
        )
    }
})

module.exports = router