const { Router } = require('express')
const { login, register } = require('../services/auth.services')

const router = Router();

router.post('/login', async (req, res) => {
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
        let reg = await register(req)
        
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