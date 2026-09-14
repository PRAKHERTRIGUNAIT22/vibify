const mongoose = require('mongoose');

async function connectDB() {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
        console.error('MONGODB_URI is not set in .env — cannot connect to database.');
        process.exit(1);
    }

    try {
        await mongoose.connect(mongoUri);
        console.log('MongoDB connected:', mongoose.connection.host);
    } catch (err) {
        console.error('MongoDB connection failed:', err.message);
        process.exit(1);
    }

    // Log unexpected disconnects (e.g. network blip) so it's visible in server logs
    mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB disconnected.');
    });
}

module.exports = connectDB;
