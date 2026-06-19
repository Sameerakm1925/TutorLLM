import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const adminSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const Admin = mongoose.model('Admin', adminSchema, 'admin');

const seedAdmin = async () => {
await mongoose.connect(process.env.DB_CLUSTER_URL as string, {
  dbName: process.env.DB_NAME
});

  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await Admin.deleteMany({});
  await Admin.create({
    email: 'admin@tutorllm.com',
    password: hashedPassword,
  });

  console.log('Admin created successfully!');
  console.log('Email: admin@tutorllm.com');
  console.log('Password: admin123');
  process.exit(0);
};

seedAdmin().catch(console.error);