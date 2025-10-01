const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const auth = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Course = require("../models/Course");
const mongoose = require("mongoose");
const transporter = require("../utils/mailer");

// ------------------ Email Log Schema ------------------ //
const EmailLogSchema = new mongoose.Schema({
  to: [String],
  subject: String,
  message: String,
  groupName: String,
  classId: String,
  createdAt: { type: Date, default: Date.now }
});
const EmailLog = mongoose.model("EmailLog", EmailLogSchema);

async function logEmail(data) {
  try {
    await EmailLog.create(data);
  } catch (err) {
    console.error("Failed to log email:", err);
  }
}

// ------------------ Mail Transporter ------------------ //
// const transporter = nodemailer.createTransport({
//   service: process.env.EMAIL_SERVICE,
//   auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
// });

// ------------------ Existing Routes ------------------ //

// 1. Email Parent
router.post("/email-parent", auth, async (req, res) => {
  const { to, subject, message } = req.body;
  try {
    if (req.user.role === "teacher") {
      const teacher = await Teacher.findOne({ userId: req.user.id });
      if (!teacher) return res.status(403).json({ error: "Teacher profile not found" });

      const student = await Student.findOne({ parentEmail: to }).populate("course");
      if (!student) return res.status(403).json({ error: "You can only email parents of your students" });

      const course = await Course.findById(student.course);
      if (!course || String(course.teacherId) !== String(teacher._id)) {
        return res.status(403).json({ error: "You can only email parents of your students" });
      }
    } else if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text: message });
    await logEmail({ to: [to], subject, message });

    res.json({ message: "Email sent to parent" });
  } catch (err) {
    res.status(500).json({ error: "Failed to send email", details: err.message });
  }
});

// // 2. Email All Students’ Parents
// router.post("/email-students", [auth, requireRole("admin")], async (req, res) => {
//   const { subject, message } = req.body;
//   try {
//     const students = await Student.find({ parentEmail: { $exists: true, $ne: "" } });
//     const emails = students.map((s) => s.parentEmail);

//     if (emails.length === 0) return res.status(400).json({ error: "No parent emails found" });

//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       bcc: emails,
//       subject,
//       text: message
//     });
//     await logEmail({ to: emails, subject, message, groupName: "All Parents" });

//     res.json({ message: "Group email sent to students' parents" });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to send group email", details: err.message });
//   }
// });

router.post("/email-students", [auth, requireRole("admin")], async (req, res) => {
  const { classId, subject, message } = req.body;

  if (!classId) {
    return res.status(400).json({ error: "classId is required" });
  }

  try {
    // Find students with the given classId and valid parent emails
    const students = await Student.find({
      class: classId,
      email: { $exists: true, $ne: "" },
    });

    const emails = students.map((s) => s.email);

    if (emails.length === 0) {
      return res.status(400).json({ error: "No parent emails found for this class" });
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      bcc: emails,
      subject,
      text: message,
    });

    await logEmail({
      to: emails,
      subject,
      message,
      groupName: `Parents of Class ${classId}`,
    });

    res.json({ message: "Group email sent to parents of selected class" });
  } catch (err) {
    res.status(500).json({
      error: "Failed to send group email",
      details: err.message,
    });
  }
});


// ------------------ New Routes ------------------ //

// 3. Custom Group Email
router.post("/emails", [auth, requireRole("admin")], async (req, res) => {
  const { to, subject, message } = req.body;
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text: message
    });
    await logEmail({ to: Array.isArray(to) ? to : [to], subject, message, groupName: "Custom" });

    res.json({ message: "Custom email sent successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to send custom email", details: err.message });
  }
});

// 4. Send Group Email by Class
router.post("/email-students-by-class", [auth, requireRole("admin")], async (req, res) => {
  const { classId, subject, message } = req.body;
  try {
    const students = await Student.find({ classId, parentEmail: { $exists: true, $ne: "" } });
    const emails = students.map((s) => s.parentEmail);

    if (emails.length === 0) return res.status(400).json({ error: "No parent emails found in this class" });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      bcc: emails,
      subject,
      text: message
    });
    await logEmail({ to: emails, subject, message, classId });

    res.json({ message: `Group email sent to class ${classId}` });
  } catch (err) {
    res.status(500).json({ error: "Failed to send class group email", details: err.message });
  }
});

// 5. Get Class List (for dropdown)
router.get("/classes", [auth, requireRole("admin")], async (req, res) => {
  try {
    // Assuming "class" is a string or number field in the Student schema
    const classes = await Student.distinct("class");

    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch classes", details: err.message });
  }
});


// 6. Fetch Sent Emails
router.get("/emails", auth, async (req, res) => {
  try {
    const emails = await EmailLog.find().sort({ createdAt: -1 });
    res.json(emails);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch emails", details: err.message });
  }
});

module.exports = router;
