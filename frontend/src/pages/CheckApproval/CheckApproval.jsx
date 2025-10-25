import React, { useState } from "react";
import { useAuthStore } from "../../stores/authStore";
import toast from "react-hot-toast";

function CheckApproval() {
  const [email, setEmail] = useState("");
  const { checkApproval, isCheckingApproval } = useAuthStore();

  const validator = () => {
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Invalid email format");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validator()) {
      await checkApproval({ email });
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center bg-gray-100">
      <div className="lg:w-1/2 bg-white p-12 shadow-lg rounded-lg max-w-lg mx-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Check Approval</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="input input-bordered w-full"
            required
          />
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isCheckingApproval}
          >
            {isCheckingApproval ? "Checking..." : "Check Approval"}
          </button>
        </form>
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
          <h2 className="text-2xl font-bold mb-4">Check Your Approval Status</h2>
          <p className="text-base-container/60">
            Enter your registered email to check if your account is approved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default CheckApproval;
