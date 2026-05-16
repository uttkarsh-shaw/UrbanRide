const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      select: false
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    location: {
      lat: Number,
      lng: Number
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Driver", driverSchema);
