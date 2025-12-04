// src/controllers/marks.controller.js
const mongoose = require('mongoose');
const Mark = require('../models/Mark');
const Student = require('../models/Student');

/**
 * POST /api/marks
 * Body: { studentId, subject, marks }
 * If marks doc for student doesn't exist, upsert it (create).
 * This endpoint adds ONE subject entry per request. You can also post multiple times.
 */
const addMark = async (req, res, next) => {
  try {
    const { studentId, subject, marks } = req.body;
    if (!studentId || !subject || typeof marks === 'undefined') {
      return res.status(400).json({ error: 'studentId, subject and marks are required' });
    }
    if (!mongoose.isValidObjectId(studentId)) return res.status(400).json({ error: 'Invalid studentId' });

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    // push subject into subjects array, create doc if not exists
    const updated = await Mark.findOneAndUpdate(
      { studentId },
      { $push: { subjects: { subject: subject.trim(), marks: Number(marks) } } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json(updated);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/marks/student/:studentId
 * Return entire marks doc (subjects array)
 */
const getMarksByStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    if (!mongoose.isValidObjectId(studentId)) return res.status(400).json({ error: 'Invalid studentId' });

    const marksDoc = await Mark.findOne({ studentId }).lean();
    console.log(marksDoc);
    if (!marksDoc) return res.json([]); // empty array when not found

    return res.json(marksDoc.subjects || []);
  } catch (err) {
    next(err);
  }
};


const deleteSubject = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { subject } = req.body;
    if (!subject) return res.status(400).json({ error: 'subject is required' });
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ error: 'Invalid studentId' });
    }

    // use $pull with case-sensitive matching; to do case-insensitive, we fetch and filter
    const doc = await Mark.findOne({ studentId });
    if (!doc) return res.status(404).json({ error: 'Marks document not found' });

    // filter out matching subjects (case-insensitive)
    const beforeCount = doc.subjects.length;
    doc.subjects = doc.subjects.filter(s => s.subject.toLowerCase() !== subject.trim().toLowerCase());

    if (doc.subjects.length === beforeCount) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    await doc.save();
    return res.status(200).json({ message: 'Subject deleted', subjects: doc.subjects });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  addMark,
  getMarksByStudent,
  deleteSubject
};
