const { Router } = require('express')
const { login, register, request_verification_code, verify_email_code, google_token_verify } = require('../services/auth.services')
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
        const result = await login(req) 
        
        res.status(result.code)

        delete result.code

        res.json(result)
    }
    catch(e) {
        console.log(e)
        const result_data = {
            
            status: false,
            message: "Internal server error", 
            data: null
        }

        res.status(500).json(result_data)
    }
})

router.post('/register', (req, res) => {
    upload.single('avatar')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
        req.file = null
    }
    try {
        const result = await register(req)

        res.status(result.code)

        delete result.code
        
        res.json(result)
    } catch (e) {
        console.log(e)

        res.status(500).json({
            status: false,
            message: 'Internal server error!',
            data: null
        })
    }
    })
})

router.post('/google/verification', async (req, res) => {
    try {
        const result = await google_token_verify(req)

        res.status(result.code)

        delete result.code
        
        res.json(result)
    } catch (e) {
        console.log(e)

        res.status(500).json({
            status: false,
            message: 'Internal server error!',
            data: null
        })
    }
})

router.post('/email/verification', async (req, res) => {
    try {
        const result = await request_verification_code(req)

        res.status(result.code)

        delete result.code
        
        res.json(result)
    } catch (e) {
        console.log(e)

        res.status(500).json({
            status: false,
            message: 'Internal server error!',
            data: null
        })
    }
})

router.post('/email/verification/confirm', async (req, res) => {
    try {
        const result = await verify_email_code(req)

        res.status(result.code)

        delete result.code
        
        res.json(result)
    } catch (e) {
        console.log(e)

        res.status(500).json({
            status: false,
            message: 'Internal server error!',
            data: null
        })
    }
})


module.exports = router