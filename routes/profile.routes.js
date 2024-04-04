const { Router } = require('express')
const { get_profile } = require('../services/profile.services')

const router = Router();

router.post('/', async (req, res) => {
    try {
        const user = await get_profile(req.body.token)
        
        return res.status(200).json({
            status: user.status ? 'success' : 'error',
            message: user.message,
            data: user.data
        })
    }
    catch(e) {
        console.log(e)
    }
})

module.exports = router;