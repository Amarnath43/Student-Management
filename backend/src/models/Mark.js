// src/models/Mark.js
const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  subject: { type: String, required: true, trim: true },
  marks: { type: Number, required: true, min: 0 }
}, { _id: false });

const markSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    unique: true // ensures one marks-doc per student
  },
  subjects: {
    type: [subjectSchema],
    default: []
  }
}, { timestamps: true });


module.exports = mongoose.model('Mark', markSchema);
