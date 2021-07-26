const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CurriculumSchema = new Schema({
    
        
            name: {type: String},
            category: {type: String, default: "none"},
            section: {type: String, default: "none"},
            subject: Array
        
    
})

const Curriculum = mongoose.model('curriculum', CurriculumSchema);
module.exports = Curriculum;