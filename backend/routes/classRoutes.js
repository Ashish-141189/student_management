const express = require("express");
const router = express.Router();
//const Class = require("../models/Class"); // create this model''
const Student = require("../models/Student");

// Get all classes
router.get("/", async (req, res) => {
  try {
    const classes = await Student.distinct("class");
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// router.get("/classes", [auth, requireRole("admin")], async (req, res) => {
//   try {
//     // Assuming "class" is a string or number field in the Student schema
//     const classes = await Student.distinct("class");

//     res.json(classes);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch classes", details: err.message });
//   }
// });


module.exports = router;
