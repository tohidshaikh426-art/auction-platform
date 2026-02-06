import React, { useState, useEffect } from "react";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import BidderDashboard from "./pages/BidderDashboard";
import Navbar from "./components/Navbar";

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on mount
    try {
      const savedUser = JSON.parse(localStorage.getItem("user") || "null");
      if (savedUser && savedUser.token) {
        setUser(savedUser);
      }
    } catch (err) {
      console.error("Error loading user:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-gray-900">
        <div className="text-white text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar role={user.role} onLogout={handleLogout} />
      <main className="p-4">
        {user.role === "admin" ? (
          <AdminDashboard user={user} />
        ) : (
          <BidderDashboard user={user} />
        )}
      </main>
    </div>
  );
};

export default App;
