const mongoose = require('mongoose');
const {Schema, model} = mongoose;


const AssignmentSchema = new Schema({
    username: {type: String},
    staffId: {type: String},
    firstName: {type: String},
    lastName: {type: String},
    class: {type: String},
    category: {type: String},
    term: {type: Number},
    session: {type: String},
    head: {type: String},
    text: {type: String},
    file: {type: String},
    subject: {type: String},
    date: {type: String},
    created_at :{ type: String}
    
})

const Assignment = model('assignment', AssignmentSchema)
module.exports = Assignment