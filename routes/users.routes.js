const { Router } = require("express");
const User = require('../models/User');

const router = Router();

router.get('/:id', async (req, res) => getUserBy('_id', req.params.id));




async function userIsAdmin(user_id){
    user = await getUserById(user_id)
    return user.status == "success" && user.user.is_admin;
}


module.exports = router;