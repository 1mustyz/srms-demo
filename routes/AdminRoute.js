const router = require('express').Router();
const staffController = require('../controller/staffController');
const logoutController = require('../controller/logoutController')
const paymentController = require('../controller/paymentController');
const { isLoggedIn } = require('../middlewares/auth');
const studentController = require('../controller/studentController')
const curriculumController = require('../controller/curriculumController');
const subjectController = require('../controller/subjectController');
const classController = require('../controller/classController')
const termSetterController = require('../controller/termSetterController')
const cognitiveController = require('../controller/cognitiveController');
const assignmentController = require('../controller/assignmentController')
const idGenerator = require('../middlewares/idGenerator')
const teacherController = require('../controller/teacherController')
const examOfficerController = require('../controller/examOfficeController')

router.post('/register-staff', idGenerator.staffIdGenerator, staffController.registerStaff)
router.post('/register-student', idGenerator.studentIdGenerator, studentController.registerStudent)

router.post('/login', staffController.loginStaff)
router.post('/change-password/:id', staffController.resetPassword)
router.post('/logout', logoutController.logout)
router.post('/add-payment', paymentController.addPaymentTypes)
router.post('/add-curriculum', curriculumController.create)
router.post('/create-subject', subjectController.create)
router.post('/create-class', classController.create)
router.post('/verify-payment', paymentController.verifyPayment);
router.post('/set-new-term',termSetterController.setNewTerm)
router.post('/set-new-session',termSetterController.setSession)
router.post('/add-new-cognitive-item', cognitiveController.addNewCognitive)

// admin set his profile
router.put('/set-profile-pic', staffController.setProfilePic);

// set role for staff
router.put('/set-role', staffController.setRole);

router.put('/add-student-cognitive', cognitiveController.createStudentCognitive)
router.put('/update-payment', paymentController.updatePaymentTypes)

router.put('/update-single-student-profile', studentController.updateSingleStudent);
router.put('/update-single-curriculum', curriculumController.updateSingleCurriculum);
router.put('/update-single-subject', subjectController.update)
router.put('/update-class', classController.update)
router.put('/update-cognitive-item', cognitiveController.updateAddNewCognitive)
router.put('/edit-staff', staffController.editStaff)
router.put('/edit-student', studentController.editStudent)
router.put('/final-submission', teacherController.finalSubmision)
router.put('/allow-submission-priviledge', examOfficerController.allowPriviledge)


router.get('/get-all-curriculum', curriculumController.getAllCurriculum)
router.get('/get-all-admin-curriculum', curriculumController.getAdminAllCurriculum)

router.get('/get-single-curriculum', curriculumController.getSingleCurriculum)
router.get('/dashboard', staffController.statistics)
router.get('/get-payment-type', paymentController.getPayment);
router.get('/get-all-paid-student', paymentController.getAllPaidStudent);
router.get('/get-all-un-paid-student', paymentController.getAllUnPaidStudent);
router.get('/get-all-teachers', staffController.findAllTeachers);
router.get('/get-all-principal', staffController.findAllPrincipal);
router.get('/get-all-staff', staffController.findAllStaff);
router.get('/get-all-student', studentController.findAllStudent);

router.get('/get-all-student-according-to-section',
 studentController.findAllStudentAccordinToSection);

 router.get('/get-all-student-according-to-class-category',
 studentController.findAllStudentAccordinToClassAndCategory);

router.get('/get-paid-student-statistics',paymentController.getPaidAndUnPaidStudent) 
router.get('/get-all-paid-and-un-paid-student', paymentController.getAllPaidAndUnPaidStudent)

router.get('/get-single-student', studentController.findOneStudent);
router.get('/get-all-subject', subjectController.getAllSubject)
router.get('/get-all-classes', classController.getAllClasses)
router.get('/get-every-class', classController.getEveryClass)

router.get('/get-current-term', termSetterController.getCurrentTerm)
router.get('/get-current-session', termSetterController.getSession)
router.get('/get-all-cognitive-item', cognitiveController.getAllAddNewCognitive)
router.get('/get-all-student-cognitive', cognitiveController.getAllStudentCognitive)
router.get('/get-all-teachers-assignment', assignmentController.getAllAssignmentAdmin)
router.get('/get-add-session', termSetterController.getAddSession);
router.get('/get-single-staff', staffController.singleStaff)
router.get('/get-class-curriculum', curriculumController.getClassCurriculum)

router.get('/get-a-class-result', studentController.getAclassResult)
router.get('/get-single-student-result', studentController.getAsingleStudentResult)
router.get('/get-all-teachers-priviledge', examOfficerController.getTeachersPriviledge)

router.get('/downloaddd', assignmentController.downloadAssignment);

router.get('/download-pdf', function (req, res, next) {
    res.contentType("application/pdf")
    const {filePath} = req.query; // Or format the path using the `id` rest param
    const fileName = "Assignment.pdf"; // The default name the browser will use

    const myfile=res.download(filePath, fileName);  
    res.json(myfile)  
});
router.delete('/remove-student', studentController.removeStudent)
router.delete('/delete-single-curriculum', curriculumController.deleteSingleCurriculum)
router.delete('/delete-all-curriculum', curriculumController.deleteAllCurriculum)
router.delete('/delete-single-subject', subjectController.delete)
router.delete('/delete-class', classController.delete)
router.delete('/remove-staff', staffController.removeStaff)
router.delete('/delete-cognitive-item', cognitiveController.deleteAddNewCognitive)

module.exports = router;