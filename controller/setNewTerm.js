const TermSetter = require('../models/TermSetter')
const TermResult = require('../models/TermResult')
const Student = require('../models/Student')
const Curriculum = require('../models/Curriculum')

exports.createTermResult = async (req, res, next) => {
  // find all students that have not graduate
  const students = await Student.find({ status: 'Active' })
  const subjects = await Curriculum.find({ })
  const termAndSession = await TermSetter.find()

  // creating a term result
  const newTermResult = students.map(std => {
    const studentSubjects = subjects.filter(currentELement => {
      return currentELement.name === std.currentClass &&
                currentELement.category === std.category
    })
    const subjectLength = (studentSubjects.length > 0) ? studentSubjects[0].subject.length : 0
    // console.log(subjectLength)
    return {
      username: std.username,
      studentId: std._id,
      class: std.currentClass,
      noOfCourse: subjectLength,
      term: termAndSession[0].termNumber,
      session: termAndSession[0].session.year
    }
  })
  await TermResult.insertMany(newTermResult)

  // create payment and cognitive
  // students.forEach( async (student) => {

  //       // creating a new school payment
  //       await Payment.collection.insertOne({
  //         studentId: student._id,
  //         username: student.username,
  //         firstname: student.firstName,
  //         lastName: student.lastName,
  //         paid: false,
  //         term: termAndSession[0].termNumber,
  //         session: termAndSession[0].session.year,
  //         className: student.currentClass
  //       })

  //       // creating a new cognitive data
  //     await Cognitive.collection.insertOne({
  //         username: student.username,
  //         studentId: student._id,
  //         firstName: student.firstName,
  //         lastName: student.lastName,
  //         class: student.currentClass,
  //         category: student.category,
  //         neatness: '',
  //         punctuality: '',
  //         hardWorking: '',
  //         remarks: '',
  //         term: termAndSession[0].termNumber,
  //         session: termAndSession[0].session.year,
  //     })
  // })

  res.json({ success: true, message: 'new term has been set successfully' })
}

exports.deleteTermResult = async (req, res, next) => {
  // specify term and session to avoid big error
  const result = await TermResult.deleteMany({ term: 2, session: '2021/2022' })

  res.json({ success: true, result })
}
