const passport = require('passport')
const fs = require('fs')
// const Staff = require('../models/Staff')
const Student = require('../models/Student')
const Score = require('../models/Score')
const Curriculum = require('../models/Curriculum')
const multer = require('multer')
const { singleUpload } = require('../middlewares/filesMiddleware')
const TermSetter = require('../models/TermSetter')
const Cognitive = require('../models/Cognigtive')
const TermResult = require('../models/TermResult')
const Payment = require('../models/Payment')
const Assignment = require('../models/Assignment')
const SessionResult = require('../models/SessionResult')
const createPDFReport = require('../helpers/generatePDF')

// student registration controller
exports.registerStudent = async function (req, res, next) {
  try {
    // fetch current term and session
    const termAndSession = await TermSetter.find({}, { termNumber: 1, session: 1 })
    // extract class number from current class
    if (req.body.currentClass !== 'Daycare' && req.body.currentClass !== 'Playclass') {
      const classNumber = req.body.currentClass.split('')
      req.body.classNumber = classNumber[classNumber.length - 1]
    }

    req.body.term = termAndSession[0].termNumber
    req.body.session = termAndSession[0].session.year
    // req.body.term = term[0].termNumber
    const user = new Student(req.body)
    const password = req.body.password ? req.body.password : 'password'
    // save the user to the DB
    Student.register(user, password, async (error, user) => {
      if (error) return res.json({ success: false, error })
      // add subjects to the student
      const subjects = await Curriculum.find(
        { name: user.currentClass, category: user.category },
        { subject: 1, _id: 0 })

      if (subjects.length) {
        // create score documents
        const studentSubjects = subjects[0].subject.map(subject => ({
          subject,
          username: user.username,
          studentId: user._id,
          class: user.currentClass,
          category: user.category,
          firstName: user.firstName,
          lastName: user.lastName,
          term: termAndSession[0].termNumber,
          session: termAndSession[0].session.year
        }))

        // get number of subjects
        const noOfCourse = await Curriculum.find(
          { name: user.currentClass, category: user.category },
          { subject: 1 }
        )

        // make cognitive data
        const cognitiveData = {
          username: user.username,
          studentId: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          class: user.currentClass,
          category: user.category,
          Neatness: '',
          Punctuality: '',
          Attentiveness: '',
          Attitude: '',
          Emotion: '',
          Initiative: '',
          TeamWork: '',
          Perseverance: '',
          Speaking: '',
          Leadership: '',
          Acceptance: '',
          Honesty: '',
          Follows: '',
          Participation: '',
          remarks: '',
          term: termAndSession[0].termNumber,
          session: termAndSession[0].session.year
        }

        // save cognitive and score documents
        await Score.collection.insertMany(studentSubjects)
        await Cognitive.collection.insertOne(cognitiveData)

        // create term result with no. of subjects
        await TermResult.collection.insertOne({
          studentId: user._id,
          username: user.username,
          class: user.currentClass,
          category: user.category,
          noOfCourse: noOfCourse[0].subject.length,
          term: termAndSession[0].termNumber,
          session: termAndSession[0].session.year
        })

        // add payment document
        await Payment.collection.insertOne({
          studentId: user._id,
          username: user.username,
          firstname: user.firstName,
          lastName: user.lastName,
          paid: false,
          term: termAndSession[0].termNumber,
          session: termAndSession[0].session.year,
          className: user.currentClass
        })

        res.json({ success: true, user })
      } else {
        // make cognitive data
        const cognitiveData = {
          username: user.username,
          studentId: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          class: user.currentClass,
          category: user.category,
          Neatness: '',
          Punctuality: '',
          Attentiveness: '',
          Attitude: '',
          Emotion: '',
          Initiative: '',
          TeamWork: '',
          Perseverance: '',
          Speaking: '',
          Leadership: '',
          Acceptance: '',
          Honesty: '',
          Follows: '',
          Participation: '',
          remarks: '',
          term: termAndSession[0].termNumber,
          session: termAndSession[0].session.year
        }

        // save cognitive
        await Cognitive.collection.insertOne(cognitiveData)

        // add payment document
        await Payment.collection.insertOne({
          studentId: user._id,
          username: user.username,
          firstname: user.firstName,
          lastName: user.lastName,
          paid: false,
          term: termAndSession[0].termNumber,
          session: termAndSession[0].session.year,
          className: user.currentClass
        })

        // create term result without of subjects
        await TermResult.collection.insertOne({
          studentId: user._id,
          username: user.username,
          class: user.currentClass,
          category: user.category,
          term: termAndSession[0].termNumber,
          session: termAndSession[0].session.year
        })

        res.json({ success: true, user })
      }
    })
  } catch (error) {
    res.json({ success: false, error })
  }
}
// student login controller
exports.loginStudent = (req, res, next) => {
  // perform authentication
  passport.authenticate('student', (error, user, info) => {
    if (error) return res.json({ success: false, error })
    if (!user) {
      return res.json({
        success: false,
        message: 'username or password is incorrect'
      })
    }
    // login the user
    req.login(user, (error) => {
      if (error) { res.json({ success: false, message: 'something went wrong pls try again' }) }
      req.session.user = user
      res.json({ success: true, message: 'student login success', user })
    })
  })(req, res, next)
}

exports.setProfilePic = async (req, res, next) => {
  singleUpload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.json(err.message)
    } else if (err) {
      return res.json(err)
    } else if (!req.file) {
      return res.json({ image: req.file, msg: 'Please select an image to upload' })
    }
    if (req.file) {
      console.log(req.query.id)
      await Student.findOneAndUpdate({ _id: req.query.id }, { $set: { image: req.file.path } })
      return res.json({
        success: true,
        message: req.file.path
      }

      )
    }
  })
}
// reset password by parent / student
exports.resetPassword = async (req, res, next) => {
  try {
    const user = await Student.findById(req.params.id)
    await user.changePassword(req.body.oldPassword, req.body.newPassword)
    await user.save()
    res.json({ user })
  } catch (error) {
    res.json({ message: 'something went wrong', error })
  }
}
// reset password for student by admin
exports.adminResetStudentPassword = async (req, res, next) => {
  try {
    const user = await Student.findById(req.params.id)
    await user.setPassword('password')
    await user.save()
    res.json({ user })
  } catch (error) {
    res.json({ message: 'something went wrong', error })
  }
}

exports.findAllStudent = async (req, res, next) => {
  const students = await Student.find()

  students
    ? res.json({ success: true, students })
    : res.json({ success: false, message: students })
}

exports.findAllStudentAccordinToSection = async (req, res, next) => {
  const { section } = req.query

  const students = await Student.find({ section })

  res.json({ success: true, students })
}

exports.findAllStudentAccordinToClassAndCategory = async (req, res, next) => {
  const { currentClass, category } = req.query

  const students = await Student.find({ currentClass, category })

  res.json({ success: true, students })
}

exports.updateSingleStudent = async (req, res, next) => {
  const { id } = req.query
  const {
    studentId,
    currentClass,
    section,
    category,
    classNumber
  } = req.body

  // console.log(classNumber)

  await Student.findByIdAndUpdate(id, {
    currentClass,
    section,
    category,
    'class[0].number': classNumber
  })

  res.json({ success: true, message: `user with the ${id} is updated successfully` })
}

exports.findOneStudent = async (req, res, next) => {
  const { id } = req.query

  const student = await Student.findById(id)

  student
    ? res.json({ success: true, student })
    : res.json({ success: true, student })
}

exports.removeStudent = async (req, res, next) => {
  const { id, username } = req.query
  await Student.findOneAndDelete({ _id: id })
  await Score.deleteMany({ username })
  await Cognitive.deleteMany({ username })
  await Payment.deleteMany({ username })
  await TermResult.deleteMany({ username })
  await SessionResult.deleteMany({ username })
  res.json({ success: true, message: `student with the id ${id} has been removed` })
}

exports.getAclassResult = async (req, res, next) => {
  const { term, session, className, category } = req.query

  const eachSubjectResult = await Score.find({
    class: className,
    category,
    term,
    session
  }).lean()

  const cognitiveResult = await Cognitive.find({
    class: className,
    category,
    term,
    session
  }).lean()

  const termResult = await TermResult.find({
    class: className,
    category,
    term,
    session
  }).lean()

  const nextSchoolFee = { Primary: '3,000', JSS: '4,000', SSS: '5,000' }
  let categorySchoolFee
  if (className.includes('Primary') || className.includes('Nursery')) {
    categorySchoolFee = nextSchoolFee.Primary
  } else if (className.includes('JSS')) {
    categorySchoolFee = nextSchoolFee.JSS
  } else {
    categorySchoolFee = nextSchoolFee.SSS
  }
  const logoData = fs.readFileSync('./public/images/logo.jpeg', { encoding: 'base64', flag: 'r' })
  const signatureData = fs.readFileSync('./public/images/signature.jpg', { encoding: 'base64', flag: 'r' })
  const signature = `data:image/png;base64,${signatureData}`
  const logo = `data:image/png;base64,${logoData}`

  const generalResult = termResult.map((student) => {
    const studentCourses = eachSubjectResult.filter(std => std.username === student.username)
    const cognitive = cognitiveResult.filter(std => std.username === student.username)
    return {
      termResult: student,
      subjects: studentCourses,
      cognitives: cognitive[0],
      logo,
      signature,
      categorySchoolFee
    }
  })

  console.log(generalResult[0])

  // generate pdf report
  const data = { generalResult }

  const pdf = await createPDFReport(data)
  // then send to frontend to download
  res.set({ 'Content-Type': 'application/pdf', 'Content-Length': pdf.length })
  res.send(pdf)
}

exports.getAsingleStudentResult = async (req, res, next) => {
  const { term, username, currentClass, category } = req.query
  const termAndSession = await TermSetter.find()

  const totalNoOfStudent = await Student.find({ currentClass, category }).countDocuments()

  const subjectResult = await Score.find({
    term,
    session: termAndSession[0].session.year,
    username
  })

  const studentCognitive = await Cognitive.findOne({
    term,
    session: termAndSession[0].session.year,
    username
  })

  const termResult = await TermResult.find({
    term,
    session: termAndSession[0].session.year,
    username
  })
  const generalSingleResult = [
    ...termResult,
    subjectResult,
    studentCognitive,
    totalNoOfStudent
  ]
  res.json({ success: true, noOfScore: subjectResult.length, message: generalSingleResult })
}

exports.editStudent = async (req, res, next) => {
  const { id } = req.query
  await Student.findByIdAndUpdate(id, req.body)
  res.json({ success: true, message: `student with the id ${id} has been edited` })
}

// *****************************************************************************************************
// The code below is very sensitive make sure you understand it before using it

exports.promoteOrDemoteAstudent = async (req, res, next) => {
  const termAndSession = await TermSetter.find()

  const { username, newClass } = req.query
  try {
    await Student.findOneAndUpdate({ username }, { $set: { currentClass: newClass } }, { useFindAndModify: false })
    await Score.updateMany({
      username,
      session: termAndSession[0].session.year
    }, { $set: { class: newClass } })

    await Cognitive.updateMany({
      username,
      session: termAndSession[0].session.year
    }, { $set: { class: newClass } })

    await Payment.updateMany({
      username,
      session: termAndSession[0].session.year
    }, { $set: { className: newClass } })

    await TermResult.updateMany({
      username,
      session: termAndSession[0].session.year
    }, { class: newClass })
    res.json({ success: true, message: `student with the id ${username} has been promoted` })
  } catch (error) {
    console.log(error)
  }
}
// *****************************************************************************************************
// The code below is very sensitive make sure you understand it before using it
exports.promoteOrDemoteAclass = async (req, res, next) => {
  const { currentClass, newClass, session } = req.body
  // await Student.updateMany({currentClass},{currentClass:newClass})
  await Payment.updateMany({ session, className: currentClass }, { className: newClass })
  await Score.updateMany({ session, class: currentClass }, { class: newClass })
  await Cognitive.updateMany({ session, class: currentClass }, { class: newClass })
  await TermResult.updateMany({ session, class: currentClass }, { class: newClass })

  // console.log(rr)
  res.json({ success: true, message: `a class of this ${currentClass} has been promoted` })
}

exports.getAllStudentAssignment = async (req, res, next) => {
  const termAndSession = await TermSetter.find()
  const { currentClass, category } = req.query
  const result = await Assignment.find({
    class: currentClass,
    category,
    term: termAndSession[0].termNumber,
    session: termAndSession[0].session.year
  })
  res.json({ success: true, result })
}

exports.suspendAstudent = async (req, res, next) => {
  const { username, suspend } = req.query

  await Student.findOneAndUpdate({ username }, { $set: { suspend } })
  res.json({ success: true, suspend })
}
