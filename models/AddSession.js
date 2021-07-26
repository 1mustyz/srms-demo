const mongoose = require('mongoose')
const { Schema, model} = mongoose


const AddSessionSchema = new Schema({
    session: String
})

const AddSession = model('addSession', AddSessionSchema)
module.exports = AddSession