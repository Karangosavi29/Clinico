import { asyncHandler } from "../utils/asyncHandler.js";
import { Review } from "../models/review.Model.js";
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
    .json(new ApiResponse(201, review, "Review added successfully"));
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
    .json(new ApiResponse(200, { reviews, avgRating }, "Reviews fetched successfully"));
});

const getTestimonials = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ comment: { $exists: true, $ne: "" } })
        .sort({ createdAt: -1 })
        .limit(6)
        .populate("patientId", "name");

    const testimonials = reviews.map(r => ({
        id: r._id,
        name: r.patientId?.name || "Anonymous",
        role: "Patient",
        quote: r.comment,
        stars: r.rating,
    }));

    return res
    .status(200)
    .json(new ApiResponse(200, testimonials, "Testimonials fetched successfully"));
});


export {
    addReview,
    getDoctorReviews,
    getTestimonials
}