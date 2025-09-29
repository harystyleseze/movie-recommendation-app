const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  console.log('🔍 Testing database connection...');
  console.log('📌 MONGO_URI:', process.env.MONGO_URI);

  try {
    const options = {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    };

    await mongoose.connect(process.env.MONGO_URI, options);

    console.log('✅ Database connection test successful');
    console.log('📊 Connection Details:');
    console.log('- Database Name:', mongoose.connection.name);
    console.log('- Host:', mongoose.connection.host);
    console.log('- Port:', mongoose.connection.port);
    console.log('- State:', mongoose.connection.readyState);
  } catch (error) {
    console.error('❌ Database connection test failed');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
  }
}

testConnection();
