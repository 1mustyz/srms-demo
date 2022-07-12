const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ScoreSchema = new Schema({
  username: String,
  isActive: { type: Boolean, default: true },
  studentId: String,
  firstName: String,
  lastName: String,
  class: String,
  term: { type: Number },
  session: { type: String },
  category: String,
  subject: String,
  ca1: Number,
  ca2: Number,
  ca3: Number,
  ca4: Number,
  assessment: Number,
  exam: Number,
  grade: String,
  remark: String,
  classAverage: Number,
  highest: Number,
  lowest: Number,
  total: { type: Number, default: 0 },
  subjectPosition: { type: Number, default: 0 },
  isfinalSubmitted: { type: Boolean, default: false }
}, { timestamps: true })

const Score = mongoose.model('score', ScoreSchema)

module.exports = Score
