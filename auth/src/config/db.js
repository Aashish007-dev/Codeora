import mongoose from 'mongoose';


export const connectToDB = async () => {
    try {
        await mongoose.connect(process.env.AUTH_MONGO_URI);
        console.log("MongoDB Conneted");
    } catch (error) {
        console.error("MongoDB Connetion Error:", error);
        process.exit(1);
    }
}