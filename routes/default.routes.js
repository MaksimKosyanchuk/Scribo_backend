const { Router } = require('express');
const { default_route } = require('../services/default.services')

const router = Router()

router.get('/', async (req, res) => {
    try {

        const result = await default_route()
        
        res.status(200).send(result)
    }
    catch(e) {
        console.log(e)
        res.status(500).json({
            status: false,
            message: "Internal server error!"
        })
    }
})

module.exports = router
