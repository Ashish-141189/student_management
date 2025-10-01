const express = require("express");
const router = express.Router();
const Student = require("../models/Student");

// Get all parents (just extract parent emails from students)
router.get("/", async (req, res) => {
  try {
    const parents = await Student.find().select("name email");
    res.json(parents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
