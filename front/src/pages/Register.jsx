import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useApi } from "../context/ApiContext";
import Logo from "../img/white logo.png"; // Adjust the path as needed

const Register = () => {
  const [inputs, setInputs] = useState({
    username: "",
    email: "",
    password: ""
  });
  const [err, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const apiUrl = useApi();

  const navigate = useNavigate();

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateInputs = () => {
    const { username, email, password } = inputs;
    if (!username || !email || !password) {
      return "All fields are required.";
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return "Please enter a valid email address.";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters long.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${apiUrl}/api/auth/register`, inputs);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="bg-white p-8 rounded-lg w-full max-w-md text-center">
        <img src={Logo} alt="Logo" className="mx-auto mb-6 h-32" />
        <h1 className="text-3xl font-bold mb-6">Register</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            type="text"
            placeholder="Username"
            name="username"
            value={inputs.username}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          <input
            required
            type="email"
            placeholder="Email"
            name="email"
            value={inputs.email}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          <input
            required
            type="password"
            placeholder="Password"
            name="password"
            value={inputs.password}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 transition duration-200"
          >
            {loading ? "Registering..." : "Register"}
          </button>
          {err && <p className="text-red-500 text-sm mt-2">{err}</p>}
          <span className="block mt-4">
            Do you have an account? <Link to="/login" className="text-blue-500 hover:underline">Login</Link>
          </span>
        </form>
      </div>
    </div>
  );
};

export default Register;
