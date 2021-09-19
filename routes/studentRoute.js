const router = require('express').Router();
const studentController = require('../controller/studentController')
const logoutController = require('../controller/logoutController')
const paymentController = require('../controller/paymentController')

 router.post('/login', studentController.loginStudent)
 router.post('/change-password/:id', studentController.resetPassword)
 router.post('/logout', logoutController.logout)

 router.put('/set-profile-pic', studentController.setProfilePic);

 router.get('/get-all-student-assignment', studentController.getAllStudentAssignment)
 router.get('/get-single-student-payment', paymentController.getSingleStudentPayment)

module.exports = router