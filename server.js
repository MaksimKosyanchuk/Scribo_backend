const cors = require('cors');
const fs = require('fs');
const express = require('express');
const app = express();
const port = 3001; // Порт, на котором будет работать сервер

app.use(cors());

// Обработка GET запроса на корневой URL
app.get('/', (req, res) => {
    res.send('Привет, мир!');
});

const getFile = async () => {
    let file = false;
    
    let data = await fs.readFileSync(`${__dirname}/static/posts.json`, 'utf8')

    if (!data) {
        return file
    }
    
    file = await JSON.parse(data);

    return file;
}

app.get('/posts', async (req, res) => {
    try {
        let file = await getFile();
        
        if (!file) {
            return res.status(200).json({
                status: 'error',
                message: "Все не ок",
                posts: null
            })
        }

        return res.status(200).json({
            status: 'success',
            message: "Все ок",
            posts: file
        })
    } catch (e) {
        console.log(e)
    }
});

app.get('/posts/:id', async (req, res) => {
    let file = await getFile();

    console.log(req.params);

    if (!file) {
        return res.status(200).json({
            status: 'error',
            message: "Чет  с файлос",
            post: null
        })
    }

    let post = file.find(el => el.id == req.params.id)

    if (!post) {
        return res.status(200).json({
            status: 'error',
            message: "Такого поста нет",
            post: null
        })
    }

    return res.status(200).json({
        status: 'success',
        message: "Все ок",
        post: post
    })
    
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});
