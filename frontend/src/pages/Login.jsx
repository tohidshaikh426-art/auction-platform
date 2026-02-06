import React, { useState } from "react";
import { FaGavel, FaUserTie } from "react-icons/fa";

const Login = ({ onLogin }) => {
  const [credential, setCredential] = useState("");
  const [role, setRole] = useState("bidder");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate input
      if (!credential.trim()) {
        setError("Please enter your details");
        setLoading(false);
        return;
      }

      // For admin, check if correct credential
      if (role === "admin" && credential.trim() !== "ITCS Committee") {
        setError("Invalid admin credential");
        setLoading(false);
        return;
      }

      // Make request to backend
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: credential.trim(),
          role: role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      // Save user data with token
      localStorage.setItem("user", JSON.stringify({
        id: data.user.id,
        username: data.user.username,
        role: data.user.role,
        wallet: data.user.wallet,
        token: data.token,
      }));

      onLogin(data.user);
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800">
      <div className="bg-white/90 rounded-2xl shadow-2xl p-10 text-center max-w-md w-full">
        <FaGavel className="mx-auto text-5xl text-blue-700 mb-4 animate-bounce" />
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">HOUSE OF WOLVES</h1>
        <p className="text-gray-600 mb-6">Sign in to join the bidding!</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-6 mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="bidder"
                checked={role === "bidder"}
                onChange={() => {
                  setRole("bidder");
                  setCredential("");
                  setError("");
                }}
                disabled={loading}
                className="accent-blue-600"
              />
              <FaUserTie className="text-blue-600" /> Bidder
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="admin"
                checked={role === "admin"}
                onChange={() => {
                  setRole("admin");
                  setCredential("");
                  setError("");
                }}
                disabled={loading}
                className="accent-green-600"
              />
              <FaGavel className="text-green-600" /> Admin
            </label>
          </div>

          <div>
            <input
              type="text"
              placeholder={
                role === "admin"
                  ? "Admin Credential"
                  : "Your CC Name/Code"
              }
              value={credential}
              onChange={(e) => setCredential(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg disabled:opacity-50"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm font-semibold">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-900 text-white font-bold rounded-xl shadow-lg transition duration-200 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {role === "admin" && (
            <p className="text-xs text-gray-500 italic">
              Admin credential is confidential
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
