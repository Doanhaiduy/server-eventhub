const mongoose = require('mongoose');
require('dotenv').config();
const dbUrl = `mongodb+srv://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@cluster0.ntvyyvm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const connectDB = async (app) => {
    try {
        const connection = await mongoose.connect(dbUrl);
        console.log(`Connected to the database successfully!`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

module.exports = connectDB;
