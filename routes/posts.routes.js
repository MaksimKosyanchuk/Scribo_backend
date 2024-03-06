const { Router } = require("express");
const Post = require('../models/Post');
const User = require('../models/User');

const router = Router();

router.get('/', async (req, res) => {
    try {
        // let posts = await Post.find();
        let posts = [ 
            {
                _id: 0,
                title: "Облысение после тридцати",
                content_text: "Люди начали лысеть после тридцатиdsadkmaslkdmalsdmla smdlaskmdlaskmdlaskmdlaskmdlaskmd aksmdlaks mdlaskmdlkasmkldasdkmaslkmdlaskmdlkasmdlsakmdlkasmdlamsldmaslk\nnigga party\nuhsdaudhas\nshuhaduash",
                author_name: "Maksonchik",
                author_id: 0,
                author_avatar: "https://masterpiecer-images.s3.yandex.net/5facb7c9220a5a8:upscaled",
                date: "21.01.2012 20:48",
                featured_image: "https://i1.sndcdn.com/artworks-000104557119-038f1g-t500x500.jpg"
            },
            {
                _id: 1,
                title: "Облысение после тридцати",
                content_text: "Люди начали лысеть после тридцатиdsadkmaslkdmalsdmla smdlaskmdlaskmdlaskmdlaskmdlaskmd aksmdlaks mdlaskmdlkasmkldasdkmaslkmdlaskmdlkasmdlsakmdlkasmdlamsldmaslk\nnigga party\nuhsdaudhas\nshuhaduash",
                author_name: "Maksonchik",
                author_id: 0,
                author_avatar: "https://masterpiecer-images.s3.yandex.net/5facb7c9220a5a8:upscaled",
                date: "21.01.2012 20:48",
                featured_image: "https://i1.sndcdn.com/artworks-000104557119-038f1g-t500x500.jpg"
            },
            {
                _id: 2,
                title: "Облысение после тридцати",
                content_text: "Люди начали лысеть после тридцатиdsadkmaslkdmalsdmla smdlaskmdlaskmdlaskmdlaskmdlaskmd aksmdlaks mdlaskmdlkasmkldasdkmaslkmdlaskmdlkasmdlsakmdlkasmdlamsldmaslk\nnigga party\nuhsdaudhas\nshuhaduash",
                author_name: "Maksonchik",
                author_id: 0,
                author_avatar: "https://masterpiecer-images.s3.yandex.net/5facb7c9220a5a8:upscaled",
                date: "21.01.2012 20:48",
                featured_image: "https://i1.sndcdn.com/artworks-000104557119-038f1g-t500x500.jpg"
            }
        ];

        if (!posts) {
            return res.status(200).json({
                status: 'error',
                message: "Все не ок",
                posts: null
            })
        }

        return res.status(200).json({
            status: 'success',
            message: "Все ок",
            posts: posts
        })
    } catch (e) {
        console.log(e)
    }
});

router.get('/:id', async (req, res) => {
    // let post = await Post.findById(req.params.id);

    let post = {
        _id: 0,
        title: "Облысение после тридцати",
        content_text: `<p>
        <span style="font-size: 28px;">Quill Rich Text Editor</span>
    </p>
    <p>
        <br>
    </p>
    <p>Quill is a free,
        <a href="https://github.com/quilljs/quill/" target="_blank">open source</a>WYSIWYG editor built for the modern web. With its
        <a href="http://quilljs.com/docs/modules/" target="_blank">extensible architecture</a>and a
        <a href="http://quilljs.com/docs/api/" target="_blank">expressive API</a>you can completely customize it to fulfill your needs. Some built in features include:</p>
    <p>
        <br>
    </p>
    <ul>
        <li>Fast and lightweight</li>
        <li>Semantic markup</li>
        <li>Standardized HTML between browsers</li>
        <li>Cross browser support including Chrome, Firefox, Safari, and IE 9+</li>
    </ul>
    <p>
        <br>
    </p>
    <p>
        <span style="font-size: 28px;">Downloads</span>
    </p>
    <p>
        <br>
    </p>
    <ul>
        <li>
            <a href="https://quilljs.com" target="_blank">Quill.js</a>, the free, open source WYSIWYG editor</li>
        <li>
            <a href="https://zenoamaro.github.io/react-quill" target="_blank">React-quill</a>, a React component that wraps Quill.js</li>
    </ul>
    <p>
        <br>
    </p>`,
        author_name: "Maksonchik",
        author_id: 0,
        author_avatar: "https://masterpiecer-images.s3.yandex.net/5facb7c9220a5a8:upscaled",
        date: "21.01.2012 20:48",
        featured_image: "https://i1.sndcdn.com/artworks-000104557119-038f1g-t500x500.jpg"
    };
    if (!post) {
        return res.status(200).json({
            status: 'error',
            message: "Чет  с файлос",
            post: null
        })
    }


    return res.status(200).json({
        status: 'success',
        message: "Все ок",
        post: post
    })
    
});

router.post('/create-post', async (req, res) => {
    try {
        const { author_id, title, featured_image, content_text } = req.body;
        
        const newPost = await new Post({
            author: author,
            title: title,
            featured_image: featured_image,
            content_text: content_text,
        })

        await newPost.save()
        res.status(200).json({ message: "Post created", post: newPost });
    } catch (e) {
        console.log(e);
    }
})

module.exports = router;