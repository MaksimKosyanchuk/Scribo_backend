# Scribo Backend — Blog API Server

REST API server for the Scribo blog platform, built with Node.js and express.  
Provides a RESTful API for user authentication, registration, and account management, as well as for creating, retrieving, and deleting posts. It also allows users to save posts to their favorites and to follow or unfollow other users, with all actions secured via JWT authentication.

## Technologies

- Node.js
- Express.js
- MongoDB (Mongoose)
- AWS S3
- JWT
- dotenv
- SendGrid

## Features

- RESTful API
- User authentication (JWT)
- CRUD operations for posts
- MongoDB integration
- AWS S3 file storage
- Vercel deployment
- Environment-based configuration
- Sending email code verification

## Installation & Running

### Clone the repository
```bash
git clone https://github.com/scribo-blog-org/Scribo_backend
```

### Install dependencies
```bash
cd Scribo_backend
npm install
```

### Environment variables
Rename `.env.sample` to `.env` and set the following variables:

```env
DB_PASSWORD = 
DB_USER = 
DB_NAME =

JWTKEY = 
PASSWORD_SALT =

PORT = 

FRONTEND_ORIGIN = 
FRONTEND_ORIGIN_DEV = 
API_DOCUMENTATION_ORIGIN =

AWS_CONNECT_ACCESS_KEY =
AWS_CONNECT_SECRET_ACCESS_KEY =
AWS_CONNECT_REGION =
AWS_CONNECT_BUCKET_NAME =

SEND_GRID_API_KEY = 
MAIL_SENDER = 
```

### Run the server
```bash
npm run start
```

The server will start on the port specified in the `.env` file.

## API Documentation

- [API Documentation](https://scribo-blog.vercel.app/api)

## Related Links

- [Live site](https://scribo-blog.vercel.app)  
- [Frontend repository](https://github.com/scribo-blog-org/Scribo_frontend)
- [GitHub](https://github.com/scribo-blog-org)  
- [Personal github](https://github.com/MaksimKosyanchuk)  
- [Telegram](https://t.me/maks_k0s)  
- [Instagram](https://www.instagram.com/maks_kos/)  
- [Twitter](https://twitter.com/maks_k0s)
