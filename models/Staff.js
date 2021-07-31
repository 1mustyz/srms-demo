const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

//Schema design
const StaffSchema = new Schema({
    username: { type: String, required: true, unique: [ true, 'ID Number already exist' ] },
    firstName: { type: String, required: true},
    lastName: { type: String, required: true},
    otherName: { type: String},
    email: { type: String},
    gender: { type: String},
    qualification: { type: String, required: true},
    department: { type: String, required: true},
    phone: { type: String, required: true},
    address: { type: String},
    country: { type: String, default: 'nigeria'},
    state: { type: String},
    lga: { type: String},
    bankName: { type: String},
    accountNumber: { type: String},
    accountName: { type: String},
    nextKinName: { type: String},
    nextKinPhone1: { type: String},
    relationship: { type: String},
    nextKinAddress: { type: String},
    image: { type: String, default: '1.jpg' },
    role: { type: Array},
    userType: { type: String, default: 'staff'},
    classTeacher: { type: Array},
    ca1Button: {type: Boolean, default: true},
    ca2Button: {type: Boolean, default: true},
    ca3Button: {type: Boolean, default: true},
    ca4Button: {type: Boolean, default: true},
    examButton: {type: Boolean, default: true},
    teach: [{class: {type:String}, subject: {type:Array}, category: {type:String, default: 'none'}}]
}, { timestamps: true });   

//plugin passport-local-mongoose to enable password hashing and salting and other things
StaffSchema.plugin(passportLocalMongoose);

//connect the schema with user table
const Staff = mongoose.model('staff', StaffSchema);

//export the model 
module.exports = Staff;