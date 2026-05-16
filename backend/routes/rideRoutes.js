const express = require("express");
const protect = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");

const {
  estimateRide,
  createRide,
  getPendingRides,
  acceptRide,
  deleteRide,
  getUserRides,
  getDriverRides,
  completeRide,
  getAvailableDrivers
} = require("../controllers/rideController");

const router = express.Router();

router.post("/estimate", protect, authorizeRoles("user"), estimateRide);
router.post("/create", protect, authorizeRoles("user"), createRide);
router.get("/pending", protect, authorizeRoles("driver"), getPendingRides);
router.post("/accept", protect, authorizeRoles("driver"), acceptRide);
router.delete("/delete/:id", protect, authorizeRoles("driver"), deleteRide);
router.get("/my-rides", protect, authorizeRoles("user"), getUserRides);

router.get("/driver-rides", protect, authorizeRoles("driver"), getDriverRides);
router.patch("/complete", protect, authorizeRoles("driver"), completeRide);
router.get("/drivers", protect, authorizeRoles("user"), getAvailableDrivers);

module.exports = router;
