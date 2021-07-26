const mongoose = require('mongoose');
const {Schema, model} = mongoose;

TermSetterSchema = new Schema({
    currentTerm: String,
    termNumber: {type: Number, default: 1},
    session: {
        year: {type: String, default: 1}
    }
})

const TermSetter = model('termSetter',TermSetterSchema);

module.exports = TermSetter;