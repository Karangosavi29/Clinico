import mongoose from "mongoose";
import dotenv from "dotenv";
import { DB_NAME } from "./constants.js";
import { User } from "./models/user.Model.js";
import { Doctor } from "./models/doctor.Model.js";
import { Review } from "./models/review.Model.js";

dotenv.config({ path: "./.env" });

const doctorsToSeed = [
  {
    name: "Priya Sharma",
    email: "priya.sharma@clinico.test",
    password: "Password123!",
    specialization: "Cardiologist",
    experience: 8,
    availability: [
      { day: "Monday", slots: ["10:00", "11:00", "14:00"] },
      { day: "Wednesday", slots: ["09:00", "10:00"] },
    ],
  },
  {
    name: "Arjun Mehta",
    email: "arjun.mehta@clinico.test",
    password: "Password123!",
    specialization: "Neurologist",
    experience: 12,
    availability: [
      { day: "Tuesday", slots: ["11:00", "12:00"] },
      { day: "Thursday", slots: ["15:00", "16:00"] },
    ],
  },
  {
    name: "Sneha Kapoor",
    email: "sneha.kapoor@clinico.test",
    password: "Password123!",
    specialization: "Pediatrician",
    experience: 5,
    availability: [
      { day: "Monday", slots: ["09:00", "09:30"] },
      { day: "Friday", slots: ["10:00", "10:30", "11:00"] },
    ],
  },
  {
    name: "Rohan Verma",
    email: "rohan.verma@clinico.test",
    password: "Password123!",
    specialization: "Dermatologist",
    experience: 6,
    availability: [
      { day: "Wednesday", slots: ["13:00", "13:30"] },
      { day: "Saturday", slots: ["10:00", "11:00"] },
    ],
  },
];

const patientsToSeed = [
  {
    name: "Fatima Khan",
    email: "fatima.khan@clinico.test",
    password: "Password123!",
  },
  {
    name: "Sunita Malhotra",
    email: "sunita.malhotra@clinico.test",
    password: "Password123!",
  },
];

const adminsToSeed = [
  {
    name: "Admin User",
    email: "admin@clinico.test",
    password: "Password123!",
  },
];

// References by email — resolved to real ObjectIds after users/doctors exist
const reviewsToSeed = [
  {
    doctorEmail: "priya.sharma@clinico.test",
    patientEmail: "fatima.khan@clinico.test",
    rating: 5,
    comment: "Dr. Sharma was incredibly thorough and explained everything clearly. Highly recommend!",
  },
  {
    doctorEmail: "priya.sharma@clinico.test",
    patientEmail: "sunita.malhotra@clinico.test",
    rating: 5,
    comment: "Found the perfect specialist within minutes. The review system helped me choose confidently.",
  },
  {
    doctorEmail: "arjun.mehta@clinico.test",
    patientEmail: "fatima.khan@clinico.test",
    rating: 4,
    comment: "Booking was easy and the doctor was very knowledgeable about my condition.",
  },
  {
    doctorEmail: "sneha.kapoor@clinico.test",
    patientEmail: "sunita.malhotra@clinico.test",
    rating: 5,
    comment: "Wonderful with kids and very patient. My daughter felt comfortable right away.",
  },
];

const seed = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URL}/${DB_NAME}`
    );
    console.log(`MongoDB connected !! DB Host: ${connectionInstance.connection.host}`);

    // ── Doctors ──────────────────────────────────────────
    for (const d of doctorsToSeed) {
      const existingUser = await User.findOne({ email: d.email });
      if (existingUser) {
        console.log(`Skipping doctor ${d.email} — already exists`);
        continue;
      }

      const user = await User.create({
        name: d.name,
        email: d.email,
        password: d.password,
        role: "doctor",
        emailVerified: true,
      });

      await Doctor.create({
        userId: user._id,
        specialization: d.specialization,
        experience: d.experience,
        availability: d.availability,
      });

      console.log(`Created doctor: ${d.name} (${d.specialization})`);
    }

    // ── Patients ─────────────────────────────────────────
    for (const p of patientsToSeed) {
      const existingUser = await User.findOne({ email: p.email });
      if (existingUser) {
        console.log(`Skipping patient ${p.email} — already exists`);
        continue;
      }

      await User.create({
        name: p.name,
        email: p.email,
        password: p.password,
        role: "patient",
        emailVerified: true,
      });

      console.log(`Created patient: ${p.name}`);
    }

    // ── Admins ───────────────────────────────────────────
    for (const a of adminsToSeed) {
      const existingUser = await User.findOne({ email: a.email });
      if (existingUser) {
        console.log(`Skipping admin ${a.email} — already exists`);
        continue;
      }

      await User.create({
        name: a.name,
        email: a.email,
        password: a.password,
        role: "admin",
        emailVerified: true,
      });

      console.log(`Created admin: ${a.name}`);
    }

    // ── Reviews ──────────────────────────────────────────
    for (const r of reviewsToSeed) {
      const doctorUser = await User.findOne({ email: r.doctorEmail });
      const patientUser = await User.findOne({ email: r.patientEmail });

      if (!doctorUser || !patientUser) {
        console.log(`Skipping review — could not find user for ${r.doctorEmail} or ${r.patientEmail}`);
        continue;
      }

      const doctor = await Doctor.findOne({ userId: doctorUser._id });
      if (!doctor) {
        console.log(`Skipping review — no Doctor record for ${r.doctorEmail}`);
        continue;
      }

      const existingReview = await Review.findOne({
        doctorId: doctor._id,
        patientId: patientUser._id,
      });
      if (existingReview) {
        console.log(`Skipping review — ${r.patientEmail} already reviewed ${r.doctorEmail}`);
        continue;
      }

      await Review.create({
        doctorId: doctor._id,
        patientId: patientUser._id,
        rating: r.rating,
        comment: r.comment,
      });

      console.log(`Created review: ${r.patientEmail} → ${r.doctorEmail} (${r.rating}★)`);
    }

    console.log("Seeding complete.");
  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();