const {Schema, model, Types} = require('mongoose');

let shema = new Schema({
    nick_name: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    description: {type: String, required: false},
    avatar: {type: String, required: false},
    created_date: {type: Date, required: true, default: Date.now},
    is_admin: {type: Boolean, required: true, default: false},
    is_verified: {type: Boolean, required: true, default: false},
    saved_posts: [
        {
            type: Types.ObjectId,
            ref: "Post",
            reuired: false
        }
    ],
    follows: [
        {
            type: Types.ObjectId,
            ref: "User",
            required: false,
        }
    ],
    followers: [
        {
            type: Types.ObjectId,
            ref: "User",
            required: false,
        }
    ]
})

module.exports = model('User', shema);