# Server for news site

Api server for news site, working with MongoDB

## Install and run
### Clone repository 
```bash
git clone https://github.com/your-username/your-repo.git
```
### Install requirements
```bash
cd {repo-name}
npm install
```
### Database settings
Rename ***.env.sample*** to ***.env*** and set
`DB_PASSWORD`
`DB_USER`
`DB_NAME`
`JWTKEY`
`PASSWORD_SALT`
`PORT` 
variables
### Run server
```bash
npm run start
```

## Fetches
### Send all requests along the path `{link}/api/`
|Request|Type|Body requirements|Return data|
|:------|:--:|:----------------|:------|
|/auth/login|POST|`nick_name` `password`|`token`|
|/auth/register|POST|`nick_name` `password`|null|
|/posts|GET||[ {"_id": , "author": , "title": , "featured_image": , "content_text": , "created_date": } ]|
|/posts/?`query`|GET||{"_id": , "author": , "title": , "featured_image": , "content_text": , "created_date": }|
|/posts/create-post|POST|`token`, `title`, `content_text`|{"author": , "title": , "featured_image": , "content_text": , "created_date": "_id": }|
|/profile|POST|`token`|{"_id": , "nick_name": , "avatar": , "created_date": , "is_admin": , "saved_posts": }|
|/profile/save-post|POST|`token` `post_id`|{"_id": , "author": , "title": , "featured_image": , "content_text": , "created_date": }|
|/users/`nick_name`|GET||{"_id": , "nick_name": , "avatar": , "created_date": , "is_admin": }|

## Links
- [Set request](https://news-site-backend-rust.vercel.app/)

---

- [GitHub](https://github.com/MaksimKosyanchuk)
- [Telegram](https://t.me/maks_k0s)
- [Twitter](https://twitter.com/maks_k0s)
