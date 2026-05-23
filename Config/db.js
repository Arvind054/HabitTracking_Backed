const mongoose = require('mongoose');

async function dbConnection() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('db connected successfully');
    } catch (error) {
        console.log('error connecting DB, ', error);
        throw error;
    }
}

module.exports = dbConnection;