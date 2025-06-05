const AWS = require('aws-sdk');
const path = require('path');

const UPLOAD_LIMIT_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];

AWS.config.update({
    accessKeyId: process.env.AWS_CONNECT_ACCESS_KEY,
    secretAccessKey: process.env.AWS_CONNECT_SECRET_ACCESS_KEY,
    region: process.env.AWS_CONNECT_REGION,
});

const s3 = new AWS.S3();

async function aws_configure() {
    try {
        const data = await s3.listBuckets().promise();
        console.log('AWS Buckets:', data.Buckets.map(b => b.Name));
    } catch (err) {
        global.Logger.log("Ошибка при подключении к AWS:", { message: err });
    }
}

function image_validation(img) {
    const errors = [];

    if (!ALLOWED_MIME_TYPES.includes(img.mimetype)) {
        errors.push('Incorrect file type, only images (jpeg, png, gif, webp) are allowed.');
    }

    if (img.size > UPLOAD_LIMIT_SIZE) {
        errors.push(`Max size of image should be ${UPLOAD_LIMIT_SIZE / 1024 / 1024} MB.`);
    }

    return errors;
}

async function upload_image(file, type, file_name) {
    if (!file) {
        return {
            status: false,
            message: "Missing file",
            data: null,
        };
    }

    const errors = image_validation(file);

    if (type !== "avatar" && type !== "featured_image") {
        errors.push('Incorrect type, should be "avatar" or "featured_image".');
    }

    if (!file_name || typeof file_name !== 'string') {
        errors.push('Invalid or missing file_name.');
    }

    if (errors.length > 0) {
        return {
        status: false,
        message: "Validation errors",
        errors,
        };
    }

    const fileExtension = path.extname(file.originalname).toLowerCase();
    const key = `src/${type}/${safeFileName}${fileExtension}`;

    try {
        const params = {
        Bucket: process.env.AWS_CONNECT_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        };

        const result = await s3.putObject(params).promise();

        if (result.ETag) {
            return {
                status: true,
                message: "Successfully uploaded",
                data: {
                url: `https://${process.env.AWS_CONNECT_BUCKET_NAME}.s3.${process.env.AWS_CONNECT_REGION}.amazonaws.com/${key}`,
                },
            };
        } else {
            return {
                status: false,
                message: "Failed upload",
                data: result,
            };
        }
    } catch (e) {
        global.Logger.log("AWS upload error:", e);

        return {
            status: false,
            message: e.message || 'Unknown error occurred during upload',
            data: null,
        };
    }
}

module.exports = {
    upload_image,
    aws_configure,
    s3,
};
