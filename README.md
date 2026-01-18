# Scribo Backend — Blog API Server

REST API server for the Scribo blog platform, built with Node.js and MongoDB.  
Provides authentication, post management, user interaction, and media storage.

## Features

- User authentication (JWT)
- CRUD operations for posts
- MongoDB integration
- AWS S3 file storage
- RESTful API
- Environment-based configuration

## Installation & Running

### Clone the repository
```bash
git clone https://github.com/MaksimKosyanchuk/Scribo_backend.git
```

### Install dependencies
```bash
cd Scribo_backend
npm install
```

### Environment variables
Rename `.env.sample` to `.env` and set the following variables:

```env
DB_USER=
DB_PASSWORD=
DB_NAME=

JWTKEY=
PASSWORD_SALT=

PORT=

AWS_CONNECT_ACCESS_KEY=
AWS_CONNECT_SECRET_ACCESS_KEY=
AWS_CONNECT_REGION=
AWS_CONNECT_BUCKET_NAME=
```

### Run the server
```bash
npm run start
```

The server will start on the port specified in the `.env` file.

## API Documentation

- [API Documentation](https://scribo-blog.vercel.app/api)

## Related Links

- [Frontend](https://scribo-blog.vercel.app)
- [GitHub](https://github.com/MaksimKosyanchuk)
- [Telegram](https://t.me/maks_k0s)
- [Twitter](https://twitter.com/maks_k0s)

## Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT
- AWS S3
- dotenv
