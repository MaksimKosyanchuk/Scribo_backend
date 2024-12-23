const { Router } = require('express')
const { login, register } = require('../services/auth.services')
const multer = require('multer');
const router = Router();
const upload = multer({
    limits: { fieldSize: 25 * 1024 * 1024 }
})

router.options('/register', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(200).send();
});

router.post('/login', async (req, res) => {
    global.Logger.log(`login request from: ${req.ip}`)
    try {
        const result = await login(req.body.nick_name, req.body.password) 
        
        const result_data = {
            status: result.status ? 'success' : 'error',
            message: result.message,
            data: result.data
        }

        global.Logger.log(`response to: ${req.ip}`, result_data)

        res.status(200).json(result_data)
    }
    catch(e) {
        const result_data = {
            status: "error",
            message: e.message, 
            data: null
        }

        global.Logger.log(`response to: ${req.ip}`, result_data)

        res(500).json(result_data)
    }
})

router.post('/register', upload.single('avatar'), async (req, res) => {
    global.Logger.log(`register request from: ${req.ip}`)
    try {
        const result = await register(req.body.nick_name, req.body.password, req.body.description, req.file)
        
        const result_data = {
            status: result.status ? 'success' : 'error',
            message: result.message,
            description: result.description,
            data: result.data
        }

        global.Logger.log(`response to: ${req.ip}`, result_data)

        res.status(200).json(result_data)
    }
    catch (e) {
        const result_data = {
            status: "error",
            message: e.message,
            data: null
        }

        global.Logger.log(`response to: ${req.ip}`, result_data)

        res.status(500).json(result_data)
    }
})

module.exports = router