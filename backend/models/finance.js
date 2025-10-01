const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student", // Keep relation for lookups
      required: true,
    },
    displayId: { type: String, required: true }, // <-- Numeric student ID (e.g. "245")
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

module.exports = mongoose.model("Transaction", TransactionSchema);
