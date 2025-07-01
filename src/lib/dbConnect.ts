import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number
}

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
    if (connection.isConnected) {
        console.log("Already connected to MongoDB");
        return;
    }

     if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined");
  }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI);
        connection.isConnected = db.connections[0].readyState;

        console.log(`MongoDB connected: ${db.connection.host}`);
    } catch (error) {
        console.error("MongoDB connection error:", error)
        process.exit(1);
    }
}

export default dbConnect;