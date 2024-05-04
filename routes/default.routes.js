const { Router } = require('express');

const router = Router()

router.get('/', async (req, res) => {
    global.Logger.log(`default request path from: ${req.ip}`)

    res.status(200).json({
        status: 'success',
        message: `Server is working, use /api/ for post/get query`
    })
})

module.exports = router
