const Post = require('../models/Post')

async function upload_image(img) {
    const formData = new FormData();
    formData.append('key', process.env.UPLOAD_IMAGE_API_KEY);
    formData.append('image', img)
    const response = await fetch(process.env.UPLOAD_IMAGE_URL, {
        method: 'POST',
        body: formData
    });

    const data = await response.json();
    if(data.success) {
        return {
            status: true,
            message: "Success uploaded image",
            data: 
            { 
                url: data.data.url
            }
        }
    }
    else {
        return {
            status: false,
            message: data.error.message,
            data: null
        }
    }
}

module.exports = {
    upload_image
}