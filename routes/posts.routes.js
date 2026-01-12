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

        if(posts.status) res.status(200)
        else{
            if(posts.errors) res.status(400)
            else res.status(404)
        }

        res.json(posts)
    }
    catch (e) {
        global.Logger.log(`Get post exception`, { message: e.message })

        res.status(500).json({
            status: false,
            message: "Internal server error"
        })
    }
})

router.get('/:id', async (req, res) => {
    try {
        const posts = await get_post_by_id(req)
        
        if(posts.status) res.status(200)

        else{
            if(posts.errors) res.status(400)
            else res.status(404)
        }

        res.json(posts)
    }
    catch(e) {
        global.Logger.log(`Get post exception`, { message: e.message })

        res.status(500).json({
            status: false,
            message: "Internal server error"
        })
    }
})

router.post('/', upload.single('featured_image'), async (req, res) => {
    try {
        const result = await create_post(req)

        if(result.errors) res.status(400)
        else if(!result.status) res.status(404)
        else res.status(200)
        
        res.json(result) 

    } catch (e) {
        console.log(e.message)

        res.status(500).json(
            {
                status: false,
                message: "Internal server error"
            }
        )
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const result = await delete_post(req)

        if(result.errors) res.status(400)
        else if(!result.status) res.status(404)
        else res.status(200) 

        res.json(result)

    } catch (e) {
        console.log(e.message)

        res.status(500).json(
            {
                status: false,
                message: "Internal server error"
            }
        )
    }
})

module.exports = router