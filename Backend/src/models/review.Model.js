import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    doctorId: {
         type: mongoose.Schema.Types.ObjectId, 
         ref: "Doctor", 
         required: true
    },
    patientId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true
    },
    rating: { 
        type: Number,
        required: true,
        min: 1, max: 5 
    },
    comment: {
         type: String 
    },
    createdAt: { 
        type: Date,
         default: Date.now 
    }
})

export const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema)