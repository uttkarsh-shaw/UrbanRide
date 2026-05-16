const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Driver = require("../models/driver");
const generateToken = require("../utils/generateToken");

const toAuthUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role
});

const syncDriverProfile = async (user) => {
  if (user.role !== "driver") {
    return;
  }

  await Driver.findByIdAndUpdate(
    user._id,
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAvailable: true
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const role = req.body.role === "driver" ? "driver" : "user";

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role
    });

    await syncDriverProfile(user);

    return res.status(201).json({
      success: true,
      message: "User registered",
      token: generateToken(user._id),
      user: toAuthUser(user)
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    await syncDriverProfile(user);

    return res.json({
      success: true,
      message: "Login successful",
      token: generateToken(user._id),
      user: toAuthUser(user)
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  registerUser,
  loginUser
};
