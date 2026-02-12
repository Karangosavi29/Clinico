import { useState } from "react";
import { signupUser } from "../../api/authApi.js";

const Signup = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signupUser(form);
      setMessage("Registration successful. Please verify your email.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="w-96 p-6 shadow rounded">
        <h2 className="text-xl font-bold mb-4">Signup</h2>

        {message && <p className="text-green-600">{message}</p>}

        <input name="name" placeholder="Name" className="input" onChange={handleChange} />
        <input name="email" placeholder="Email" className="input" onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" className="input" onChange={handleChange} />

        <select name="role" className="input" onChange={handleChange}>
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
        </select>

        <button className="w-full bg-green-600 text-white p-2 mt-3">
          Signup
        </button>
      </form>
    </div>
  );
};

export default Signup;
