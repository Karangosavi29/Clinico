import axiosInstance from "./axiosInstance";

// POST /api/v1/users/Login  (capital L — matches your backend route)
export const loginUser = async (data) => {
  const res = await axiosInstance.post("/api/v1/users/Login", data);
  return res.data.data; // { user, accessToken, refreshToken }
};

// POST /api/v1/users/register
export const signupUser = async (data) => {
  const res = await axiosInstance.post("/api/v1/users/register", data);
  return res.data.data;
};

// GET /api/v1/users/verify-email?token=xxx  (query param, not path param)
export const verifyEmail = async (token) => {
  const res = await axiosInstance.get(`/api/v1/users/verify-email?token=${token}`);
  return res.data;
};

// POST /api/v1/users/forgot-password
export const forgotPassword = async (email) => {
  const res = await axiosInstance.post("/api/v1/users/forgot-password", { email });
  return res.data;
};

// POST /api/v1/users/reset-password  (body: { token, newPassword })
export const resetPassword = async (token, newPassword) => {
  const res = await axiosInstance.post("/api/v1/users/reset-password", {
    token,
    newPassword,
  });
  return res.data;
};

// POST /api/v1/users/Logout
export const logoutUser = async () => {
  const res = await axiosInstance.post("/api/v1/users/Logout");
  return res.data;
};