const { z } = require("zod");
const mongoose = require("mongoose");

// Helper: ObjectId string validation
const objectIdString = z.string().refine(val => mongoose.isValidObjectId(val), {
  message: "Invalid ObjectId"
});



// STUDENTS

// POST /api/students  → Create Student
const createStudentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  age: z.number().int().nonnegative("Age must be a non-negative integer")
});

// PUT /api/students/:id  → Update Student
// (all fields optional)
const updateStudentSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  age: z.number().int().nonnegative().optional()
});

// Validate student id param
const studentIdParamSchema = z.object({
  id: objectIdString
});


// --------------------------------------------------------------
// MARKS
// --------------------------------------------------------------

// POST /api/marks  → add single subject mark
const addMarkSchema = z.object({
  studentId: objectIdString,
  subject: z.string().min(1, "Subject is required"),
  marks: z.number().int().nonnegative("Marks must be ≥ 0")
});


// GET /api/marks/student/:studentId
const studentIdForMarksSchema = z.object({
  studentId: objectIdString
});



module.exports = {
  createStudentSchema,
  updateStudentSchema,
  studentIdParamSchema,

  addMarkSchema,
  studentIdForMarksSchema,
};
