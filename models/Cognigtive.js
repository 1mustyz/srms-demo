const mongoose = require('mongoose');
const {Schema,model} = mongoose;


const CognitiveSchema = new Schema({
    username: {type:String},
    studentId: {type:String},
    firstName: {type:String},
    lastName: {type:String},
    class: {type:String},
    category: {type:String, default: "none"},
    Neatness: {type:String},
    Punctuality: {type:String},
    Attentiveness: {type:String},
    Attitude: {type:String},
    Emotion: {type:String},
    Initiative: {type:String},
    TeamWork: {type:String},
    Perseverance: {type:String},
    Speaking: {type:String},
    Leadership: {type:String},
    Acceptance: {type:String},
    Honesty: {type:String},
    Follows: {type:String},
    Participation: {type:String},
    remarks: {type:String, default: 'none'},
    term: {type:Number},
    session: {type:String}

})

const Cognitive = model('cognitive', CognitiveSchema)
module.exports = Cognitive;