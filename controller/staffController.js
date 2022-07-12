const passport = require('passport')
const Staff = require('../models/Staff')
const Student = require('../models/Student')
const multer = require('multer')
const { singleUpload } = require('../middlewares/filesMiddleware')
const mongoose = require('mongoose')
// const connectEnsureLogin = require('connect-ensure-login')

// staff registration controller
exports.registerStaff = async (req, res, next) => {
  try {
    // create the user instance
    const user = new Staff(req.body)
    const password = req.body.password ? req.body.password : 'password'
    // save the user to the DB
    await Staff.register(user, password, function (error, user) {
      if (error) return res.json({ success: false, error })
      res.json({ success: true, user })
    })
  } catch (error) {
    res.json({ success: false, error })
  }
}
// staff login controller
exports.loginStaff = (req, res, next) => {
  // perform authentication
  passport.authenticate('staff', (error, user, info) => {
    if (error) return res.json({ success: false, error })
    if (!user) {
      return res.json({
        success: false,
        message: 'username or password is incorrect'
      })
    }
    // login the user
    req.login(user, (error) => {
      if (error) {
        res.json({ success: false, message: 'something went wrong pls try again' })
      } else {
        req.session.user = user
        res.json({ success: true, message: 'staff login successful', user })
      }
    })
  })(req, res, next)
}

// reset password by staff
exports.resetPassword = async (req, res, next) => {
  try {
    const user = await Staff.findById(req.params.id)
    await user.changePassword(req.body.oldPassword, req.body.newPassword)
    await user.save()
    res.json({ message: 'password reset successful', user })
  } catch (error) {
    res.json({ message: 'something went wrong', error })
  }
}

// reset password for staff by admin
exports.adminResetStaffPassword = async (req, res, next) => {
  try {
    const user = await Staff.findById(req.params.id)
    await user.setPassword('password')
    await user.save()
    res.json({ message: 'password reset successful', user })
  } catch (error) {
    res.json({ message: 'something went wrong', error })
  }
}

exports.findAllStaff = async (req, res, next) => {
  const result = await Staff.find({})
  result.length > 0
    ? res.json({ success: true, message: result })
    : res.json({ success: false, message: result })
}

exports.findAllTeachers = async (req, res, next) => {
  const result = await Staff.find({ role: 'subjectTeacher' })
  result.length > 0
    ? res.json({ success: true, message: result })
    : res.json({ success: false, message: result })
}

exports.findAllPrincipal = async (req, res, next) => {
  const result = await Staff.find({ role: 'Principal' })
  result.length > 0
    ? res.json({ success: true, message: result })
    : res.json({ success: false, message: result })
}

exports.findAllClassTeacher = async (req, res, next) => {
  const result = await Staff.find({ role: 'classTeacher' })
  result.length > 0
    ? res.json({ success: true, message: result })
    : res.json({ success: false, message: result })
}

exports.singleStaff = async (req, res, next) => {
  const { username } = req.query

  const result = await Staff.findOne({ username })
  result.length > 0
    ? res.json({ success: true, message: result })
    : res.json({ success: false, message: result })
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
      await Staff.findOneAndUpdate({ _id: req.query.id }, { $set: { image: req.file.path } })
      return res.json({
        success: true,
        message: req.file.path
      }

      )
    }
  })
}

exports.setRole = async (req, res, next) => {
  const { role, teach, classTeacher } = req.body

  const result = await Staff.find({ _id: req.query.id }, { role: 1, teach: 1, classTeacher: 1 })

  // check if staff has the role sent so that not to add it multiple times
  result[0].role.includes(role)
    ? ''
    : await Staff.findByIdAndUpdate(req.query.id, { $push: { role } }, { useFindAndModify: false })

  // if staff dosent have a role
  if (role === 'None') {
    await Staff.findByIdAndUpdate(req.query.id, { $set: { role: [], teach: [], classTeacher: [] } }, { useFindAndModify: false })
  } else if (role === 'subjectTeacher' || role.includes('subjectTeacher')) {
    if (result[0].teach.length > 0) {
      const isSameClass = result[0].teach.filter(obj => obj.class === teach.class && obj.category === teach.category)
      const index = result[0].teach.findIndex(obj => obj.class === teach.class && obj.category === teach.category)
      // if subjects were registered in the class
      if (isSameClass.length > 0) {
        // console.log(index)
        const newSubject = `teach.${index}.subject`
        // console.log(newSubject)
        // TODO
        await Staff.findByIdAndUpdate(req.query.id, { $push: { [newSubject]: teach.subject.toString() } }, { useFindAndModify: false })
      } else {
        await Staff.findByIdAndUpdate(req.query.id, { $push: { teach } }, { useFindAndModify: false })
      }
    } else {
      await Staff.findByIdAndUpdate(req.query.id, { $push: { teach } }, { useFindAndModify: false })
    }
  } else if (role === 'classTeacher') {
    result[0].classTeacher.includes(classTeacher)
      ? ''
      : await Staff.findByIdAndUpdate(req.query.id, { $push: { classTeacher } }, { useFindAndModify: false })
  } else {
    // await Staff.findByIdAndUpdate(req.query.id,{$push: {"role": role}})
  }

  res.json({ success: true, message: 'role has been set successfully' })
}

exports.removeStaff = async (req, res, next) => {
  const { id } = req.query
  await Staff.findOneAndDelete({ _id: id })
  res.json({ success: true, message: `staff with the id ${id} has been removed` })
}

exports.editStaff = async (req, res, next) => {
  const { id } = req.query
  await Staff.findByIdAndUpdate(id, req.body)
  res.json({ success: true, message: `staff with the id ${id} has been edited` })
}

exports.statistics = async (req, res) => {
  // fetch
  // number of all students
  const allStudents = await Student.find({ }).countDocuments()
  const nursery = await Student.find({ section: 'Nursery' }).countDocuments()
  const primary = await Student.find({ section: 'Primary' }).countDocuments()
  const secondary = await Student.find({ $or: [{ section: 'JSS' }, { section: 'SSS' }] }).countDocuments()
  const junior = await Student.find({ section: 'JSS' }).countDocuments()
  const senior = await Student.find({ section: 'SSS' }).countDocuments()
  const staffs = await Staff.find({ }).countDocuments()

  // count each class paid and unpaid
  // count each class number of students

  res.json([
    { detail: 'allStudents', value: allStudents }, { detail: 'nursery', value: nursery },
    { detail: 'primary', value: primary }, { detail: 'junior', value: junior },
    { detail: 'senior', value: senior }, { detail: 'staff', value: staffs }])

  // number of grades, secondary, junior, senior, day care, play class school students
  //
}
