const express =require("express")
const {check} = require("express-validator")
const router = express.Router()
const User_Controller = require("../controllers/User_Controller");
const checkAuth = require("../middlewares/check_auth")

router.get("/user",checkAuth,User_Controller.getUser)
router.get("/all/users",checkAuth,User_Controller.getAllUser)
router.patch("/edituser/:id",checkAuth,User_Controller.editUser)
router.delete("/logout",checkAuth,User_Controller.userLogout)
router.delete("/deleteuser/:id",checkAuth,User_Controller.deleteUser)
router.post("/login",User_Controller.userLogin)
router.post("/createuser",[
	check('name',"please provide name !!").not().isEmpty(),
	check('email',"please provide a valid email !!").normalizeEmail().isEmail(),
	check('password',"please provide a minimum 6 char long password !! ").isLength({min:6})
	],
	User_Controller.createUser)





module.exports = router;