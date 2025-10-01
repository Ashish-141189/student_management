const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");
const Student = require("../models/Student");
const Course = require("../models/Course");
const Teacher = require("../models/Teacher");

// ===============================
// GET all students (with pagination + search + sorting)
// ===============================
router.get("/", auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", sortBy = "createdAt", order = "desc" } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { studentId: { $regex: search, $options: "i" } }, // ✅ updated
        { class: { $regex: search, $options: "i" } }, 
      ];
    }

    const sortOption = {};
    sortOption[sortBy] = order === "asc" ? 1 : -1;

    if (req.user.role === "admin") {
      const students = await Student.find(query)
        .populate("course")
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(Number(limit));

      const total = await Student.countDocuments(query);
      return res.json({
        students,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / limit),
      });
    }

    if (req.user.role === "teacher") {
      const teacher = await Teacher.findOne({ userId: req.user.id });
      if (!teacher) return res.status(403).json({ error: "No teacher record found" });

      const courses = await Course.find({ teacherId: teacher._id });
      const courseIds = courses.map((c) => c._id);

      const students = await Student.find({
        ...query,
        course: { $in: courseIds },
      })
        .populate("course")
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(Number(limit));

      const total = await Student.countDocuments({
        ...query,
        course: { $in: courseIds },
      });

      return res.json({
        students,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / limit),
      });
    }

    // Student role → only self
    const student = await Student.findOne({ userId: req.user.id }).populate("course");
    if (!student) return res.status(404).json({ error: "Student record not found" });

    return res.json({
      students: [student],
      total: 1,
      page: 1,
      totalPages: 1,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// POST new student
// ===============================
router.post(
  "/",
  [
    auth,
    requireRole("admin", "teacher"),
    body("studentId")
      .notEmpty().withMessage("Student ID required")
      .matches(/^\d{3,6}$/).withMessage("Student ID must be 3–6 digits"),
    body("name").notEmpty().withMessage("Name required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("phone").matches(/^\d{10}$/).withMessage("Phone must be 10 digits"),
    body("course").notEmpty().withMessage("Course required"),
    body("class").notEmpty().withMessage("Class required"), 
    body("address").optional().isLength({ max: 50 }).withMessage("Address cannot exceed 50 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { email, studentId, course, address } = req.body;

      const existing = await Student.findOne({ $or: [{ email }, { studentId }] });
      if (existing) {
        if (existing.email === email) {
          return res.status(400).json({ error: "Student with this email already exists" });
        }
        if (existing.studentId === studentId) {
          return res.status(400).json({ error: "Student with this Student ID already exists" });
        }
      }

      const courseExists = await Course.findById(course);
      if (!courseExists) return res.status(400).json({ error: "Invalid course ID" });

      const studentData = {
        ...req.body,
        fees: courseExists.fees || 0,
        address: address || "",
        class: req.body.class,
      };

      const student = new Student(studentData);
      await student.save();
      res.status(201).json(await student.populate("course"));
    } catch (err) {
      if (err.code === 11000) {
        if (err.keyPattern.studentId) return res.status(400).json({ error: "Student ID must be unique" });
        if (err.keyPattern.email) return res.status(400).json({ error: "Email must be unique" });
      }
      res.status(400).json({ error: err.message });
    }
  }
);

// ===============================
// PUT update student
// ===============================
router.put("/:id", auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate("course");
    if (!student) return res.status(404).json({ error: "Student not found" });

    if (req.body.course) {
      const courseExists = await Course.findById(req.body.course);
      if (!courseExists) return res.status(400).json({ error: "Invalid course ID" });

      req.body.fees = courseExists.fees || 0;
    }

    if (req.body.address && req.body.address.length > 50) {
      return res.status(400).json({ error: "Address cannot exceed 50 characters" });
    }

    if (req.body.class === undefined || req.body.class.trim() === "") {
      return res.status(400).json({ error: "Class is required" });
    }

    if (req.user.role === "admin") {
      Object.assign(student, req.body);
      await student.save();
      return res.json(await student.populate("course"));
    }

    if (req.user.role === "teacher") {
      const teacher = await Teacher.findOne({ userId: req.user.id });
      if (!teacher) return res.status(403).json({ error: "No teacher record" });

      if (!student.course || String(student.course.teacherId) !== String(teacher._id)) {
        return res.status(403).json({ error: "Cannot edit student outside your courses" });
      }

      Object.assign(student, req.body);
      await student.save();
      return res.json(await student.populate("course"));
    }

    res.status(403).json({ error: "Forbidden" });
  } catch (err) {
    if (err.code === 11000) {
      if (err.keyPattern.studentId) return res.status(400).json({ error: "Student ID must be unique" });
      if (err.keyPattern.email) return res.status(400).json({ error: "Email must be unique" });
    }
    res.status(400).json({ error: err.message });
  }
});

// ===============================
// DELETE student
// ===============================
router.delete("/:id", [auth, requireRole("admin")], async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });

    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


const mongoose = require("mongoose");

// ===============================
// GET single student by _id or studentId (for Finance module)
// ===============================
router.get("/fetch/:studentIdentifier", auth, async (req, res) => {
  try {
    const { studentIdentifier } = req.params;

    let student;

    // Try as MongoDB ObjectId first
    if (mongoose.Types.ObjectId.isValid(studentIdentifier)) {
      student = await Student.findById(studentIdentifier);
    }

    // Fallback to studentId field
    if (!student) {
      student = await Student.findOne({ studentId: studentIdentifier });
    }

    if (!student) return res.status(404).json({ error: "Student not found" });

    res.json({
      _id: student._id,              // MongoDB ID
      studentId: student.studentId,  // internal student ID
      name: student.name,
      section: student.class,
      fees: student.fees,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
