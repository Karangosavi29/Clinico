import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema(
{
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    tokenHash: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["VERIFY_EMAIL", "RESET_PASSWORD"],
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    used: {
        type: Boolean,
        default: false
    }
},
{ timestamps: true }
);

// Optional: auto-delete expired tokens
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Token = mongoose.model("Token", tokenSchema);
