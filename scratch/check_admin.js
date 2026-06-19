const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './server/.env' });

const adminSchema = new mongoose.Schema({
  email: String,
  password: String,
}, { collection: 'admin' });

const Admin = mongoose.model('Admin', adminSchema);

async function checkAdmin() {
  try {
    console.log('Connecting to:', process.env.DB_CLUSTER_URL);
    await mongoose.connect(process.env.DB_CLUSTER_URL, {
      dbName: process.env.DB_NAME,
    });
    console.log('Connected!');
    const admin = await Admin.findOne({});
    console.log('Admin found:', admin);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkAdmin();
