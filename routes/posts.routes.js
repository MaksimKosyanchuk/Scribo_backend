const { Router } = require("express");
const Post = require('../models/Post');
const User = require('../models/User');
const { create_post, get_post_by_id } = require("../services/posts.services");

const router = Router();

router.get('/', async (req, res) => {
    try {
        const posts = await Post.find();
        return res.status(200).json({
            status: 'success',
            message: "",
            data: posts
    })
    } catch (e) {
        console.log(e);
    }
});

router.get('/:id', async (req, res) => {
    try{
        let post = await get_post_by_id(req.params.id);

        return res.status(200).json({
            status: post.status? "success" : "error",
            message: post.message,
            data: post.data
        })
    }
    catch(e) {
        console.log(e)
    }
});

router.post('/create-post', async (req, res) => {
    try {
        const result = await create_post(req);

        return res.status(200).json({
            status: result.status ? "success" : "error",
            message: result.message,
            data: result.data
        })

    } catch (e) {
        console.log(e);
    }
})

module.exports = router;