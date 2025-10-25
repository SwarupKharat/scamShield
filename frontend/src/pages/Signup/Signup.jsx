import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../../stores/authStore";

const Signup = () => {
  // Separate state for file objects and other fields.
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    address: "",
    password: "",
  });
  const [aadharFile, setAadharFile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  const { register } = useAuthStore();

  const handleAadharFile = (e) => {
    const file = e.target.files[0];
    if (file) setAadharFile(file);
  };

  const handlePhotoFile = (e) => {
    const file = e.target.files[0];
    if (file) setPhotoFile(file);
  };

  const validateFormData = () => {
    if (!formData.firstName.trim()) return toast.error("First name is required!");
    if (!formData.lastName.trim()) return toast.error("Last name is required!");
    if (!formData.email.trim()) return toast.error("Email is required!");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (!formData.mobile.trim()) return toast.error("Mobile number is required!");
    if (!aadharFile) return toast.error("Aadhar card is required!");
    if (!formData.address.trim()) return toast.error("Address is required!");
    if (!formData.password) return toast.error("Password is required!");
    if (formData.password.length < 6)
      return toast.error("Password must be at least 6 characters long!");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateFormData()) {
      // Create a FormData object for multipart/form-data sending.
      const data = new FormData();
      data.append("firstName", formData.firstName);
      data.append("lastName", formData.lastName);
      data.append("email", formData.email);
      data.append("mobile", formData.mobile);
      data.append("address", formData.address);
      data.append("password", formData.password);
      data.append("aadharCard", aadharFile); // Append the raw file
      data.append("photo", photoFile); // Append the raw file

      // Call register and pass the FormData object.
      register(data);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center bg-gray-100">
      <div className="lg:w-1/2 bg-white p-12 shadow-lg rounded-lg max-w-lg mx-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Signup</h1>
        <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            className="input input-bordered w-full"
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            className="input input-bordered w-full"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="input input-bordered w-full"
          />
          <input
            type="text"
            name="mobile"
            placeholder="Mobile"
            value={formData.mobile}
            onChange={(e) =>
              setFormData({ ...formData, mobile: e.target.value })
            }
            className="input input-bordered w-full"
          />
          <input
            type="file"
            name="aadharCard"
            placeholder="Upload Aadhar Card"
            onChange={handleAadharFile}
            className="file-input file-input-bordered w-full"
          />
          <input
            type="file"
            name="photo"
            placeholder="Upload Profile Photo"
            onChange={handlePhotoFile}
            className="file-input file-input-bordered w-full"
          />
          <textarea
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            className="textarea textarea-bordered w-full"
          ></textarea>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="input input-bordered w-full"
          />
          <button type="submit" className="btn btn-primary w-full">
            Sign Up
          </button>
        </form>
        <div className="mt-4 text-center">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="text-blue-500 hover:underline">
              Login
            </Link>
          </p>
        </div>
        <div className="mt-4 text-center">
          <p>
            Already registered? Check your account{" "}
            <Link to="/check-approval" className="text-blue-500 hover:underline">
              Approval
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
                className={`aspect-square rounded-2xl bg-primary/10 ${
                  i % 2 === 0 ? "animate-pulse" : ""
                }`}
              />
            ))}
          </div>
          <h2 className="text-2xl font-bold mb-4">Welcome to Our Platform!</h2>
          <p className="text-base-container/60">
            Join our community and start reporting incidents easily.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
