// src/controllers/students.controller.js
const mongoose = require('mongoose');
const Student = require('../models/Student');
const Mark = require('../models/Mark');

/**
 * POST /api/students
 * Create a new student
 */
const createStudent = async (req, res, next) => {
  try {
    const { name, email, age } = req.body;
    if (!name || !email || typeof age === 'undefined') {
      return res.status(400).json({ error: 'name, email and age are required' });
    }

    const student = await Student.create({ name: name.trim(), email: email.trim().toLowerCase(), age });
    return res.status(201).json(student);
  } catch (err) {
    // handle duplicate email gracefully
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    next(err);
  }
};

/**
 * GET /api/students?page=1&limit=10
 * Paginated list of students (no marks)
 */
const getStudents = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.max(1, parseInt(req.query.limit || '10', 10));
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Student.find().skip(skip).limit(limit).select('name email age').lean(),
      Student.countDocuments()
    ]);

    return res.json({ data, page, limit, total });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/students/:id
 * Return student and their marks (marks.subjects array or [] if none)
 */
const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });

    const student = await Student.findById(id).select('name').lean();
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const marksDoc = await Mark.findOne({ studentId: id }).lean();
    const marks = marksDoc ? marksDoc.subjects : [];

    return res.json({ student, marks });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/students/:id
 * Update student fields (name, email, age)
 */
const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });

    const payload = {};
    if (req.body.name) payload.name = req.body.name.trim();
    if (req.body.email) payload.email = req.body.email.trim().toLowerCase();
    if (typeof req.body.age !== 'undefined') payload.age = req.body.age;

    const updated = await Student.findByIdAndUpdate(id, payload, { new: true, runValidators: true }).lean();
    if (!updated) return res.status(404).json({ error: 'Student not found' });

    return res.json(updated);
  } catch (err) {
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    next(err);
  }
};

/**
 * DELETE /api/students/:id
 * Delete student AND delete their marks document
 */
const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });

    const deleted = await Student.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Student not found' });

    // cascade delete marks doc (if exists)
    await Mark.deleteOne({ studentId: id });

    return res.json({ message: 'Student and marks deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent
};
