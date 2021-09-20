const Curriculum = require('../models/Curriculum');
const Score = require('../models/Score')
const Student = require('../models/Student')
const termAndSession = require('../models/TermSetter')
const termResult = require('../models/TermResult')

exports.create = async (req,res,next) => {
    const {section,name,category} = req.body

    let curricula
    const currentSession = await termAndSession.find({},{session: 1, id: 0, termNumber: 1})
    
    // fetch curriculum based on SSS or others
    if(section !== 'SSS'){
       curricula = await Curriculum.find({name: name})
    } 
    else{
       curricula = await Curriculum.find({name: name,category: category})
    } 
    
    // if curriculum already exists
    if(curricula.length){
        // update the curriculum and end
        await Curriculum.updateOne({name:name, category: category}, {$push:{subject: req.body.subjects}})
        const score = await Score.find({class: name, category: category})
        const newCurricula = await Curriculum.find({name: name, category, category})
        const numOfSubjects = newCurricula.subject.length

        // if score exists update score and term results of students
        if(score.length){
            // fetch the students in the class
            const students = await Student.find({
                currentClass: name, category: category, 
                session: currentSession[0].session.year })

            req.body.subjects.map(subject=>{
                // add score sheets to the students
                students.map(async std=>{
                    await Score.insertOne({
                        subject,
                        username: std.username,
                        studentId: std._id,
                        class: std.currentClass,
                        category: std.category,
                        fristName: std.fristName,
                        lastName: std.lastName,
                        term: currentSession[0].termNumber,
                        session: currentSession[0].session.year
                    })
                    // update number of courses for the student at hand
                    await termResults.updateMany({
                        session: currentSession[0].session.year,
                        term: currentSession[0].termNumber,
                        username: std.username
                        }, {
                        noOfCourse: numOfSubjects
                        })
                })
            })

        } else{
            // no existing score sheets just update curriculum
            await Curriculum.updateOne({name:name, category: category}, {$push:{subject: req.body.subjects}})
        }
    }

    // no existing curriculum create new
    section !== 'SSS'
     ? req.body.category = "none"
     : ''

    await Curriculum.insertMany(req.body);
    res.json({success: true, message: `curriculum added successfully`});
}

exports.getAllCurriculum = async (req,res,next) => {
    const result = await Curriculum.find()

    result
     ? res.json({success: true, message: result})
     : res.json({success: false, message: result})
}

exports.getAdminAllCurriculum = async (req,res,next) => {
    const result = await Curriculum.find()

    result
     ? res.json({success: true, subjects: result})
     : res.json({success: false, subjects: result})
}
exports.getSingleCurriculum = async (req,res,next) => {
    const {number,section,category} = req.body;
    const result = await Curriculum.findOne({number: number, section: section, category: category});

    result
     ? res.json({success: true, message: result})
     : res.json({success: false, message: `No curriculum added yet`})
}

exports.updateSingleCurriculum = async (req,res,next) => {
    const {number,section,category} = req.body;
    await Curriculum.updateOne({
        number: number, section: section, category: category
    }, 
    {class: req.body});

    res.json({success: true, message: `curriculum updated`})
    
}

exports.deleteSingleCurriculum = async (req,res,next) => {
    const {number,section,category} = req.body;
    await Curriculum.deleteOne({
        number: number, section: section, category: category
    });

    res.json({success: true, message: `curriculum deleted`})
}

exports.deleteAllCurriculum = async (req,res,next) => {
    await Curriculum.delete();

    res.json({success: true, message: `All curriculum deleted`})
}

exports.getClassCurriculum = async (req,res,next) => {
    const {currentClass,category} = req.query;
    const result = await Curriculum.findOne({name: currentClass, category: category});

    result
     ? res.json({success: true, result})
     : res.json({success: false, result})
}