const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const protect = require("./middlewares/authMiddleware");
const driverRoutes = require("./routes/driverRoutes");
const rideRoutes = require("./routes/rideRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/driver", driverRoutes);
app.use("/api/rides", rideRoutes);

app.get("/api/profile", protect, (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user
  });
});


// health check
app.get("/", (req, res) => {
  res.send("API is running...");
});

module.exports = app;