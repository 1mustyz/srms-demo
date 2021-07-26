const Staff = require('../models/Staff')

exports.allowPriviledge = async (req,res,next) => {
    const {button, value, teacherId, username} = req.body

    await Staff.findByIdAndUpdate(teacherId, {
        [button]: value
    }, {new: true, useFindAndModify: false})

    res.json({success: true, message: `priviledge change for ${username}`})
}

exports.getTeachersPriviledge = async (req,res,next) => {
    const result = await Staff.find(
        {role: "subjectTeacher"},
        {username: 1, ca1Button: 1, ca2Button: 1, ca3Button: 1, ca4Button: 1, examButton: 1})

    res.json({success: true, message: result})

}