import mongoose from "mongoose";


const connectToDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");
    } catch (error) {
        console.error("MongoDB connection error: ", error);
        process.exit(1);
    }
};


export default connectToDB;