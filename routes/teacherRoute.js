const router = require('express').Router();
const teacherController = require('../controller/teacherController')
const assignmentController = require('../controller/assignmentController')



router.get('/teacher-subjects', teacherController.fetchTeacherSubjects)
router.post('/fetch-students-result', teacherController.fetchStudentsInClass)
router.post('/insert-one-result', teacherController.liveSaveResult)
router.put('/create-assignment-text', assignmentController.createAssignmentText)
router.post('/create-assignment-file', assignmentController.createAssignmentFile)

// router.post('/save-and-continue', teacherController.saveAndContinue)
// router.post('/final-save', teacherController.finalSaveResult)
module.exports = router
