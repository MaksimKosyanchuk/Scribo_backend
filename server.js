const cors = require('cors');
const express = require('express');
const app = express();
const port = 3001;
const mongoose = require('mongoose');
require('dotenv').config();

app.use(cors());
app.use(express.json({ extended: true }));

// Обработка GET запроса на корневой URL
app.get('/', (req, res) => {
    res.send('Привет, мир!');
});


app.use('/api/posts', require('./routes/posts.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/auth', require('./routes/auth.routes'));

const start = async () => {
    try {
        await mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.lccalb5.mongodb.net/?retryWrites=true&w=majority`);
        app.listen(port, () => console.log('server started on port: ', port));
    }
    catch (e) { 
        console.log(e.message);
        process.exit(1);
    }
}
start();