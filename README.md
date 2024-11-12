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
|Request|Type|Requirements parameters|Optional parameters|Return data|
|:------|:--:|:----------------------|:------------------|:----------|
|/auth/login|POST|Body: `nick_name` `password`| |{<br>&nbsp;&nbsp;&nbsp;&nbsp;"user_id": `user_id`,<br>&nbsp;&nbsp;&nbsp;&nbsp;"token": `token`<br>}|
|/auth/register|POST|Body: `nick_name` `password`|Body: `avatar`|`null`|
|/posts|GET| |Heads: `filter query`|[<br>&nbsp;&nbsp;&nbsp;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"_id": `_id`,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"author": `author`,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"title": `title`,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"featured_image": `featured_image`,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"content_text": `content_text`,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"created_date": `created_date`<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>]|
|/posts/create-post|POST|Body: `token` `title` `content_text`|Body: `featured_image`|{<br>&nbsp;&nbsp;&nbsp;&nbsp;"token": `token`,<br>&nbsp;&nbsp;&nbsp;&nbsp;"title": `title`,<br>&nbsp;&nbsp;&nbsp;&nbsp;"content_text": `content_text`,<br>&nbsp;&nbsp;&nbsp;&nbsp;"testfeatured_image: `featured_image`<br>}|
|/profile|POST|Body: `token`||{<br>&nbsp;&nbsp;&nbsp;&nbsp;"_id": `id`,<br>&nbsp;&nbsp;&nbsp;&nbsp;"nick_name": `nick_name`,<br>&nbsp;&nbsp;&nbsp;&nbsp;"avatar": `avatar`,<br>&nbsp;&nbsp;&nbsp;&nbsp;"created_date": `created_date`,<br>&nbsp;&nbsp;&nbsp;&nbsp;"is_admin": `is_admin`,<br>&nbsp;&nbsp;&nbsp;&nbsp;"is_verified": `is_verified`,<br>&nbsp;&nbsp;&nbsp;&nbsp;"saved_posts": `saved_posts`<br>}|
|/profile/save-post|POST|Body: `token` `post_id`||{<br>&nbsp;&nbsp;&nbsp;&nbsp;"_id": `id`,<br>&nbsp;&nbsp;&nbsp;&nbsp;"author": `author`,<br>&nbsp;&nbsp;&nbsp;&nbsp;"title": `title`,<br>&nbsp;&nbsp;&nbsp;&nbsp;"featured_image": `featured_image`,<br>&nbsp;&nbsp;&nbsp;&nbsp;"content_text": `content_text`,<br>&nbsp;&nbsp;&nbsp;&nbsp;"created_date": `created_date`<br>}|
|/users/`nick_name`|GET|||{<br>&nbsp;&nbsp;&nbsp;&nbsp;"_id": `_id`,<br>&nbsp;&nbsp;&nbsp;&nbsp;"nick_name": `nick_name`,<br>&nbsp;&nbsp;&nbsp;&nbsp;"avatar": `avatar`,<br>&nbsp;&nbsp;&nbsp;&nbsp;"created_date": `created_date`,<br>&nbsp;&nbsp;&nbsp;&nbsp;"is_admin": `is_admin`,<br>&nbsp;&nbsp;&nbsp;&nbsp;"is_verified": `is_verified`<br>}|

## Links
- [Set request](https://news-site-backend-rust.vercel.app/)

---

- [GitHub](https://github.com/MaksimKosyanchuk)
- [Telegram](https://t.me/maks_k0s)
- [Twitter](https://twitter.com/maks_k0s)
