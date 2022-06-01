const express = require("express")
const router = express.Router()
const userController = require("../controllers/usercontroller")
const checkUserAuth = require("../middleware/authmiddleware")


//route level middleware - to protect route
router.use('/changepassword',checkUserAuth)
router.use('/loggeduser',checkUserAuth)

//public route
router.post('/register',userController.userRegistration)
router.post('/login',userController.userLogin)
router.post('/send-reset-password-email',userController.sendUserPasswordResetEmail)
router.post('/reset-password/:id/:token',userController.userPasswordReset)

//protected routes
router.post('/changepassword',userController.changeUserPassword)
router.get('/loggeduser',userController.loggedUser)









module.exports = router