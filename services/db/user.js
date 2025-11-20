const User = require('../../models/User')

async function get_users_by_query(query = {}, options = { with_password: false, with_saved_posts: false, with_notifications: false }) {
    try {
        let users = await User.find(query)

        if(users.length === 0) {
            return {
                status: false,
                message: 'Users not found',
                data: null
            }
        }

        users = users.map(user => {
            const userObj = user.toObject();

            if (!options.with_password) {
                delete userObj.password;
            }

            if (!options.with_saved_posts) {
                delete userObj.saved_posts;
            }

            if (!options.with_notifications) {
                delete userObj.notifications;
            }

            return userObj;
        })

        return {
            status: true,
            message: 'Success',
            data: users
        }
    }
    catch(e) {
        return {
            status: false,
            message: "Users was not found",
        }
    }
}

async function get_user_by_query(query = {}, options = { with_password: false, with_saved_posts: false, with_notifications: false }) {
    try {
        let user = await User.findOne(query)

        if(!user) {
            return {
                status: false,
                message: 'User not found',
                data: null
            }
        }

        const userObj = user.toObject();

        if(!options.with_password) delete userObj.password
        if(!options.with_saved_posts) delete userObj.saved_posts
        if(!options.with_notifications) delete userObj.notifications

        return {
            status: true,
            message: 'Success',
            data: userObj
        }
    }
    catch(e) {
        return {
            status: false,
            message: "User was not found",
        }
    }
}

module.exports = {
    get_users_by_query,
    get_user_by_query
}