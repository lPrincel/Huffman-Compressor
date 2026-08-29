const mongoose = require("mongoose");

async function connectDatabase(){
    const mongoUri = process.env.MONGODB_URI;

    if(!mongoUri){
        throw new Error("MONGODB_URI is missing from .env");
    }

    await mongoose.connect(mongoUri);

    console.log(`MongoDB connected: ${mongoose.connection.host}`);
}

module.exports = connectDatabase;