const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//с помощью библиотеки сравнить два пароля
async function compare_passwords(password, from_db) {
    is_match = await bcrypt.compare(password, from_db);
    return is_match;
}


async function get_jwt_token(user_id) {
    const key = process.env.JWTKEY

    return jwt.sign(
        {user_id: user_id},
        key,
        {});
}


module.exports = {
    compare_passwords,
    get_jwt_token
};