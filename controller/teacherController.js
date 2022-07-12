const Staff = require('../models/Staff')
const Score = require('../models/Score')
const TermResult = require('../models/TermResult')
const TermSetter = require('../models/TermSetter')
const SessionResult = require('../models/SessionResult')
const positionHelper = require('../helpers/position')

// exports.updateTeach = async (req, res) => {
//   const val = await Score.deleteMany({ class: 'Primary5', subject: 'Cultural and Creative Art' })
//   res.send(val)
// }

exports.fetchTeacherSubjects = async (req, res) => {
  const teacher = await Staff.findById(req.query.id)
  res.json({ subjects: teacher.teach })
}

exports.fetchStudentsInClass = async (req, res) => {
  const termAndSession = await TermSetter.find()
  const students =
       await Score.find({
         class: req.body.class,
         subject: req.body.subject,
         category: req.body.category,
         session: termAndSession[0].session.year,
         term: termAndSession[0].termNumber

       })
  res.json({ success: true, students })
}

exports.liveSaveResult = async (req, res) => {
  const field = req.body.key
  const value = parseFloat(req.body.value).toFixed(1)
  const username = req.body.username
  const currentClass = req.body.currentClass
  const subject = req.body.subject
  const category = req.body.category
  const termAndSession = await TermSetter.find()

  // update the score field sent from front end
  const score = await Score.findByIdAndUpdate(req.body.id,
    { $set: { [field]: value } },
    { new: true, useFindAndModify: false })

  // get total by adding all ca aasessment, and exam value if they exist
  const ca1 = score.ca1 === undefined ? 0 : score.ca1
  const ca2 = score.ca2 === undefined ? 0 : score.ca2
  const ca3 = score.ca3 === undefined ? 0 : score.ca3
  const ca4 = score.ca4 === undefined ? 0 : score.ca4
  const assessment = score.assessment === undefined ? 0 : score.assessment
  const exam = score.exam === undefined ? 0 : score.exam
  const total = Math.floor(ca1 + ca2 + ca3 + ca4 + assessment + exam)

  // use if else to find grade and remark based on score value
  let grade
  let remark
  if (total >= 70) {
    grade = 'A'
    remark = 'EXCELLENT'
  } else if (total >= 60) {
    grade = 'B'
    remark = 'VERY GOOD'
  } else if (total >= 50) {
    grade = 'C'
    remark = 'Good'
  } else if (total >= 45) {
    grade = 'D'
    remark = 'FAIRLY GOOD'
  } else if (total >= 40) {
    grade = 'E'
    remark = 'PASS'
  } else {
    grade = 'F'
    remark = 'POOR RESULT'
  }

  // update grade, total, classAverage and remark field
  await Score.findByIdAndUpdate(score._id, {
    total,
    grade,
    remark
  }, { new: true, useFindAndModify: false })

  // count class size
  const classSize = await TermResult.collection.find({
    class: currentClass,
    category,
    term: termAndSession[0].termNumber,
    session: termAndSession[0].session.year
  }).count()

  /* start of calculating classAverage, and getting highest and lowest */
  // start of get highest and lowest average
  const allStudentTotalInAClass = await Score.find(
    {
      class: currentClass,
      subject,
      category,
      term: termAndSession[0].termNumber,
      session: termAndSession[0].session.year
    },
    { total: 1 }
  )

  allStudentTotalInAClass.sort((a, b) => {
    return b.total - a.total
  })

  const highest = allStudentTotalInAClass[0].total
  const lowest = allStudentTotalInAClass[allStudentTotalInAClass.length - 1].total
  // end of get highest and lowest average

  // get all students total for this subject
  const classSubjectTotal = await Score.find({
    class: currentClass,
    subject,
    category,
    term: termAndSession[0].termNumber,
    session: termAndSession[0].session.year
  }, { total: 1 })

  const classSum = classSubjectTotal.reduce((a, b) => (+a + +b.total), 0)
  const classAverage = Math.floor(classSum / classSize)

  await Score.updateMany({
    class: currentClass,
    subject,
    category,
    term: termAndSession[0].termNumber,
    session: termAndSession[0].session.year
  }, {
    highest,
    lowest,
    classAverage
  }, { new: true, useFindAndModify: false })
  /* End of calculating classAverage, and getting highest and lowest */

  /* start of calculate position for a specific subject */
  const allStudentScoreInAClass = await Score.find(
    {
      class: currentClass,
      subject,
      category,
      term: termAndSession[0].termNumber,
      session: termAndSession[0].session.year
    },
    { total: 1, username: 1 }
  )

  allStudentScoreInAClass.sort((a, b) => {
    return b.total - a.total
  })

  const currentSubjectPosition = positionHelper.positionWithoutOrdinal(allStudentScoreInAClass)

  currentSubjectPosition.map(async (students, ind) => {
    await Score.findByIdAndUpdate(students.id,
      { subjectPosition: students.position },
      { new: true, useFindAndModify: false })
  })
  /* End of calculating subject position in a class */

  /* start of calculating student term position and average and class-size in class */
  const allStudentTotal = await Score.find({
    username,
    term: termAndSession[0].termNumber,
    session: termAndSession[0].session.year
  }, { total: 1 })

  const sumTotal = allStudentTotal.reduce((a, b) => (+a + +b.total), 0)

  const noOfCourses = allStudentTotal.length
  const average = Math.floor(sumTotal / noOfCourses)

  await TermResult.findOneAndUpdate({
    username: req.body.username,
    term: termAndSession[0].termNumber,
    session: termAndSession[0].session.year
  },
  { total: sumTotal, average, classSize },
  { new: true, useFindAndModify: false })
  /* End of calculating student term result */

  /* CALCULATING TERM POSITION STARTS HERE */
  const allStudentTotalFromAclass = await TermResult.find({
    class: currentClass,
    term: termAndSession[0].termNumber,
    session: termAndSession[0].session.year

  }, {
    _id: 0,
    average: 1,
    username: 1
  })
  // sort the results
  allStudentTotalFromAclass.sort((a, b) => {
    return b.average - a.average
  })

  const currentTermPosition = positionHelper.positionWithOrdinal(allStudentTotalFromAclass)

  // enter the students term positin result in DB
  currentTermPosition.map(async (students, ind) => {
    await TermResult.findOneAndUpdate(
      { username: students.username, class: currentClass },
      { position: students.position },
      { new: true, useFindAndModify: false })
  })
  /* CALCULATING TERM POSITION END HERE */

  /* START OF SESSION RESULT CALCULATION */
  const upScore3 = await Score.findById(req.body.id)

  // check if the term is third term
  if (termAndSession[0].termNumber === 3) {
    // get student term results
    const termAverages = await TermResult.find({
      username,
      session: termAndSession[0].session.year
    })

    // calculate session average based on term averages
    const lengthOfAverages = termAverages.length
    if (lengthOfAverages === 1) {
      const termAverage1 = termAverages[0].average === undefined ? 0 : termAverages[0].average
      // calculate how many term results the student have

      const sessionAverage = termAverage1 / 1

      // calculate student status based on average
      const status = sessionAverage >= 40 ? 'Promoted' : 'Demoted'

      // save the result in the DB
      await SessionResult.collection.updateOne(
        { username },
        {
          $set: {
            average: sessionAverage,
            status,
            username,
            session: termAndSession[0].session.year,
            class: currentClass
          }

        },
        { upsert: true, useFindAndModify: false })
    } else if (lengthOfAverages === 2) {
      const termAverage1 = termAverages[0].average === undefined ? 0 : termAverages[0].average
      const termAverage2 = termAverages[1].average === undefined ? 0 : termAverages[1].average

      // calculate how many term results the student have
      const sessionAverage = (termAverage1 + termAverage2) / 2

      // calculate student status based on average
      const status = sessionAverage >= 40 ? 'Promoted' : 'Demoted'

      // save the result in the DB
      await SessionResult.collection.updateOne(
        { username },
        {
          $set: {
            average: sessionAverage,
            status,
            username,
            session: termAndSession[0].session.year,
            class: currentClass
          }
        },
        { upsert: true, useFindAndModify: false })
    } else {
      const termAverage1 = termAverages[0].average === undefined ? 0 : termAverages[0].average
      const termAverage2 = termAverages[1].average === undefined ? 0 : termAverages[1].average
      const termAverage3 = termAverages[2].average === undefined ? 0 : termAverages[2].average

      // calculate how many term results the student have
      const sessionAverage = (termAverage1 + termAverage2 + termAverage3) / 3

      // calculate student status based on average
      const status = sessionAverage >= 40 ? 'Promoted' : 'Demoted'

      // save the result in the DB
      await SessionResult.collection.updateOne(
        { username },
        {
          $set: {
            average: sessionAverage,
            status,
            username,
            session: termAndSession[0].session.year,
            class: currentClass
          }

        },
        { upsert: true, useFindAndModify: false })
    }

    // CALCULATE POSITION FOR STUDENTS IN THE CLASS
    // get the session results for the students in the class
    const sessionRecords = await SessionResult.find(
      { session: termAndSession[0].session.year, class: currentClass },
      { average: 1, username: 1 })

    // sort the results
    sessionRecords.sort((a, b) => {
      return b.average - a.average
    })

    // giving positions to students by adding 1 to index
    const currentSessionPosition = sessionRecords.map((students, ind) => {
      const studentIdentity = {
        id: students.id,
        position: ind + 1,
        username: students.username
      }
      return studentIdentity
    })
    // enter the students result in DB
    currentSessionPosition.map(async (students, ind) => {
      await SessionResult.findByIdAndUpdate(students.id, { position: students.position }, { useFindAndModify: false })
    })
    res.json({ success: true, upScore3 })
  } else {
    res.json({ success: true, upScore3 })
  }
}

// update teacher priviledge on result
exports.finalSubmision = async (req, res, next) => {
  const { submitButton, value, id } = req.body

  await Staff.findByIdAndUpdate(id, {
    [submitButton]: value
  }, { new: true, useFindAndModify: false })

  res.json({ success: true, message: `you have submitted ${submitButton}` })
}
