const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
    
    paymentTypes: String,
    amount: Number
    


})

const PaymentType = mongoose.model('payment', PaymentSchema);

module.exports = PaymentType;