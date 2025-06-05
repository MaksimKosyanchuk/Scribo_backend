const User = require('../models/User')

async function get_users(query = {}, options = { with_password: false, with_saved_posts: false, with_notifications: false }) {
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
            message: e,
            data: null
        }
    }
}

module.exports = {
    get_users
}