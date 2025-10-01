const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/student_management';

async function seed() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const existing = await User.findOne({ role: 'admin' });
  if (existing) {
    console.log('Admin user already exists:', existing.email);
    process.exit(0);
  }
  const admin = new User({ name: 'Admin', email: 'admin@school.com', password: 'Admin123!', role: 'admin' });
  const salt = await bcrypt.genSalt(10);
  admin.password = await bcrypt.hash(admin.password, salt);
  await admin.save();
  console.log('Created admin user: admin@school.com / Admin123!');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
