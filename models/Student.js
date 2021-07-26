const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

//Schema design
const StudentSchema = new Schema({
    status: { type: String, default: 'Active' },
    username: { type: String, required: true, unique: [ true, 'ID Number already exist' ] },
    firstName: {type: String, require: true},
    lastName: {type: String, require: true},
    otherName: {type: String},
    address: {type: String},
    kinName: {type: String},
    kinNumber: {type: String},
    kinRelation: {type: String},
    kinAddress: {type: String},
    dob: {type: String},
    gender: {type: String},
    term: {type: Number},
    session: {type: String},
    country: {type: String, default: "Nigeria"},
    state: {type: String},
    lga: {type: String},
    image: { type: String, default: '1.jpg' },
    currentClass: { type: String },
    classNumber: { type: Number},
    section: { type: String }, // specifies type of student primary, junior or senior
    category: { type: String, default: 'none' } // specifies category for senior school students Science, Art or Null for primary & junior pupils
}, { timestamps: true });

//plugin passport-local-mongoose to enable password hashing and salting and simpligy other things
StudentSchema.plugin(passportLocalMongoose);

//connect the schema with user table
const Student = mongoose.model('student', StudentSchema);

//export the model 
module.exports = Student;