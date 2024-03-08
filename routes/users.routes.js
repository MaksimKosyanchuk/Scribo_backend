const { Router } = require("express");
const { get_public_user_by } = require("../services/users.services");

const router = Router();

router.get('/:nick_name', async (req, res) => {
    const user = await get_public_user_by('nick_name', req.params.nick_name)

    return res.status(200).json({
        status: user.status ? "success" : "error",
        message: user.message,
        data: user.data
    })
})

module.exports = router;