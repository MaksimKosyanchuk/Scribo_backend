const { Router } = require('express');

const router = Router()

router.get('/', async (req, res) => {

    return res.status(200).json({
        status: 'success',
        message: `Server is working, use /api/ for post/get query`
    })
})

module.exports = router
