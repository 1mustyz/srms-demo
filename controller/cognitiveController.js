const Cognitive = require('../models/Cognigtive');
const AddNewCognitive = require('../models/AddNewCognitive');
const TermSetter = require('../models/TermSetter')


exports.addNewCognitive = async (req,res,next) => {

    await AddNewCognitive.insertMany(req.body);
    res.json({success: true, message: 'a new cognitive has been added'})
}

exports.deleteAddNewCognitive = async (req,res,next) => {

    await AddNewCognitive.findByIdAndDelete(req.body.id)
    res.json({success: true, message: 'a new cognitive has been deleted'})

}

exports.updateAddNewCognitive = async (req,res,next) => {
    const {name,id} = req.body
    await AddNewCognitive.findByIdAndUpdate(id, {name: name})
    res.json({success: true, message: 'a new cognitive has been updated'})

}

exports.getAllAddNewCognitive = async (req,res,next) => {
    const result = await AddNewCognitive.find()
    result.length > 0
     ? res.json({success: true, result})
     : res.json({success: false, result})
}

exports.createStudentCognitive = async (req,res,next) => {
    const termAndSession = await TermSetter.find()
    const {username} = req.body
    const field = req.body.key
    await Cognitive.findOneAndUpdate({
        username: username, 
        term: termAndSession[0].termNumber, 
        session: termAndSession[0].session.year
    }, {
        [field]: req.body.value
    }, {new: true, useFindAndModify: false})
    
    res.json({success: true, message: 'you have created a cognitive for a student'})
}



exports.getAllStudentCognitive = async (req,res,next) => {
    const result = await Cognitive.find()
    result.length > 0
     ? res.json({success: true, result})
     : res.json({success: false, result})
}