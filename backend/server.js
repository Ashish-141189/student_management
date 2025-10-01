require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const parentRoutes = require("./routes/parentRoutes");
const classRoutes = require("./routes/classRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/students");
//const studentRoutes = require("./routes/finance");
const teacherRoutes = require("./routes/teachers");
const courseRoutes = require("./routes/courses");
const financeRoutes = require("./routes/finance");
const communicationRoutes = require("./routes/communication");

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/student_management";
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/auth", authRoutes);
//app.use("/api", studentRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/communication", communicationRoutes);
app.use("/api/parents", parentRoutes);
app.use("/api/classes", classRoutes);

// Serve static assets in production (optional)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
