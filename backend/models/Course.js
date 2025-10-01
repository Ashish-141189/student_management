const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Course Name
    description: { type: String }, // Course Description
    duration: { type: String, required: true }, // e.g. "6 months", "1 year"
    credit: { type: Number, required: true }, // e.g. 3, 4, 5 credits
    fees: { type: Number, required: true }, // ✅ New Fees field
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    }, // Reference to Teacher
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", CourseSchema);
