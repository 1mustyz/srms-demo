const Subject = require('../models/Subject')
const Score = require('../models/Score')
const Curriculum = require('../models/Curriculum')
const termAndSession = require('../models/TermSetter')
const termResult = require('../models/TermResult')

exports.create = async (req, res, next) => {
  await Subject.insertMany(req.body)
  res.json({ success: true, message: 'courses inserted successfullty' })
}

// exports.delete = async (req,res,next) => {
//     const {id} = req.body;
//     await Subject.deleteOne({_id: id})
//     res.json({success: true, message: `course with the ${id} deleted successfullty`});
// }

exports.delete = async (req, res, next) => {
  const { id, subject } = req.body
  const currentSession = await termAndSession.find()

  // get all student score total
  const subjectScore = await Score.find({
    subject,
    term: currentSession[0].termNumber,
    session: currentSession[0].session.year
  })

  console.log('////////////', subjectScore.total)

  // for each of the subject score decrease term result total

  subjectScore.map(async score => {
    console.log('-------------------', score.total)

    await termResult.updateOne({
      session: currentSession[0].session.year,
      term: currentSession[0].termNumber,
      username: score.username
    }, {

      $inc: { total: -score.total, noOfCourse: -1 }
    })

    // remove corresponding scores
    await Score.deleteMany({
      subject,
      username: score.username,
      term: currentSession[0].termNumber,
      session: currentSession[0].session.year
    })
  })

  await Curriculum.updateMany({}, { $pull: { subject } })
  await Subject.deleteOne({ _id: id })
  res.json({ success: true, message: `course with the ${id} deleted successfullty` })
}

exports.update = async (req, res, next) => {
  const { subject, id } = req.body
  await Subject.updateOne({ _id: id }, { $set: { subject } })
  res.json({ success: true, message: `course with the ${id} updated successfullty` })
}

exports.getAllSubject = async (req, res, next) => {
  const result = await Subject.find()
  result.length > 0
    ? res.json({ success: true, message: result })
    : res.json({ success: true, message: result })
}

exports.updateStdScoreFirstName = async (req, res, next) => {
  const { username, firstName } = req.body
  const result = await Score.updateMany({ username }, { firstName })
  res.json({ success: true, message: result })
}

exports.deleteAllSubject = async (req, res, next) => {
  await Subject.deleteMany({})
  res.json({ success: true, message: 'All subject deleted' })
}
