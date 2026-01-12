const Post = require('../../models/Post')

async function get_posts_by_query(query = {}) {
    try {
        const posts = await Post.find(query)
        
        if (!posts.length) {
            return {
                status: false,
                message: "There is no posts"
            }
        }

        return {
            status: true,
            message: "Success",
            data: posts
        }
    }

    catch(e) {
        return {
            status: false,
            message: "There is no posts"
        }
    }
}

async function get_post_by_query(query = {}) {
    try {
        const post = await Post.findOne(query)
        
        if (!post) {
            return {
                status: false,
                message: "Post was not found"
            }
        }

        return {
            status: true,
            message: "Success",
            data: post
        }
    }

    catch(e) {
        return {
            status: false,
            message: "There is no posts"
        }
    }
}

async function create_new_post(title, content_text, author, featured_image=null) {
    try {
        const new_post = await Post.create({
            author: author,
            title: title,
            featured_image: featured_image,
            content_text: content_text
        })

        return {
            status: true,
            message: "Success created post",
            data: new_post
        }
    }
    catch(e) {
        console.log(e.message)

        return {
            status: false,
            message: "Post creating is fall"
        }
    }
}

async function delete_post_by_id(id) {
    try {
        const deleted_post = await Post.findByIdAndDelete(id);

        if(!deleted_post) {
            return {
                status: false,
                message: "This post doesn`t exists"
            }
        }
        else {
            return {
                status: true,
                message: "Success deleted post",
                data: deleted_post
            }
        }
    }
    catch(e) {
        console.log(e.message)

        return {
            status: false,
            message: "Failed to delete post"
        }
    }
}

module.exports = {
    get_posts_by_query,
    get_post_by_query,
    create_new_post,
    delete_post_by_id
}