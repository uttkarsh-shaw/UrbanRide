// socket/socket.js

// 🔥 userId → socketId mapping store karega
const users = {};

// 🔥 socket setup function
const setupSocket = (io) => {

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // ================= JOIN =================
    // frontend se userId bhejna hoga
    socket.on("join", (userId) => {
      users[userId] = socket.id;
      console.log(`User ${userId} joined with socket ${socket.id}`);
    });

    // ================= DISCONNECT =================
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      // mapping remove karo
      for (let userId in users) {
        if (users[userId] === socket.id) {
          delete users[userId];
          break;
        }
      }
    });
  });

};

module.exports = { setupSocket, users };