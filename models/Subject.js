const mongoose = require('mongoose');
const {Schema,model} = mongoose;

const SubjectSchema = new Schema({
    subject: String
})

const Subject = model('subject', SubjectSchema)
module.exports = Subject;