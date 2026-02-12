import axiosInstance from "./axiosInstance";

const loginUser=async(data) =>{
    const res=await axiosInstance.post("auth/login",data)
    return res.data
}

const signup =async(data) => {
    const res=await axiosInstance.post("auth/register",data)
    return res.data;
}

const verifyEmail = async (token) => {
  const res = await axiosInstance.get(`/auth/verify-email/${token}`);
  return res.data;
};

const forgotPassword = async (email) => {
  const res = await axiosInstance.post("/auth/forgot-password", { email });
  return res.data;
};

const resetPassword = async (token, password) => {
  const res = await axiosInstance.post(`/auth/reset-password/${token}`, {
    password,
  });
  return res.data;
};


export {
    loginUser,
    signup,
    verifyEmail,
    forgotPassword,
    resetPassword
}