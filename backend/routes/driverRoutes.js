const express = require("express");
const router = express.Router();

const protect = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");

const {
  setAvailability,
  updateLocation
} = require("../controllers/driverController");


// 🚗 driver online/offline
router.patch(
  "/availability",
  protect,
  authorizeRoles("driver"),
  setAvailability
);


// 📍 driver location update
router.patch(
  "/location",
  protect,
  authorizeRoles("driver"),
  updateLocation
);


module.exports = router;