const mongoose = require('mongoose');

const connectDB = async () => {
  const dbUrl = process.env.MONGO_URL;
  await mongoose.connect(dbUrl);
  console.log('Mongo Connected');
};

module.exports = connectDB;
