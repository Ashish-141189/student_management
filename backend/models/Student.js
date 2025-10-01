const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    fees: { type: Number, default: 0 },
    address: { type: String, maxlength: 50, default: "" },
    class: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional
  },
  { timestamps: true }
);

StudentSchema.pre(/^find/, function (next) {
  this.populate("course");
  next();
});

module.exports = mongoose.model("Student", StudentSchema);
