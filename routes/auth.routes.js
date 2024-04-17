const { Router } = require('express')
const { login, register } = require('../services/auth.services')

const router = Router();

router.post('/login', async (req, res) => {
    console.log("START LOGIN")
    try {
        let result = await login(req.body.nick_name, req.body.password) 
        return res.status(200).json({
            status: result.status ? 'success' : 'error',
            message: result.message,
            data: result.data
        })
    }
    catch(e) {
        console.log(e)
    }
})

router.post('/register', async (req, res) => {
    try {
<<<<<<< HEAD
        let reg = await register(req.body.nick_name, req.body.password)
=======
        let reg = await register(req.body.nick_name, req.body.password, req.body.avatar)
>>>>>>> e733090b85b2542af86225c2e310b0a370b7d922
        
        return res.status(200).json({
            status: reg.status ? 'success' : 'error',
            message: reg.message,
            data: reg.data
        })
    }
    catch (e) {
        console.log(e)
    }
})

module.exports = router