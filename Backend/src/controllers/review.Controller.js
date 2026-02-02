import { asyncHandler } from "../utils/asyncHandler";
import { Review } from "../models/review.Model";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// Create or update a review
const addReview = asyncHandler(async (req, res) => {
    const { doctorId, rating, comment } = req.body;
    const patientId = req.user._id;

    if (!doctorId || !rating) {
        throw new ApiError(400, "doctorId and rating are required");
    }

    // Check if patient already reviewed doctor
    let review = await Review.findOne({ doctorId, patientId });

    if (review) {
        // Update existing review
        review.rating = rating;
        review.comment = comment;
        await review.save();
    } else {
        // Create new review
        review = await Review.create({ doctorId, patientId, rating, comment });
    }

    return res
    .status(201)
    .json(new ApiResponse(201, "Review added successfully", review));
});

// Get reviews for a doctor
const getDoctorReviews = asyncHandler(async (req, res) => {
    const doctorId = req.params.id;

    const reviews = await Review.find({ doctorId })
        .populate("patientId", "name email");

    // Optionally, calculate average rating
    const avgRating = reviews.length
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return res
    .status(200)
    .json(new ApiResponse(200, "Reviews fetched successfully", { reviews, avgRating }));
});


export {
    addReview,
    getDoctorReviews
}