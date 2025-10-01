const mongoose = require("mongoose");

const ClassSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "10 A"
});

module.exports = mongoose.model("Class", ClassSchema);
