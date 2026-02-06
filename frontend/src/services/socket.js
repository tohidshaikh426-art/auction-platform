import { io } from "socket.io-client";

// Get token from localStorage
const getToken = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.token || null;
  } catch {
    return null;
  }
};

// Create socket with authentication
const socket = io("http://localhost:5000", {
  auth: {
    token: getToken(),
  },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});

// Update token when it changes
socket.on("connect", () => {
  const token = getToken();
  if (token) {
    socket.auth.token = token;
  }
});

// Handle authentication errors
socket.on("error", (error) => {
  console.error("Socket error:", error);
});

export default socket;
