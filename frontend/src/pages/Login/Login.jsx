import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import toast from "react-hot-toast";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { isLoggingIn, login } = useAuthStore();

  const formValidator = () => {
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Invalid email format");
      return false;
    }
    if (!formData.password) {
      toast.error("Password is required!");
      return false;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long!");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = formValidator();
    if (isValid) {
      login(formData);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center bg-gray-100">
      <div className="lg:w-1/2 bg-white p-12 shadow-lg rounded-lg max-w-lg mx-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="input input-bordered w-full"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="input input-bordered w-full"
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <button 
            type="submit" 
            className={`btn btn-primary w-full ${isLoggingIn ? "loading" : ""}`} 
            disabled={isLoggingIn}
          >
            Log In
          </button>
        </form>
        <div className="mt-4 text-center">
          <p>
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-500 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
      <div className="hidden lg:flex items-center justify-center bg-base-200 p-12 lg:w-1/2">
        <div className="max-w-md text-center">
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className={`aspect-square rounded-2xl bg-primary/10 ${i % 2 === 0 ? "animate-pulse" : ""}`}
              />
            ))}
          </div>
          <h2 className="text-2xl font-bold mb-4">Welcome Back!</h2>
          <p className="text-base-container/60">
            Log in to continue and access all the features.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
