// src/routes/students.routes.js
const express = require('express');
const router = express.Router();

const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent
} = require('../controllers/students.controller');

const validate = require('../middlewares/validateSchema');
// adjust path/name to your validators file; below I assume you put them in ../schemas/*
const {
  createStudentSchema,
  updateStudentSchema,
  studentIdParamSchema
} = require('../validators/schemas');

// POST   /api/students        -> create student
router.post('/', validate(createStudentSchema, 'body'), createStudent);

// GET    /api/students?page=1&limit=10  -> paginated list
router.get('/', getStudents);

// GET    /api/students/:id    -> student + marks (validate :id)
router.get('/:id', validate(studentIdParamSchema, 'params'), getStudentById);

// PUT    /api/students/:id    -> update student (validate params + body)
router.put(
  '/:id',
  validate(studentIdParamSchema, 'params'),
  validate(updateStudentSchema, 'body'),
  updateStudent
);

// DELETE /api/students/:id    -> delete student + cascade marks
router.delete('/:id', validate(studentIdParamSchema, 'params'), deleteStudent);

module.exports = router;
