const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const SessionResultSchema = new Schema({
    status: { type: String},
    firstName: { type: String},
    lastName: { type: String},
    username: { type: String},
    class: { type: String},
    average: { type: Number, default: 0},
    position: { type: String, default: 0},
    session: { type: String}
})

const SessionResult = model('sessionResult',SessionResultSchema)
module.exports = SessionResult