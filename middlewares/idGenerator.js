const Staff = require('../models/Staff')
const Student = require('../models/Student')


exports.staffIdGenerator = async (req,res,next) => {
    // 1. check if there are staff
    const getStaff = await Staff.find()
    // 2. if no staff first id is admin
    if (getStaff.length < 1)  req.body.username = 'NIA/ADMIN/001'
    else{
        // 3. if there are staffs get the last id and icrement by one
        const lastStaff = await Staff.find().sort({createdAt: -1}).limit(1)
        // console.log(lastStaff)

        let zeros
        const id = lastStaff[0].username.split('/')
        req.body.username = `NIA/STAFF/${zeros = id[2] < 10  && parseInt(id[2]) + 1 < 10 ? '00': id[2] >= 99 ? '':'0'}${parseInt(id[2]) + 1 }`
    }
    // console.log(id,req.body.username)

    // 4. then insert the new id
    next()
}

exports.studentIdGenerator = async (req,res,next) => {
    // 1. check if there are staff
    const d = new Date()
    const getStudent = await Student.find()
    // 2. if no staff first id is admin
    const fullYear = d.getFullYear().toString().split('')
    const splitYear = `${fullYear[2]}${fullYear[3]}`
    if (getStudent.length < 1) req.body.username = `NIA/${splitYear}/001`
    else{
        // 3. if there are staffs get the last id and icrement by one
        const lastStudent = await Student.find().sort({createdAt: -1}).limit(1)
        
        let zeros
        const id = lastStudent[0].username.split('/')
        // console.log(id[3],zeros)

        const fullYear = d.getFullYear().toString().split('')
        const splitYear = `${fullYear[2]}${fullYear[3]}`
        
        req.body.username = `NIA/${splitYear}/${zeros = id[2] < 10  && parseInt(id[2]) + 1 < 10 ? '00': id[2] >= 99 ? '':'0'}${parseInt(id[2]) + 1 }`
    }
    console.log(req.body.username)  
    

    // 4. then insert the new id
    next()
}