const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    displayId: { type: String }, // ✅ numeric Student ID like "245"
    studentName: { type: String, required: true },
    class: { type: String, required: true },
    month: { type: String, required: true },
    year: { type: Number, required: true },
    feeAmount: { type: Number, required: true },
    paymentMode: {
      type: String,
      enum: ["Cash", "Card", "Online"],
      default: "Cash",
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// ✅ Always populate studentId with only required fields
TransactionSchema.pre(/^find/, function (next) {
  this.populate("studentId", "studentId name class");
  next();
});

module.exports = mongoose.model("Transaction", TransactionSchema);
