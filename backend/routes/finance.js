const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose"); // 🔹 You were using mongoose.Types.ObjectId but hadn’t imported it
const auth = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");
const Transaction = require("../models/Transaction");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const Course = require("../models/Course");

// GET all transactions
router.get("/transactions", auth, async (req, res) => {
  try {
    let transactions = [];

    if (req.user.role === "admin") {
      transactions = await Transaction.find();
    } else if (req.user.role === "teacher") {
      const teacher = await Teacher.findOne({ userId: req.user.id });
      if (!teacher)
        return res.status(403).json({ error: "Teacher profile not found" });

      const courses = await Course.find({ teacherId: teacher._id });
      const students = await Student.find({
        course: { $in: courses.map((c) => c._id) },
      });

      const studentIds = students.map((s) => s._id.toString());

      transactions = await Transaction.find({
        studentId: { $in: studentIds },
      });
    } else {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET student details for auto-populate
router.get("/students/:studentId", auth, async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const isValidObjectId = mongoose.Types.ObjectId.isValid(studentId);

    let student = null;

    if (isValidObjectId) {
      student = await Student.findById(studentId);
    }

    if (!student) {
      student = await Student.findOne({ studentId: studentId }); // numeric field
    }

    if (!student) return res.status(404).json({ error: "Student not found" });

    res.json({
      _id: student._id,
      studentId: student.studentId, // 🔹 send numeric studentId too
      name: student.name,
      section: student.class,
      fees: student.fees || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new transaction
router.post(
  "/transactions",
  [
    auth,
    requireRole("admin", "teacher"),
    body("studentId").notEmpty().withMessage("Student ID required"),
    body("studentName").notEmpty().withMessage("Student Name required"),
    body("class").notEmpty().withMessage("Class required"),
    body("month").notEmpty().withMessage("Month required"),
    body("year").isNumeric().withMessage("Year required"),
    body("feeAmount").isNumeric().withMessage("Fee Amount must be numeric"),
    body("paymentMode")
      .isIn(["Cash", "Card", "Online"])
      .withMessage("Invalid Payment Mode"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      // 🔹 Ensure numeric studentId is stored as displayId
      let displayId = req.body.displayId;

      if (!displayId && req.body.studentId) {
        const studentDoc = await Student.findById(req.body.studentId);
        if (studentDoc) {
          displayId = studentDoc.studentId; // numeric id from Student model
        }
      }

      const txn = new Transaction({
        ...req.body,
        displayId: displayId || "N/A",
      });

      await txn.save();
      res.status(201).json(txn);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// PUT update transaction
router.put(
  "/transactions/:id",
  [auth, requireRole("admin", "teacher")],
  async (req, res) => {
    try {
      const txn = await Transaction.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!txn) return res.status(404).json({ error: "Transaction not found" });
      res.json(txn);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// DELETE transaction
router.delete(
  "/transactions/:id",
  [auth, requireRole("admin")],
  async (req, res) => {
    try {
      const txn = await Transaction.findByIdAndDelete(req.params.id);
      if (!txn)
        return res.status(404).json({ error: "Transaction not found" });
      res.json({ message: "Transaction deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Dashboard: total fees collected
router.get(
  "/dashboard/total-fees",
  auth,
  requireRole("admin", "teacher"),
  async (req, res) => {
    try {
      let filter = {};

      if (req.user.role === "teacher") {
        const teacher = await Teacher.findOne({ userId: req.user.id });
        if (!teacher)
          return res.status(403).json({ error: "Teacher profile not found" });

        const courses = await Course.find({ teacherId: teacher._id });
        const students = await Student.find({
          course: { $in: courses.map((c) => c._id) },
        });
        const studentIds = students.map((s) => s._id);
        filter.studentId = { $in: studentIds };
      }

      const totalFees = await Transaction.aggregate([
        { $match: filter },
        { $group: { _id: null, totalAmount: { $sum: "$feeAmount" } } },
      ]);

      res.json({ totalFees: totalFees[0]?.totalAmount || 0 });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
