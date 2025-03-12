
const mongoose = require('mongoose');
const url = process.env.DATABASE_URL;

const connectToDatabase = async () => {
    try {
        await mongoose.connect(url);
        console.log("Successfully connected to database");
    } catch (error) {
        console.error("Database connection error:", error);
        throw new Error("Failed to connect to the database");
    }
};

module.exports = {connectToDatabase}

