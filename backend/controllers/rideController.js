const Ride = require("../models/ride");
const Driver = require("../models/driver");
const mongoose = require("mongoose");
const { users } = require("../socket/socket");

const BASE_FARE = 50;
const RATE_PER_KM = 12;
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const geocodeCache = new Map();

const sendRideUpdate = (userId, eventName, payload) => {
  const userSocket = users[userId?.toString()];

  if (userSocket && global.io) {
    global.io.to(userSocket).emit(eventName, payload);
  }
};

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const calculateEstimatedFare = (distance) => {
  return Math.round(BASE_FARE + distance * RATE_PER_KM);
};

const toRadians = (value) => {
  return (value * Math.PI) / 180;
};

const calculateDistanceInKm = (start, end) => {
  const earthRadiusKm = 6371;
  const latDifference = toRadians(end.lat - start.lat);
  const lonDifference = toRadians(end.lon - start.lon);

  const a =
    Math.sin(latDifference / 2) * Math.sin(latDifference / 2) +
    Math.cos(toRadians(start.lat)) *
      Math.cos(toRadians(end.lat)) *
      Math.sin(lonDifference / 2) *
      Math.sin(lonDifference / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((earthRadiusKm * c).toFixed(2));
};

const geocodeLocation = async (location) => {
  const cacheKey = location.toLowerCase();

  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey);
  }

  const searchParams = new URLSearchParams({
    q: location,
    format: "json",
    limit: "1"
  });

  const response = await fetch(`${NOMINATIM_URL}?${searchParams.toString()}`, {
    headers: {
      "User-Agent": "UberCloneLearningProject/1.0",
      "Accept-Language": "en"
    }
  });

  if (!response.ok) {
    throw new Error("Location service is unavailable");
  }

  const results = await response.json();
  const firstResult = results[0];

  if (!firstResult) {
    return null;
  }

  const coordinates = {
    lat: Number(firstResult.lat),
    lon: Number(firstResult.lon)
  };

  geocodeCache.set(cacheKey, coordinates);
  return coordinates;
};

const estimateRideFare = async (pickup, drop) => {
  const [pickupCoordinates, dropCoordinates] = await Promise.all([
    geocodeLocation(pickup),
    geocodeLocation(drop)
  ]);

  if (!pickupCoordinates || !dropCoordinates) {
    return null;
  }

  const distance = calculateDistanceInKm(pickupCoordinates, dropCoordinates);
  const estimatedFare = calculateEstimatedFare(distance);

  return {
    distance,
    estimatedFare,
    baseFare: BASE_FARE,
    ratePerKm: RATE_PER_KM
  };
};

const estimateRide = async (req, res) => {
  try {
    const pickup = req.body.pickup?.trim();
    const drop = req.body.drop?.trim();

    if (!pickup || !drop) {
      return res.status(400).json({
        success: false,
        message: "Pickup and drop are required"
      });
    }

    const estimate = await estimateRideFare(pickup, drop);

    if (!estimate) {
      return res.status(404).json({
        success: false,
        message: "Could not find one or both locations"
      });
    }

    return res.json({
      success: true,
      estimate
    });
  } catch (error) {
    console.error("Estimate ride error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to estimate fare right now"
    });
  }
};

const createRide = async (req, res) => {
  try {
    const pickup = req.body.pickup?.trim();
    const drop = req.body.drop?.trim();

    if (!pickup || !drop) {
      return res.status(400).json({
        success: false,
        message: "Pickup and drop are required"
      });
    }

    const estimate = await estimateRideFare(pickup, drop);

    if (!estimate) {
      return res.status(404).json({
        success: false,
        message: "Could not calculate distance for these locations"
      });
    }

    const ride = await Ride.create({
      pickup,
      drop,
      distance: estimate.distance,
      estimatedFare: estimate.estimatedFare,
      fare: estimate.estimatedFare,
      status: "pending",
      user: req.user._id,
      driver: null
    });

    const populatedRide = await Ride.findById(ride._id).populate(
      "user",
      "name email"
    );

    return res.status(201).json({
      success: true,
      message: "Ride request created successfully",
      ride: populatedRide
    });
  } catch (error) {
    console.error("Create ride error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const getPendingRides = async (req, res) => {
  try {
    const rides = await Ride.find({ status: "pending" })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      rides
    });
  } catch (error) {
    console.error("Pending rides error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const acceptRide = async (req, res) => {
  try {
    const { rideId } = req.body;

    if (!rideId || !isValidId(rideId)) {
      return res.status(400).json({
        success: false,
        message: "Valid ride id is required"
      });
    }

    const ride = await Ride.findOneAndUpdate(
      { _id: rideId, status: "pending" },
      {
        status: "accepted",
        driver: req.user._id
      },
      { new: true, runValidators: true }
    );

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found or already unavailable"
      });
    }

    await Driver.findByIdAndUpdate(
      req.user._id,
      {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        isAvailable: false
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const populatedRide = await Ride.findById(ride._id)
      .populate("user", "name email")
      .populate("driver", "name email");

    sendRideUpdate(populatedRide.user?._id || populatedRide.user, "ride_accepted", {
      message: "Ride accepted",
      ride: populatedRide
    });

    return res.json({
      success: true,
      message: "Ride accepted",
      ride: populatedRide
    });
  } catch (error) {
    console.error("Accept ride error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const deleteRide = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Valid ride id is required"
      });
    }

    const ride = await Ride.findOneAndDelete({
      _id: req.params.id,
      status: "pending"
    });

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found or already unavailable"
      });
    }

    sendRideUpdate(ride.user, "ride_deleted", {
      message: "Ride request was rejected",
      rideId: ride._id
    });

    return res.json({
      success: true,
      message: "Ride deleted successfully",
      rideId: ride._id
    });
  } catch (error) {
    console.error("Delete ride error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const getUserRides = async (req, res) => {
  try {
    const rides = await Ride.find({ user: req.user._id })
      .populate("driver", "name email")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      rides
    });
  } catch (error) {
    console.error("User rides error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const getDriverRides = async (req, res) => {
  try {
    const rides = await Ride.find({ driver: req.user._id })
      .populate("user", "name email")
      .populate("driver", "name email")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      rides
    });
  } catch (error) {
    console.error("Driver rides error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const completeRide = async (req, res) => {
  try {
    const { rideId } = req.body;

    if (!rideId || !isValidId(rideId)) {
      return res.status(400).json({
        success: false,
        message: "Valid ride id is required"
      });
    }

    const ride = await Ride.findOne({
      _id: rideId,
      status: "accepted",
      driver: req.user._id
    });

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Accepted ride not found"
      });
    }

    ride.status = "completed";
    ride.fare = req.body.fare || ride.estimatedFare || ride.fare || 100;
    await ride.save();
    await ride.populate("user", "name email");
    await ride.populate("driver", "name email");

    await Driver.findByIdAndUpdate(req.user._id, { isAvailable: true });

    sendRideUpdate(ride.user?._id || ride.user, "ride_completed", {
      message: "Ride completed",
      ride
    });

    return res.json({
      success: true,
      message: "Ride completed",
      ride
    });
  } catch (error) {
    console.error("Complete ride error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const getAvailableDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find({ isAvailable: true });

    return res.json({
      success: true,
      drivers
    });
  } catch (error) {
    console.error("Available drivers error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  estimateRide,
  createRide,
  getPendingRides,
  acceptRide,
  deleteRide,
  getUserRides,
  getDriverRides,
  completeRide,
  getAvailableDrivers
};
