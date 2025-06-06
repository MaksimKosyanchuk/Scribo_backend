const { Router } = require('express')
const { login, register } = require('../services/auth.services')
const multer = require('multer');
const router = Router();

const upload = multer({
    limits: { fieldSize: 5 * 1024 * 1024 }
})

router.options('/register', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(200).send();
});

router.post('/login', async (req, res) => {
    try {
        const result = await login(req.body) 
        
        const result_data = {
            status: result.status ? 'success' : 'error',
            message: result.message,
            data: result.data,
            errors: result.errors
        }

        if(result.status) {
            global.Logger.log(`User '${ result.data.user.nick_name }': success logined from ${ req.ip }`, result.data)
        }

        res.status(200).json(result_data)
    }
    catch(e) {
        const result_data = {
            status: "error",
            message: e.message, 
            data: null
        }

        global.Logger.log(`Login exception`, { message: e.message })

        res.status(500).json(result_data)
    }
})

router.post('/register', upload.single('avatar'), async (req, res) => {
    try {
        const result = await register(req.body, req.file)
        
        const result_data = {
            status: result.status ? 'success' : 'error',
            message: result.message,
            errors: result.errors,
            data: result.data
        }

        if(result.status) {
            global.Logger.log(`User '${ result.data.nick_name }' success register from ${ req.ip }`, result.data)
        }

        res.status(200).json(result_data)
    }
    catch (e) {
        const result_data = {
            status: "error",
            message: e.message,
            data: null
        }

        global.Logger.log(`Register exception`, { message: e.message })

        res.status(500).json(result_data)
    }
})

module.exports = router