const cors = require('cors')
const express = require('express')
const mongoose = require('mongoose')
const app = express()
require('dotenv').config()
const port = process.env.PORT

app.use(cors())
app.use(express.json({ extended: true }))

app.use('/api/posts', require('./routes/posts.routes'))
app.use('/api/users', require('./routes/users.routes'))
app.use('/api/auth', require('./routes/auth.routes'))
app.use('/api/profile', require('./routes/profile.routes'))
app.use('/api', require('./routes/default.routes'))
app.use('/', require('./routes/default.routes'))

const start = async () => {
    try {
        await mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.lccalb5.mongodb.net/?retryWrites=true&w=majority`)
        app.listen(port, () => console.log('server started on port: ', port))
    }
    catch (e) { 
        console.log(e.message)
        process.exit(1)
    }
}

start()