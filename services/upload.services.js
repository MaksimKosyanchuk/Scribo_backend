const AWS = require('aws-sdk');
const path = require('path');

const upload_limit_size = 5 * 1024 * 1024 

AWS.config.update({
    accessKeyId: process.env.AWS_CONNECT_ACCESS_KEY, 
    secretAccessKey: process.env.AWS_CONNECT_SECRET_ACCESS_KEY,
    region: process.env.AWS_CONNECT_REGION
});

const s3 = new AWS.S3();

function aws_configure() {
    s3.listBuckets({}, (err, data) => {
        if (err) {
            console.log("Ошибка при подключении к AWS:", err);
        }
        
        else {
            console.log("Подключение к AWS успешно! Список бакетов: ", data.Buckets);
        }
    });
}

function image_validation(img) {
    errors = []

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    const maxFileSize = 5 * 1024 * 1024;

    if (!allowedMimeTypes.includes(img.mimetype)) {
        errors.push('Incorrect file type, only images!');
    }

    if (img.size > upload_limit_size) {
        errors.push(`Max size of image should be (${maxFileSize / 1024 / 1024} mb).`);
    }

    return errors
}

async function upload_image(avatar, type, file_name) {
    try{
        if(!avatar) {
            return {
                status: false,
                message: "No banner",
                data: null
            }
        }
        
        if((!type || type !== "avatar") && (!type || type !== "post_banner")) {
            return {
                status: false,
                message: 'Incorrect type, should be "avatar" or "post_banner"',
                data: type
            }
        }

        errors = image_validation(avatar)
        console.log(errors)

        if(errors.length > 0) {
            return {
                status: false,
                message: "Some errors in your fields",
                errors
            }
        }

        else {
            const params = {
                Bucket: process.env.AWS_CONNECT_BUCKET_NAME,
                Key: `src/${type}/${file_name}${path.extname(avatar.originalname)}`,
                Body: avatar.buffer,
                ContentType: avatar.mimetype
            };
        
            const result = await s3.putObject(params).promise();

            if(result.ETag) {
                return {
                    status: true,
                    message: "Successfully uploaded",
                    data: {
                        url: `https://${process.env.AWS_CONNECT_BUCKET_NAME}.s3.${process.env.AWS_CONNECT_REGION}.amazonaws.com/${params.Key}`
                    }
                }
            }

            else {
                return {
                    status: false,
                    message: "Failed upload!",
                    data: result
                }
            }

        }
    }
    catch(e) {
        return {
            status: false,
            message: e,
            data: null
        }
    }
}

module.exports = {
    upload_image,
    aws_configure,
    s3
}