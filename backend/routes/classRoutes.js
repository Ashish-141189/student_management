const express = require("express");
const router = express.Router();
const Class = require("../models/Class"); // create this model

// Get all classes
router.get("/", async (req, res) => {
  try {
    const classes = await Class.find();
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
