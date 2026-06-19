const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const mongoUri = process.env.DB_CLUSTER_URL || 'mongodb://localhost:27017/tutortrek';

async function checkStudents() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));

    const courseCollection = mongoose.connection.db.collection('course');
    const studentCollection = mongoose.connection.db.collection('students');

    const courses = await courseCollection.find({}).toArray();
    console.log('Total Courses:', courses.length);

    const students = await studentCollection.find({}).toArray();
    console.log('Total Students:', students.length);

    // Check a specific instructor (the one from the screenshot/context if possible)
    // Or just look at courses with enrollments
    const coursesWithEnrollments = courses.filter(c => c.coursesEnrolled && c.coursesEnrolled.length > 0);
    console.log('Courses with enrollments:', coursesWithEnrollments.length);

    if (coursesWithEnrollments.length > 0) {
      console.log('Sample course enrollment IDs:', coursesWithEnrollments[0].coursesEnrolled);
      console.log('Type of first enrollment ID:', typeof coursesWithEnrollments[0].coursesEnrolled[0]);
    }

    const sampleStudent = students[0];
    if (sampleStudent) {
        console.log('Sample student ID:', sampleStudent._id);
        console.log('Type of sample student ID:', typeof sampleStudent._id);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}

checkStudents();
