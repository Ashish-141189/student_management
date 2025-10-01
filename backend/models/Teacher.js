const mongoose = require("mongoose");

const TeacherSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    subject: { type: String },

    // ✅ Link teacher to a Course document
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    address: { type: String },
    phone: { type: String },
    department: { type: String },
    qualifications: { type: String },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // optional link to user account
    },
  },
  { timestamps: true }
);

// ✅ Always populate course details when fetching teachers, but only _id + name
TeacherSchema.pre(/^find/, function (next) {
  this.populate("course", "name"); // ⚡ fixed to include _id and name only
  next();
});

module.exports = mongoose.model("Teacher", TeacherSchema);
