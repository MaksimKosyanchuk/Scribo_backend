const {Schema, model, Types} = require('mongoose');

let shema = new Schema({
    date_time: {type: Date, required: true, default: Date.now},
    message: {type: String, required: true},
    data: {type: Object, required: false, default: null}
})

module.exports = model('Log', shema);