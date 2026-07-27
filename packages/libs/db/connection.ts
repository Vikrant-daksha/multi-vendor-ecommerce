import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async (): Promise<void> => {
    if (isConnected) return;

    const uri = process.env.DATABASE_URL;
    if (!uri) {
        throw new Error("DATABASE_URL environment variable is not set");
    }

    try {
        await mongoose.connect(uri);
        isConnected = true;
        console.log("✅ MongoDB connected");
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1);
    }
};

export default mongoose;
