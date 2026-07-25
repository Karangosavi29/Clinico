import axiosInstance from "./axiosInstance";

// POST /api/v1/reviews — patient only (create or update)
// body: { doctorId, rating, comment }
export const addReview = async (data) => {
  const res = await axiosInstance.post("/api/v1/reviews", data);
  return res.data.data;
};

// GET /api/v1/reviews/:id — public (get all reviews for a doctor)
export const getDoctorReviews = async (doctorId) => {
  const res = await axiosInstance.get(`/api/v1/reviews/${doctorId}`);
  return res.data.data; // { reviews, avgRating }
};

// GET /api/v1/reviews/testimonials — public
export const getTestimonials = async () => {
  const res = await axiosInstance.get("/api/v1/reviews/testimonials");
  return res.data.data;
};