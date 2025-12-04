// src/routes/marks.routes.js
const express = require('express');
const router = express.Router();

const {
  addMark,
  getMarksByStudent,
  deleteSubject
} = require('../controllers/marks.controller');

const validate = require('../middlewares/validateSchema');
const {
  addMarkSchema,
  studentIdForMarksSchema,
} = require('../validators/schemas'); 

// POST   /api/marks                -> add one subject to student's marks-doc (upsert)
router.post('/', validate(addMarkSchema, 'body'), addMark);

router.delete('/student/:studentId/subject', deleteSubject);

// GET    /api/marks/student/:studentId  -> get subjects array for a student (validate param)
router.get('/student/:studentId', validate(studentIdForMarksSchema, 'params'), getMarksByStudent);



module.exports = router;
