import axiosInstance from "./axiosInstance";

const d = (res) => res.data.data ?? res.data.message;

// GET /api/v1/users/admin/users — admin only
export const getAllUsers = async () => {
  const res = await axiosInstance.get("/api/v1/users/admin/users");
  return d(res);
};