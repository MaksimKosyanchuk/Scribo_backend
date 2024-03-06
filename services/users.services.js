const User = require('../models/User');

async function getUserBy(key, value){
    let user = await User.findOne({ [key]: value });

    if (!user) {
        return ({
            status: false,
            data: null
        })
    }
    return ({
        status: true,
        data: user
    })
};

module.exports = {
    getUserBy
};