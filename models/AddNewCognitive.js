const mongoose = require('mongoose')
const {Schema,model} = mongoose


const AddNewCognitiveSchema = new Schema({
    name: String
})

const AddNewCognitive = model('addNewCognitive', AddNewCognitiveSchema)
module.exports = AddNewCognitive;