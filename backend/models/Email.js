// Model to save sent emails
const mongoose = require("mongoose");

const EmailLogSchema = new mongoose.Schema({
  to: [String],
  subject: String,
  message: String,
  groupName: String,
  classId: String,
  createdAt: { type: Date, default: Date.now }
});
const EmailLog = mongoose.model("EmailLog", EmailLogSchema);

// Save email log helper
async function logEmail(data) {
  try {
    await EmailLog.create(data);
  } catch (err) {
    console.error("Failed to log email:", err);
  }
}

// Wrap existing sendMail calls with logging
// Example in /email-parent route:
await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text: message });
await logEmail({ to: [to], subject, message });

// Example in /email-students:
await transporter.sendMail({ from: process.env.EMAIL_USER, bcc: emails, subject, text: message });
await logEmail({ to: emails, subject, message, classId: null });

// Example in /emails (custom group):
await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text: message });
await logEmail({ to: Array.isArray(to) ? to : [to], subject, message, groupName: req.body.groupName });

// Example in /email-students-by-class:
await transporter.sendMail({ from: process.env.EMAIL_USER, bcc: emails, subject, text: message });
await logEmail({ to: emails, subject, message, classId });

