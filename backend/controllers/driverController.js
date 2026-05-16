const Driver = require("../models/driver");

const setAvailability = async (req, res) => {
  try {
    if (typeof req.body.isAvailable !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Availability must be true or false"
      });
    }

    const { isAvailable } = req.body;

    const driver = await Driver.findByIdAndUpdate(
      req.user._id,
      {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        isAvailable
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({
      success: true,
      message: "Availability updated",
      driver
    });
  } catch (error) {
    console.error("Availability error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required"
      });
    }

    const driver = await Driver.findByIdAndUpdate(
      req.user._id,
      {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        location: { lat, lng }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({
      success: true,
      message: "Location updated",
      driver
    });
  } catch (error) {
    console.error("Location error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  setAvailability,
  updateLocation
};
