const router = require('express').Router();
const staffController = require('../controller/staffController');
const logoutController = require('../controller/logoutController')
const { isLoggedIn } = require('../middlewares/auth');


 router.post('/login', staffController.loginStaff)
 router.post('/change-password/:id', staffController.resetPassword)
 router.post('/logout', logoutController.logout)

 router.put('/set-profile-pic', staffController.setProfilePic);

 


module.exports = router