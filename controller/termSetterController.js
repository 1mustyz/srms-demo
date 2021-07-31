const TermSetter = require('../models/TermSetter');
const Student = require('../models/Student')
const Curriculum = require('../models/Curriculum');
const Score = require('../models/Score');
const TermResult = require('../models/TermResult');
const SessionResult = require('../models/SessionResult')
const Payment = require('../models/Payment');
const Cognitive = require('../models/Cognigtive');
const AddSession = require('../models/AddSession')
const waait = require('waait')

exports.setNewTerm = async (req,res,next) => {

    const result = await TermSetter.find()

    console.log(result.length)

    result.length == 0
     ? await TermSetter.collection.insertOne({currentTerm: 'First Term', termNumber: 1})
     : ''

    if (result.length > 0){
        const result = await TermSetter.findOne()

        switch (result.termNumber) {
            case 1:
                await TermSetter.updateOne({currentTerm: 'Second Term', termNumber: 2})
                break;
            case 2:
                await TermSetter.updateOne({currentTerm: 'Third Term', termNumber: 3})
                break;
            case 3:
                await TermSetter.updateOne({currentTerm: 'First Term', termNumber: 1})
                break;
            
            default:
                await TermSetter.updateOne({currentTerm: 'First Term', termNumber: 1})
                break;
        }
    }
    
    // find all students that have not graduate 
    const students = await Student.find({ status: 'Active' })
    let subjects = await Curriculum.find({ })
    
    students.forEach( async (student) => {
        // find student class and subjects
        // const studentSubjects = subjects.filter( currentELement => {
        //    return currentELement.name === student.currentClass &&
        //     currentELement.category === student.category
        // })

        const studentSubjects = await Curriculum.find(
            { 'name': student.currentClass, 'category': student.category},
            { 'subject': 1, _id: 0})
     

        const termAndSession = await TermSetter.find()
        // create score document for each student's subject
        console.log('1111111111111111111',studentSubjects,student.username)
        // console.log('----------------',students)

        const scoreDocuments = studentSubjects[0].subject.map(async (subject) => {
           
               await Score.collection.insertOne({
                subject, 
                username: student.username,
                studentId: student._id,
                class: student.currentClass,
                category: student.category,
                firstName: student.firstName,
                lastName: student.lastName,
                username: student.username,
                term: termAndSession[0].termNumber,
                session: termAndSession[0].session.year
            })
           
        })

        // console.log('----------------',scoreDocuments)


          // creating a new school payment
          await Payment.collection.insertOne({
            studentId: student._id,
            username: student.username,
            firstname: student.firstName,
            lastName: student.lastName,
            paid: false,
            term: termAndSession[0].termNumber,
            session: termAndSession[0].session.year,
            className: student.currentClass
          })

          // creating a new cognitive data
        await Cognitive.collection.insertOne({
            username: student.username,
            studentId: student._id,
            firstName: student.firstName,
            lastName: student.lastName,
            class: student.currentClass,
            category: student.category,
            neatness: '',
            punctuality: '',
            hardWorking: '',
            remarks: '',
            term: termAndSession[0].termNumber,
            session: termAndSession[0].session.year,
        })
    })

    // creating a term result
    const termAndSession = await TermSetter.find()

    const newTermResult = students.map(std => {
        const studentSubjects = subjects.filter( currentELement => {
            return currentELement.name === std.currentClass &&
             currentELement.category === std.category
         })
        return {
            username: std.username,
            studentId: std._id,
            class: std.currentClass,
            noOfCourse: studentSubjects[0].subject.length,
            term: termAndSession[0].termNumber,
            session: termAndSession[0].session.year
        }
    })
    await TermResult.insertMany(newTermResult)


    res.json({success: true, message: 'new term has been set successfully'})
}

exports.getCurrentTerm = async (req,res,next) => {
    const result = await TermSetter.find()
    res.json({success: true, result})
}

exports.setSession = async (req,res,next) => {

    const termAndSession = await TermSetter.find()

    // adding a session value for the front end
    await AddSession.collection.insertOne({session: termAndSession[0].session.year})

    // souley's code starts here
    // // graduate some students
    const students = await Student.find({ status: 'Active' })
    const seniors = students.filter( student => 
           student.currentClass === 'JSS3' 
        || student.currentClass === 'SSS3' 
        || student.currentClass ==='Grade5' 
        || student.currentClass ==='Kindergarten3'
        || student.currentClass ==='Playclass')
        || student.currentClass ==='Daycare'

        
    seniors.forEach( async (senior) => {
        await Student.findOneAndUpdate(
            { username: senior.username }, 
            { status: 'graduated' },
            { useFindAndModify: false })
        })

    // // // promote some students 
    const juniors = students.filter( student => 
        student.currentClass !== 'JSS3' 
        || student.currentClass !== 'SSS3' 
        || student.currentClass !=='Grade5' 
        || student.currentClass !=='Kindergarten3'
        || student.currentClass !=='Playclass'
        || student.currentClass !=='Daycare')

    // console.log(juniors)    

   await juniors.forEach( async (junior) => {
        const termAverages = await TermResult.find({
              username: junior.username,
              session: termAndSession[0].session.year 
            })
            const termAverage1 = termAverages[0].average === undefined ? 0 : termAverages[0].average
            const termAverage2 = termAverages[1].average === undefined ? 0 : termAverages[1].average
            const termAverage3 = termAverages[2].average === undefined ? 0 : termAverages[2].average
            const average = (termAverage1 + termAverage2 + termAverage3)/3
            
            // const position1 = termAverages[0].position === undefined ? 0 : parseInt(termAverages[0].position)
            // const position2 = termAverages[1].position === undefined ? 0 : parseInt(termAverages[1].position)
            // const position3 = termAverages[2].position === undefined ? 0 : parseInt(termAverages[2].position)

            // const position = (position1 + position2 + position3)/3
            // console.log(position)
            
        const status = average >= 40 ? 'Promoted' : 'Demoted'
    await SessionResult.collection.insertOne({
            average,
            status,
            username: junior.username,
            session: termAndSession[0].session.year,
            class: junior.currentClass,
        }) 
        
        
    })

const sessionRecords = await SessionResult.find(
    {session: termAndSession[0].session.year},
    {average: 1, username: 1})
// console.log(sessionRecords)
    
sessionRecords.sort((a,b) => {
    return b.total - a.total 
})  
const currentSessionPosition = sessionRecords.map((students,ind)=>{
    return studentIdentity={
        id:students.id,
        position:ind+1,
        username: students.username
    }
        
}) 

currentSessionPosition.map( async (students,ind)=>{
    await SessionResult.findByIdAndUpdate(students.id, {position: students.position})
})   

console.log(currentSessionPosition)
    setTimeout(() => {
        (async function(){
            const promotedStudents = await SessionResult.find({
                status: 'Promoted', session: termAndSession[0].session.year
               })
            console.log('///////////',promotedStudents)
           promotedStudents.forEach(async (student) => {
               await Student.updateOne({ 
                   username: student.username }, 
                   { $inc: { classNumber: 1 }}, 
                   { new: true }) 
               
               const singleStudent = await Student.find({username: student.username })
               console.log(singleStudent[0].section)
        
               
               switch (singleStudent[0].section) {
                   case 'Grade':
                       className = `Grade${singleStudent[0].classNumber}`
                       await Student.updateOne({ username: singleStudent[0].username }, 
                           { $set: {currentClass: className } }, { new: true })  
                       break;
               
                   case 'JSS':
                       className = `JSS${singleStudent[0].classNumber}`
                       await Student.updateOne({ username: singleStudent[0].username }, 
                           { $set: {currentClass: className } }, { new: true })  
                       break;
               
                   case 'SSS':    
                       className = `SSS${singleStudent[0].classNumber}`
                       await Student.updateOne({ username: singleStudent[0].username }, 
                           { $set: {currentClass: className } }, { new: true })  
                       break;
                              
                   case 'Kindergarten':    
                       className = `Kindergarten${singleStudent[0].classNumber}`
                       await Student.updateOne({ username: singleStudent[0].username }, 
                           { $set: {currentClass: className } }, { new: true })  
                       break;    
                             
               
                   default:
                       break;
               }
              
                   
           })
        
        })()
    }, 2000);

   
    setTimeout(async () => {
        // // update student model, to reflect new class for promoted students

    

    
    // // update session here 
    const {session} = req.body
    await TermSetter.updateOne({
        session: session,
        termNumber: 1,
        currentTerm: 'First Term'

    
    })

    const newTermAndSession = await TermSetter.find()
    console.log(newTermAndSession)

    // create new score sheets for all active students
    let subjects = await Curriculum.find({ })
    const newStudents1 = await Student.find({ status: 'Active' })

    newStudents1.forEach( async (student) => {
        // find student class and subjects
        const studentSubjects = subjects.filter( currentELement => {
           return currentELement.name === student.currentClass &&
            currentELement.category === student.category
        })

        // create score document for each student's subject
        const scoreDocuments = studentSubjects[0].subject.map(subject => ({
            subject,
            username: student.username,
            studentId: student._id,
            class: student.currentClass,
            category: student.category,
            firstName: student.firstName,
            lastName: student.lastName,
            username: student.username,
            term: newTermAndSession[0].termNumber,
            session: newTermAndSession[0].session.year
        }))
        await Score.insertMany(scoreDocuments)

        // creating a new school payment
        await Payment.collection.insertOne({
            studentId: student._id,
            username: student.username,
            firstname: student.firstName,
            lastName: student.lastName,
            paid: false,
            term: newTermAndSession[0].termNumber,
            session: newTermAndSession[0].session.year,
            className: student.currentClass
          })

        // creating a new cognitive data
        await Cognitive.collection.insertOne({
            username: student.username,
            studentId: student._id,
            firstName: student.firstName,
            lastName: student.lastName,
            class: student.currentClass,
            category: student.category,
            Neatness:'',
            Punctuality:'',
            Attentiveness:'',
            Attitude:'',
            Emotion:'',
            Initiative:'',
            TeamWork:'',
            Perseverance:'',
            Speaking:'',
            Leadership:'',
            Acceptance:'',
            Honesty:'',
            Follows:'',
            Participation:'',
            remarks: '',
            term: newTermAndSession[0].termNumber,
            session: newTermAndSession[0].session.year,
        })  

        const noOfCourse = await Curriculum.find(
            {'name': student.currentClass, 'category': student.category},
            { 'subject': 1}
          )
            // creating a new term result
        await TermResult.collection.insertOne({
            studentId: student._id,
            username: student.username,
            class: student.currentClass,
            noOfCourse: noOfCourse[0].subject.length,
            term: newTermAndSession[0].termNumber,
            session: newTermAndSession[0].session.year,
        })
    })

    




    res.json({ success: true, message: 'session set successfully' })
    // Souley's code ends here

    }, 4000);


    
}

exports.getSession = async (req,res,next) => {
    const result = await TermSetter.findOne({},{session: 1})
    res.json({success: true, result})

}

exports.getAddSession = async (req,res,next) => {
    const result = await AddSession.find()
    res.json({success: true, result})

}