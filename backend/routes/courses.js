// routes/course.js
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");
const Course = require("../models/Course");
const Teacher = require("../models/Teacher");

// GET all courses (with pagination & sorting)
router.get("/", auth, async (req, res) => {
  try {
    let { page = 1, limit = 10, sortBy = "createdAt", order = "desc" } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const sort = { [sortBy]: order === "asc" ? 1 : -1 };
    const skip = (page - 1) * limit;

    const courses = await Course.find()
      .populate("teacherId", "name")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Course.countDocuments(); // ✅ add total
    res.json({
      courses,
      total, // ✅ return total
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// CREATE course (admin or teacher)
router.post(
  "/",
  [
    auth,
    requireRole("admin", "teacher"),
    body("name").notEmpty().withMessage("Course name required"),
    body("duration").notEmpty().withMessage("Duration required"),
    body("credit").isNumeric().withMessage("Credit must be a number"),
    body("fees").isNumeric().withMessage("Fees must be a number"), // ✅ fees validation
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const courseData = {
        name: req.body.name,
        description: req.body.description,
        duration: req.body.duration,
        credit: req.body.credit,
        fees: req.body.fees, // ✅ include fees
      };

      if (req.user.role === "teacher") {
        const teacher = await Teacher.findOne({ userId: req.user.id });
        if (!teacher)
          return res.status(403).json({ error: "Teacher profile not found" });
        courseData.teacherId = teacher._id;
      } else if (req.body.teacherId) {
        courseData.teacherId = req.body.teacherId;
      }

      const course = new Course(courseData);
      await course.save();

      const populatedCourse = await course.populate("teacherId", "name");
      res.status(201).json(populatedCourse);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// UPDATE course (admin or owning teacher)
router.put("/:id", auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });

    if (req.user.role === "admin") {
      Object.assign(course, req.body);
      await course.save();
      return res.json(await course.populate("teacherId", "name"));
    } else if (req.user.role === "teacher") {
      const teacher = await Teacher.findOne({ userId: req.user.id });
      if (!teacher)
        return res.status(403).json({ error: "Teacher profile not found" });
      if (String(course.teacherId) !== String(teacher._id))
        return res
          .status(403)
          .json({ error: "Cannot edit course you don't own" });

      Object.assign(course, req.body);
      await course.save();
      return res.json(await course.populate("teacherId", "name"));
    } else {
      return res.status(403).json({ error: "Forbidden" });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE course (admin only)
router.delete("/:id", [auth, requireRole("admin")], async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course)
      return res.status(404).json({ error: "Course not found" });
    res.json({ message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
