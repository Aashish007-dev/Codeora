import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    googleId: {
        type: String, 
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    avatar: {
        type: String
    }
}, {timestamps: true});


const userModel = mongoose.model('user', userSchema);

export default userModel;