import axiosInstance from "./axiosInstance";

// GET /api/v1/doctors — public
export const getAllDoctors = async () => {
  const res = await axiosInstance.get("/api/v1/doctors");
  return res.data.data;
};

// GET /api/v1/doctors/:id — public
export const getSingleDoctor = async (id) => {
  const res = await axiosInstance.get(`/api/v1/doctors/${id}`);
  return res.data.data;
};

// GET /api/v1/doctors/:id/availability — public
export const getDoctorAvailability = async (id) => {
  const res = await axiosInstance.get(`/api/v1/doctors/${id}/availability`);
  return res.data.data;
};

// PUT /api/v1/doctors/:id/availability — doctor only
export const updateAvailability = async (id, availability) => {
  const res = await axiosInstance.put(`/api/v1/doctors/${id}/availability`, { availability });
  return res.data.data;
};

// GET /api/v1/doctors/dashboard — doctor only (stats)
export const getDoctorStats = async () => {
  const res = await axiosInstance.get("/api/v1/doctors/dashboard");
  return res.data.data;
};

// POST /api/v1/doctors — admin only
export const createDoctor = async (data) => {
  const res = await axiosInstance.post("/api/v1/doctors", data);
  return res.data.data;
};

// PUT /api/v1/doctors/:id — admin only
export const updateDoctor = async (id, data) => {
  const res = await axiosInstance.put(`/api/v1/doctors/${id}`, data);
  return res.data.data;
};

// DELETE /api/v1/doctors/:id — admin only
export const deleteDoctor = async (id) => {
  const res = await axiosInstance.delete(`/api/v1/doctors/${id}`);
  return res.data;
};