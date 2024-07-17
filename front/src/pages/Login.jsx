import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import Logo from "../img/white logo.png"; // Adjust the path as needed

const Login = () => {
  const [inputs, setInputs] = useState({
    email: "",
    password: ""
  });

  const [err, setError] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(inputs);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="bg-white p-8 rounded-lg w-full max-w-md text-center">
        <img src={Logo} alt="Logo" className="mx-auto mb-6 h-32"/>
        <h1 className="text-3xl font-bold mb-6">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            type="email"
            placeholder="Email"
            name="email"
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          <input
            required
            type="password"
            placeholder="Password"
            name="password"
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 transition duration-200"
          >
            Login
          </button>
          {err && <p className="text-red-500 text-sm mt-2">{err}</p>}
          <span className="block mt-4">
            Don't have an account? <Link to="/register" className="text-blue-500 hover:underline ">Register</Link>
          </span>
        </form>
      </div>
    </div>
  );
};

export default Login;
