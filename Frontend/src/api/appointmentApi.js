import axiosInstance from "./axiosInstance";

// POST /api/v1/appointments — patient only
export const bookAppointment = async (data) => {
  // data: { doctorId, date, timeSlot, notes }
  const res = await axiosInstance.post("/api/v1/appointments", data);
  return res.data.data;
};

// GET /api/v1/appointments — role-based (patient sees own, doctor sees own, admin sees all)
export const getAppointments = async (params = {}) => {
  // params: { status, date, page, limit }
  const res = await axiosInstance.get("/api/v1/appointments", { params });
  return res.data.data;
};

// PUT /api/v1/appointments/:id — update (patient: date/timeSlot/notes, doctor: status, admin: all)
export const updateAppointment = async (id, data) => {
  const res = await axiosInstance.put(`/api/v1/appointments/${id}`, data);
  return res.data.data;
};

// PATCH /api/v1/appointments/:id — cancel
export const cancelAppointment = async (id) => {
  const res = await axiosInstance.patch(`/api/v1/appointments/${id}`);
  return res.data.data;
};

// POST /api/v1/appointments/:id/reschedule — patient / admin
export const rescheduleAppointment = async (id, data) => {
  // data: { date, timeSlot }
  const res = await axiosInstance.post(`/api/v1/appointments/${id}/reschedule`, data);
  return res.data.data;
};

// POST /api/v1/appointments/admin/:id/approve — admin only
export const approveAppointment = async (id) => {
  const res = await axiosInstance.post(`/api/v1/appointments/admin/${id}/approve`);
  return res.data.data;
};

// POST /api/v1/appointments/admin/:id/cancel — admin only
export const cancelAppointmentAdmin = async (id) => {
  const res = await axiosInstance.post(`/api/v1/appointments/admin/${id}/cancel`);
  return res.data.data;
};