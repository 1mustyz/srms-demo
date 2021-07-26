const Staff = require('../models/Staff')
const Score = require('../models/Score')
const TermResult = require('../models/TermResult')
const TermSetter = require('../models/TermSetter')

exports.fetchTeacherSubjects = async (req, res) => {
    const teacher = await Staff.findById(req.query.id)
    res.json({subjects: teacher.teach})
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
    const value = req.body.value
    const username = req.body.username
    const currentClass = req.body.currentClass
    const subject = req.body.subject
    const category = req.body.category
    const termAndSession = await TermSetter.find()
    
    

    const score = await Score.findByIdAndUpdate(req.body.id, {
        [field]: value
    }, {new: true, useFindAndModify: false})
    
    // // get total by adding all ca and exam value if they exist
    const ca1 = score.ca1 === undefined ? 0 : score.ca1
    const ca2 = score.ca2 === undefined ? 0 : score.ca2
    const ca3 = score.ca3 === undefined ? 0 : score.ca3
    const ca4 = score.ca4 === undefined ? 0 : score.ca4
    const exam = score.exam === undefined ? 0 : score.exam
    const total = ca1 + ca2 + ca3 + ca4 + exam

    // // use if else to find grade based on score value 
    let grade
    if(total >= 91) {
        grade = 'A1'
    } else if(total >= 81) {
        grade = 'B2'
    } else if(total >= 71) {
        grade = 'B3'
    } else if(total >= 65) {
        grade = 'C4'
    } else if(total >= 60) {
        grade = 'C5'
    } else if(total >= 50) {
        grade = 'C6'
    } else if(total >= 45) {
        grade = 'D7'
    } else if(total >= 40) {
        grade = 'E8'
    } 
    else {
        grade = 'F9'
    }

    // // update grade and total field
    const result = await Score.findByIdAndUpdate(score._id, {
        total,
        grade
    }, {new: true, useFindAndModify: false})
    // Souley's own end here 

    const upScore = await Score.findById(req.body.id)

    //  calculate position for a specific subject
    const allStudentScoreInAClass = await Score.find(
        {
            class: currentClass, 
            subject: subject, 
            category: category, 
            term: termAndSession[0].termNumber,
            session: termAndSession[0].session.year
        },
        {total: 1, username: 1}
        )
console.log('--------------', allStudentScoreInAClass)
        allStudentScoreInAClass.sort((a,b) => {
            return b.total - a.total 
        })    

    const currentSubjectPosition = allStudentScoreInAClass.map((students,ind)=>{
        return studentIdentity={
            id:students.id,
            position:ind+1,
            username: students.username
        }
            
    })    

    currentSubjectPosition.map( async (students,ind)=>{
        console.log('hhhhhhhhhh',students.id, students.position)
        await Score.findByIdAndUpdate(students.id, {subjectPosition: students.position})
    })    
    console.log('/////////////////////',currentSubjectPosition)

    const allStudentTotal = await Score.find({
        username: username,
        term: termAndSession[0].termNumber,
        session: termAndSession[0].session.year
        },{total: 1})
    
    // console.log(termAndSession[0])    
    console.log(allStudentTotal)
    let sumTotal = allStudentTotal.reduce((a,b)=> (+a +  +b.total),0 )
    
    // console.log('+++++++++++++++++', sumTotal)
    let noOfCourses = allStudentTotal.length;
    let average = sumTotal/noOfCourses
    console.log(average,sumTotal,noOfCourses)
    
    await TermResult.findOneAndUpdate({
        username: req.body.username,
        term: termAndSession[0].termNumber,
        session: termAndSession[0].session.year

    },{
        total: sumTotal, average: average
    })
        
    const allStudentInAclass = await TermResult.find({
        class: currentClass,
        term: termAndSession[0].termNumber,
        session: termAndSession[0].session.year

          // TODO set term to current term
    },{
        average: 1
    })

    allStudentInAclass.sort((a,b) => {
        return b.average - a.average 
    })
    
 const currentPosition = allStudentInAclass.map((students,ind)=>{
        return studentIdentity={
           average:students.average,
           id:students.id,
           position:ind+1
        }
        
    })
    const finalResult = currentPosition.map( async (students,ind)=>{
       return  kkk = await TermResult.findByIdAndUpdate(students.id, {position: students.position})
    })
            // console.log(finalResult)
    const upScore3 = await Score.findById(req.body.id)

            res.json({ success: true, upScore3})   
}

exports.finalSubmision = async (req,res,next) => {
    const {submitButton, value, id} = req.body

    await Staff.findByIdAndUpdate(id, {
        [submitButton]: value
    }, {new: true, useFindAndModify: false})
    
    res.json({success: true, message: `you have submitted ${submitButton}`})

} 

// exports.saveAndContinue = async (req, res) => {
//     const input = req.body
//     let bulkArr = [];

//     for (const i of input) {
//         bulkArr.push({
//             updateOne: {
//                 "filter": { "_id": i._id },
//                 "update": { 
//                      ca1: i.ca1, ca2: i.ca2,
//                      ca3: i.ca3, exam: i.exam }
//             }
//         })
//     }

//     const scores = await Score.bulkWrite(bulkArr)
//     res.json({ success: true, scores })

// }

// exports.finalSaveResult = async (req, res) => {
//     const input = req.body
//     let bulkArr = [];

//     for (const i of input) {
//         bulkArr.push({
//             updateOne: {
//                 "filter": { "_id": i._id },
//                 "update": { 
//                     ca1: i.ca1, ca2: i.ca2,
//                     ca3: i.ca3, exam: i.exam, 
//                     finalSubmitted: true }
//             }
//         })
//     }

//     const scores = await Score.bulkWrite(bulkArr)
//     res.json({ success: true, scores })
// }

// todo 
// insertMany({condition}, {isFinalSubmitted: true})

