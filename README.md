# 🏥 Clinico — Doctor Appointment Management System

A full-stack **MERN** web application for booking and managing doctor appointments, featuring role-based dashboards for Admins, Doctors, and Patients.

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure login, signup, token refresh, and logout
- 📧 **Email Verification** — Verify accounts via email on registration
- 🔑 **Password Reset** — Forgot password flow with email-based reset link
- 👥 **Role-Based Dashboards** — Separate views for Admin, Doctor, and Patient
- 📅 **Appointment Management** — Book, reschedule, approve, and cancel appointments
- 🩺 **Doctor Management** — Admin can add, update, and remove doctors
- ⭐ **Reviews & Ratings** — Patients can leave reviews for doctors
- 🕐 **Availability Management** — Doctors can manage their available time slots
- 🛡️ **Protected Routes** — Route guards based on user roles

---

## 🛠️ Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React (Vite), Tailwind CSS, React Router, Axios |
| Backend    | Node.js, Express.js                     |
| Database   | MongoDB, Mongoose                       |
| Auth       | JWT (Access + Refresh Tokens)           |
| Email      | Nodemailer                              |

---

## 📁 Project Structure

```
clinico/
├── backend/
│   ├── controllers/        # Route handler logic
│   ├── middleware/         # Auth, role-based access, asyncHandler
│   ├── models/             # Mongoose schemas (User, Doctor, Patient, Appointment, Review)
│   ├── routes/             # Express route definitions
│   ├── utils/              # Email helpers, token utilities
│   └── server.js           # App entry point
│
└── frontend/
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── context/        # Auth context & state management
    │   ├── pages/          # Role-based dashboard pages
    │   ├── routes/         # Protected route wrappers
    │   └── api/            # Axios instance & API calls
    └── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/Karangosavi29/Clinico.git
cd Clinico
```

### 2. Set Up the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory (see [Environment Variables](#environment-variables)).

```bash
npm run dev
```

### 3. Set Up the Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## ⚙️ Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=your_mongodb_connection_string

# JWT
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password

# Client
CLIENT_URL=http://localhost:5173
```

> **Note:** Never commit your `.env` file. Add it to `.gitignore`.

---

## 🔑 User Roles

| Role    | Capabilities |
|---------|-------------|
| **Admin**   | Manage doctors, view all appointments, approve/reschedule/cancel bookings |
| **Doctor**  | View assigned appointments, manage availability, view patient reviews |
| **Patient** | Book appointments, view history, cancel bookings, leave reviews |

---

## 🗺️ API Overview

| Module         | Base Route              |
|----------------|-------------------------|
| Auth           | `/api/auth`             |
| Users          | `/api/users`            |
| Doctors        | `/api/doctors`          |
| Appointments   | `/api/appointments`     |
| Reviews        | `/api/reviews`          |

---

## 🔮 Future Improvements

- [ ] Real-time notifications (Socket.io)
- [ ] Video consultation integration
- [ ] Payment gateway for appointment booking
- [ ] Doctor profile pages with full bio and specialization
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard for admins
- [ ] Multi-language support

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository, create a feature branch, and open a pull request.

```bash
git checkout -b feature/your-feature-name
git commit -m "feat: describe your change"
git push origin feature/your-feature-name
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  Built with ❤️ by <a href="https://github.com/Karangosavi29">Karangosavi29</a>
</div>
