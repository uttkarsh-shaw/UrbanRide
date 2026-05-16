const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      default: null
    },

    pickup: {
      type: String,
      required: true,
      trim: true
    },

    drop: {
      type: String,
      required: true,
      trim: true
    },

    distance: {
      type: Number,
      default: 0,
      min: 0
    },

    estimatedFare: {
      type: Number,
      default: 0,
      min: 0
    },

    fare: {
      type: Number,
      default: 0
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "ongoing", "completed"],
      default: "pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ride", rideSchema);
