const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");
const Teacher = require("../models/Teacher");
const User = require("../models/User");
const Course = require("../models/Course");
const bcrypt = require("bcryptjs");

// ===============================
// GET all teachers (paginated + search)
// ===============================
router.get("/", auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Teacher.countDocuments(query);

    // ⚡ Remove explicit populate, model hook handles it
    const teachers = await Teacher.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return res.json({
      teachers,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// CREATE teacher
// ===============================
router.post(
  "/",
  [
    auth,
    requireRole("admin"),
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("course").notEmpty().withMessage("Course is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const {
      name,
      email,
      subject,
      course,
      address,
      phone,
      department,
      qualifications,
      createUser,
      password,
    } = req.body;

    try {
      const courseExists = await Course.findById(course);
      if (!courseExists)
        return res.status(400).json({ error: "Invalid course ID" });

      const teacher = new Teacher({
        name,
        email,
        subject,
        course,
        address,
        phone,
        department,
        qualifications,
      });

      await teacher.save();

      if (createUser) {
        let user = await User.findOne({ email });
        if (!user) {
          user = new User({
            name,
            email,
            password: password || "Teacher123!",
            role: "teacher",
          });
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
          await user.save();

          teacher.userId = user._id;
          await teacher.save();
        }
      }

      // ⚡ Remove explicit populate, model hook handles it
      res.status(201).json(teacher);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// ===============================
// UPDATE teacher
// ===============================
router.put("/:id", [auth, requireRole("admin")], async (req, res) => {
  try {
    const {
      name,
      email,
      subject,
      course,
      address,
      phone,
      department,
      qualifications,
    } = req.body;

    if (course) {
      const courseExists = await Course.findById(course);
      if (!courseExists)
        return res.status(400).json({ error: "Invalid course ID" });
    }

    // ⚡ Remove explicit populate, model hook handles it
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      { name, email, subject, course, address, phone, department, qualifications },
      { new: true }
    );

    if (!teacher) return res.status(404).json({ error: "Teacher not found" });

    res.json(teacher);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ===============================
// DELETE teacher
// ===============================
router.delete("/:id", [auth, requireRole("admin")], async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher) return res.status(404).json({ error: "Teacher not found" });
    res.json({ message: "Teacher deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
