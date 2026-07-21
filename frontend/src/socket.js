import { io } from "socket.io-client";

console.log("Socket file loaded");

const token = localStorage.getItem("token");

const socket = io(import.meta.env.VITE_API_URL.replace("/api", ""), {
  auth: {
    token
  },
  transports: ["websocket"]
});

socket.on("connect", () => {
  console.log("Connected to backend socket", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("Socket Authentication Failed:", err.message);
});

export default socket;