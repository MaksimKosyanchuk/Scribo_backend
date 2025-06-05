const cors = require('cors')
const express = require('express')
const mongoose = require('mongoose')
const app = express()
require('dotenv').config()
const Logger = require('./services/log')
const { aws_configure } = require('./services/aws.services')

const port = process.env.PORT

const corsOptions = {
    origin: process.env.FRONTEND_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions))
app.use(express.json({ extended: true }))

app.use('/api/posts', require('./routes/posts.routes'))
app.use('/api/users', require('./routes/users.routes'))
app.use('/api/auth', require('./routes/auth.routes'))
app.use('/api/profile', require('./routes/profile.routes'))
app.use('/api', require('./routes/default.routes'))
app.use('/', require('./routes/default.routes'))

const start = async () => {
    try {
        global.Logger = new Logger()
        aws_configure()
        console.log("logger is initialized")
        await mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.lccalb5.mongodb.net/?retryWrites=true&w=majority`)
        app.listen(port, () => {} )
    }
    catch (e) { 
        global.Logger.log(e.message)
        global.Logger.Log("Ending program")
        process.exit(1)
    }
}

start()